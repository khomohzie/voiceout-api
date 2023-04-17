import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";
import complaintModel from "models/complaint.model";

/**
 * @desc Details of complaint.
 * @api {GET} /api/complaints/:id
 * @param req
 * @param res
 * @param next
 */

const complaintDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const complaint = await complaintModel
      .findOne({ _id: req.params.id })
      .exec();

    if (!complaint) {
      return next(
        new CustomException(
          400,
          "Complaint does not exist or has been deleted.",
          {
            success: false,
            path: "complaint details /api/complaints/:id",
          }
        )
      );
    }

    return next(
      new CustomResponse(res).success(
        "Complaint details retrieved successfully",
        complaint,
        200,
        {
          status: "success",
          path: "complaint details /api/complaints/:id",
        }
      )
    );
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

/**
 * @desc Users get the history of complaints they submitted.
 * @api {GET} /api/complaints/me
 * @param req
 * @param res
 * @param next
 */

const getMyComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const complaints = await complaintModel
      .find({ sender: req.user._id })
      .exec();

    if (!complaints || complaints.length <= 0) {
      return next(
        new CustomResponse(res).success(
          "No complaints submitted yet!",
          {},
          200,
          {
            status: "empty complaints",
            path: "user gets their own complaints /api/complaints/me",
          }
        )
      );
    }

    return next(
      new CustomResponse(res).success(
        "Complaints retrieved successfully",
        complaints,
        200,
        {
          status: "success",
          path: "user gets their own complaints /api/complaints/me",
        }
      )
    );
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export { complaintDetails, getMyComplaints };
