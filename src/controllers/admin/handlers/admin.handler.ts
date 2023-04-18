import adminModel from "@models/admin.model";
import complaintModel from "@models/complaint.model";
import superadminModel from "@models/superadmin.model";
import userModel from "@models/user.model";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";

/**
 * @desc List of administrators in a particular university.
 * @api {GET} /api/admin/list
 * @param req
 * @param res
 * @param next
 */

const adminList =
  (model: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user;

      if (model === "user") {
        user = await userModel.findOne({ _id: req.user._id }).exec();
      } else {
        user = await superadminModel.findOne({ _id: req.user._id }).exec();
      }

      if (!user) {
        return next(
          new CustomException(400, "User not found", {
            success: false,
            path: "list of admins /api/admin/list",
          })
        );
      }

      let allAdmins: any = [];

      const admins = await adminModel
        .find({ university: user.university })
        .then((data) => {
          data.map((admin) => {
            allAdmins.push(admin);
          });
        })
        .catch((err) => {
          return next(
            new CustomException(500, "Could not retrieve list from database", {
              success: false,
              path: "list of admins => catch block1 /api/admin/list",
            })
          );
        });

      const superadmin = await superadminModel
        .findOne({ university: user.university })
        .then((data) => {
          if (data !== null) {
            allAdmins.push(data);
          }
        })
        .catch((err) => {
          return next(
            new CustomException(500, "Could not retrieve list from database", {
              success: false,
              path: "list of admins => catch block2 /api/admin/list",
            })
          );
        });

      if (allAdmins.length <= 0) {
        return next(
          new CustomResponse(res).success(
            "There are no admins in your university",
            {},
            200,
            {
              success: true,
              path: "list of admins /api/admin/list",
            }
          )
        );
      } else {
        return next(
          new CustomResponse(res).success(
            "List of admins retrieved successfully",
            allAdmins,
            200,
            {
              success: true,
              path: "list of admins /api/admin/list",
            }
          )
        );
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

/**
 * @desc Administrators can retrieve complaints assigned to them.
 * @api {GET} /api/admin/complaints
 * @param req
 * @param res
 * @param next
 */

const getAssignedComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user._id }).exec();

    if (!admin) {
      return next(
        new CustomException(400, "Admin not found", {
          success: false,
          path: "retrieve assigned complaints /api/admin/complaints",
        })
      );
    }

    const complaints = await complaintModel
      .find({
        $or: [{ reassigned_to: admin.email }, { receiver: admin.email }],
      })
      .populate({ path: "sender", select: "firstname lastname email" })
      .exec();

    if (!complaints || complaints.length <= 0) {
      return next(
        new CustomResponse(res).success(
          "There are no complaints for you yet! Keep an eye out though.",
          {},
          200,
          {
            success: true,
            path: "retrieve assigned complaints /api/admin/complaints",
          }
        )
      );
    } else {
      return next(
        new CustomResponse(res).success(
          "Complaints retrieved successfully.",
          complaints,
          200,
          {
            success: true,
            path: "retrieve assigned complaints /api/admin/complaints",
          }
        )
      );
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export { adminList, getAssignedComplaints };
