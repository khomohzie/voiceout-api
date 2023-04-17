import adminModel from "@models/admin.model";
import complaintModel from "@models/complaint.model";
import superadminModel from "@models/superadmin.model";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";
import { validateId } from "helpers/helpers";

/**
 * @desc The super admin and admins use this endpoint to update a complaint's status.
 * @api {PATCH} /complaints/status/:id
 * @access public
 * @param req
 * @param res
 * @param next
 */

const updateComplaintStatus =
  (model: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newStatus }: { newStatus: string } = req.body;

      if (!newStatus) {
        return next(
          new CustomException(400, "The new status is required", {
            success: false,
            path: "update complaint status /api/complaint/status/:id",
          })
        );
      }

      let admin;

      if (model === "admin") {
        admin = await adminModel.findOne({ _id: req.user._id }).exec();
      } else {
        admin = await superadminModel.findOne({ _id: req.user._id }).exec();
      }

      if (!admin) {
        return next(
          new CustomException(400, "Admin not found", {
            success: false,
            path: "update complaint status /api/complaint/status/:id",
          })
        );
      }

      const complaint = await complaintModel
        .findById(validateId(req.params.id))
        .exec();

      if (!complaint) {
        return next(
          new CustomException(
            400,
            "This complaint does not exist. It may have been deleted.",
            {
              status: false,
              path: "update complaint status /api/complaint/status/:id",
            }
          )
        );
      }

      await complaintModel
        .updateOne(
          { _id: req.params.id },
          { $set: { status: newStatus } },
          { new: true }
        )
        .then((_) => {
          return next(
            new CustomResponse(res).success(
              "Complaint status updated successfully",
              {},
              200,
              {
                success: true,
                path: "update complaint status /api/complaint/status/:id",
              }
            )
          );
        })
        .catch((err) => {
          return next(
            new CustomException(500, "Error updating complaint status.", {
              status: false,
              path: "update complaint status /api/complaint/status/:id",
            })
          );
        });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

export default updateComplaintStatus;
