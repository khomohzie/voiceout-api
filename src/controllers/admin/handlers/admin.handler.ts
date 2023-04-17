import adminModel from "@models/admin.model";
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

const adminList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModel.findOne({ _id: req.user._id }).exec();

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

export { adminList };
