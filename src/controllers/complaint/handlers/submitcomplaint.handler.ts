import transporter from "@config/email";
import { TComplaint } from "@interfaces/complaint.interfaces";
import cloudinaryUpload from "@utils/cloudinary";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import match from "@utils/match.util";
import { NextFunction, Request, Response } from "express";
import translateError from "helpers/mongo_helper";
import complaintModel from "models/complaint.model";
import User from "models/user.model";

/**
 * @desc Users submit complaint request using this endpoint.
 * @api {post} /api/complaint
 * @param req
 * @param res
 * @param next
 */

const submitComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body.data as string;

  let data: TComplaint;

  if (body) {
    data = JSON.parse(body);
  } else {
    data = {} as TComplaint;
  }

  const sender = req.user._id;

  const user = await User.findOne({ _id: req.user._id }).exec();

  // Validate fields before attempting insertion.
  if (!sender) {
    return next(
      new CustomException(401, "You must be logged in to submit a complaint.", {
        error: true,
        path: "submit a complaint",
      })
    );
  }

  if (!user)
    return next(
      new CustomException(400, "No user found!", {
        reason: "account not found",
        alias: "acc_not_found",
        code: "ACC_ERR_01",
      })
    );

  const validate = match.obj(data, ["subject", "details"]);

  if (validate !== true) {
    return next(
      new CustomException(
        400,
        "One or more required fields are missing.",
        validate
      )
    );
  }

  let complaint = new complaintModel({
    subject: data.subject,
    details: data.details,
    sender: sender,
    category: data.category,
    receiver: data.receiver,
    priority: data.priority,
    anonymity: data.anonymity,
  });

  // Upload image to cloudinary
  let imageUrls: string[] = [];

  const cloudinaryFolder = `${user.email}-${user._id}`;

  const attachments = req.files as unknown as Express.Multer.File[];

  if (attachments) {
    let multipleAttachments = attachments.map(
      async (attachment) =>
        await cloudinaryUpload(attachment.path, cloudinaryFolder)
          .then(async (downloadURL) => {
            imageUrls.push(downloadURL);
          })
          .catch((error) => {
            console.error(error);
          })
    );

    await Promise.all(multipleAttachments)
      .then(async (_) => {
        complaint = new complaintModel({
          subject: data.subject,
          details: data.details,
          images: imageUrls,
          sender: sender,
          category: data.category,
          receiver: data.receiver,
          priority: data.priority,
          anonymity: data.anonymity,
        });

        await complaint
          .save()
          .then((response) =>
            new CustomResponse(res).success(
              "Complaint submitted successfully.",
              response,
              200,
              {
                success: true,
                path: "submit a complaint",
              }
            )
          )
          .catch((err) =>
            next(new CustomException(500, translateError(err).toString()))
          );
      })
      .catch((err) =>
        next(
          new CustomException(500, "Images failed to upload. Try again.", {
            err,
          })
        )
      );
  } else {
    await complaint
      .save()
      .then((response) =>
        new CustomResponse(res).success(
          "Complaint submitted successfully.",
          response,
          200,
          {
            success: true,
            path: "submit a complaint",
          }
        )
      )
      .catch((err) =>
        next(new CustomException(500, translateError(err).toString()))
      );
  }

  const msg = `<p>Hello, ${data.receiver}</p>
              <p>You just received a complaint from someone (${user.email}) in your institution</p>
              <p>The subject of their complaint is "${data.subject}".
              <br>Please login to your dashboard to respond to their complaint.</br>
              </p>
              <p>This email is intended for ${data.receiver}. If you are not the one, please ignore and delete.</p>
  `;

  if (data.receiver) {
    transporter(data.receiver, "VoiceOut - You just received a complaint", msg)
      .then((data: any) => {
        console.log("Complaint email sent", data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
};

export { submitComplaint };
