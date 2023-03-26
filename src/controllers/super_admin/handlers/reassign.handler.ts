import transporter from "@config/email";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { Request, Response, NextFunction } from "express";
import translateError from "helpers/mongo_helper";
import complaintModel from "models/complaint.model";
import userModel from "models/user.model";
import { isValidObjectId, Types } from "mongoose";

/**
 * @desc The super admin uses this endpoint to reassign a complaint to an admin
 * @api {POST} /superadmin/reassign
 * @access public
 * @param req
 * @param res
 * @param next
 */

const reassignComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { complaintId, recipient }: { complaintId: string; recipient: string } =
    req.body;

  if (!complaintId || !recipient) {
    return next(
      new CustomException(
        400,
        "You must provide a complaintId and a recipient",
        {
          status: false,
          path: "/superadmin/reassign",
        }
      )
    );
  }

  let validComplaintId: string | Types.ObjectId;

  if (isValidObjectId(complaintId)) {
    validComplaintId = complaintId;
  } else {
    validComplaintId = new Types.ObjectId(complaintId);
  }

  const complaint = await complaintModel
    .findById(validComplaintId)
    .populate("sender", "firstname lastname email")
    .exec();

  if (!complaint) {
    return next(
      new CustomException(
        400,
        "This complaint does not exist. It may have been deleted.",
        {
          status: false,
          path: "/superadmin/reassign",
        }
      )
    );
  }

  const admin = await userModel
    .findOne({ email: recipient, role: { type: "admin", id: 0 } })
    .exec();

  if (!admin) {
    return next(
      new CustomException(
        400,
        "We do not recognize the recipient or they are not an admin in your university",
        {
          status: false,
          path: "/superadmin/reassign",
        }
      )
    );
  }

  await complaintModel
    .updateOne(
      { _id: validComplaintId },
      { $set: { reassigned_to: recipient } },
      { new: true }
    )
    .exec()
    .then((_) => {
      const msg = `<p>Hello, ${admin.firstname || ""}</p>
                <p>You have been reassigned a complaint by the admin officer in your institution.
                 The complaint was originally submitted by ${
                   (complaint.sender as any).email
                 } in your institution</p>
                <p>The subject of their complaint is "${complaint.subject}".
                <br>Please login to your dashboard to respond to their complaint.</br>
                </p>
                <p>This email is intended for ${
                  complaint.reassigned_to
                }. If you are not the one, please ignore and delete.</p>
    `;

      transporter(recipient, "VoiceOut - You just received a complaint", msg)
        .then((data: any) => {
          console.log("Complaint email sent", data);
        })
        .catch((err: any) => {
          console.error(err);
        });

      return next(
        new CustomResponse(res).success(
          "Complaint reassigned successfully",
          {},
          200,
          {
            success: true,
            path: "/superadmin/reassign",
          }
        )
      );
    })
    .catch((err) =>
      next(
        new CustomException(500, translateError(err).toString(), {
          status: false,
          path: "/superadmin/reassign",
          source: "database error",
        })
      )
    );
};

export default reassignComplaint;
