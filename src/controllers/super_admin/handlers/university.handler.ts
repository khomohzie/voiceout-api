import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";
import { validateId } from "helpers/helpers";
import complaintModel from "models/complaint.model";
import superadminModel from "models/superadmin.model";

/**
 * @desc The super admin uses this endpoint to reassign a complaint to an admin
 * @api {GET} /superadmin/complaints
 * @access public
 * @param req
 * @param res
 * @param next
 */

const retrieveAllComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const superAdmin = await superadminModel
    .findById(validateId(req.user._id))
    .exec();

  const allComplaints = await complaintModel
    .find({ university: superAdmin?.university })
    .exec();

  if (allComplaints.length < 1) {
    return next(
      new CustomResponse(res).success(
        "No complaints at the moment. keep an eye out though.",
        {},
        200,
        {
          success: true,
          path: "/superadmin/complaints",
        }
      )
    );
  }

  return next(
    new CustomResponse(res).success(
      "Complaints retrieved successfully",
      allComplaints,
      200,
      {
        success: true,
        path: "/superadmin/complaints",
      }
    )
  );
};

export { retrieveAllComplaints };
