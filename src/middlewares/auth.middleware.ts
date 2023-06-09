import { NextFunction, Request, Response } from "express";

import User, { TUser } from "../models/user.model";

import { decode } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import redisClient from "@utils/redis.util";
import superadminModel, { TSuperAdminModel } from "models/superadmin.model";
import adminModel from "@models/admin.model";

export const requireSignin =
  (model: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];

        const data = await decode.accessToken(token);

        if (!data) {
          return next(new CustomException(401, "An error occurred."));
        }

        if (
          data?.name == "TokenExpiredError" ||
          data?.message == "jwt expired" ||
          new Date(data?.expiredAt).getTime() < new Date().getTime()
        ) {
          return next(
            new CustomException(403, "Access expired. Try refreshing token.")
          );
        }

        const userId = await redisClient.get(data?._id);

        if (!userId) {
          return next(
            new CustomException(401, "You are logged out. Please log in again.")
          );
        }

        let userExists;

        if (model === "user") {
          userExists = await User.findById(data?._id).exec();
        } else if (model === "admin") {
          userExists = await adminModel.findById(data?._id).exec();
        } else {
          userExists = await superadminModel.findById(data?._id).exec();
        }

        if (userExists) {
          req.user = data!;
          next();
        } else {
          return next(
            new CustomException(403, "User does not exist! Please signup.", {
              reason: "account not found",
              alias: "acc_not_found",
              code: "ACC_ERR_01",
            })
          );
        }
      } catch (error: any) {
        return next(
          new CustomException(
            error?.status,
            "Token not provided / Wrong token format.",
            {
              path: "requireSignin",
              reason: "token sent but possibly wrong",
            }
          )
        );
      }
    } else {
      return next(
        new CustomException(
          401,
          "You must be logged in to access this feature.",
          {
            reason: "No authorization header or invalid token.",
            alias: "token_not_found",
          }
        )
      );
    }
  };

// Check to see if user is an admin.
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await adminModel.findById(req.user._id).exec();

    if (!admin) {
      return next(
        new CustomException(403, "Unauthorized!", {
          reason: "Account could not be verified as admin",
          alias: "acc_not_admin",
          code: "ACC_ERR_03",
        })
      );
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// Check to see if user is a super admin.
export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const superAdmin = await superadminModel.findById(req.user._id).exec();

    if (!superAdmin) {
      return next(
        new CustomException(403, "Unauthorized!", {
          reason: "Account could not be verified as a super admin",
          alias: "acc_not_super_admin",
          code: "ACC_ERR_04",
        })
      );
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// Check to see if the user is verified and allow access accordingly.
export const isVerified =
  (model: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user;

      if (model === "user") {
        user = await User.findOne({
          $or: [{ _id: req.user?._id }, { email: req.body?.email }],
        }).exec();
      } else if (model === "admin") {
        user = await adminModel
          .findOne({
            $or: [{ _id: req.user?._id }, { email: req.body?.email }],
          })
          .exec();
      } else {
        user = await superadminModel
          .findOne({
            $or: [{ _id: req.user?._id }, { email: req.body?.email }],
          })
          .exec();
      }

      if (!user?.verified) {
        return next(
          new CustomException(403, "Verify your email to use this service.", {
            reason: "verification",
            alias: "acc_not_verified",
            code: "ACC_ERR_02",
          })
        );
      }

      next();
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };
