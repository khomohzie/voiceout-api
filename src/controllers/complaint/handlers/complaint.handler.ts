import transporter from "@config/email";
import cloudinaryUpload from "@utils/cloudinary";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import match from "@utils/match.util";
import { NextFunction, Request, Response } from "express";
import translateError from "helpers/mongo_helper";
import complaintModel from "models/complaint.model";
import superadminModel from "models/superadmin.model";
import User from "models/user.model";

/**
 * @desc Users get the history of complaints they submitted.
 * @api {GET} /api/complaints
 * @param req
 * @param res
 * @param next
 */

const getMyComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("history");
};

export { getMyComplaints };
