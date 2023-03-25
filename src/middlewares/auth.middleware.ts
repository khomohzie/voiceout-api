import { NextFunction, Request, Response } from "express";

import User from "../models/user.model";

import { decode } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import redisClient from "@utils/redis.util";
import superadminModel from "models/superadmin.model";

/**
 * Basically, this middleware is responsible for giving users access to other endpoints.
 * If the user's access token expires, we will send a get request to the refreshToken endpoint
 * for another one as long as the refresh token itself has not expired.
 * I don't know why I am sending the refresh request from the backend, maybe for testing.
 * From frontend or backend, it works. And if it works, don't touch it!
 */

export const requireSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

      const userExists = await User.findById(data?._id).exec();

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
    const user = await User.findById(req.user._id).exec();

    const type = user?.role.type;
    const id = user?.role.id;

    if (type !== "admin" || id !== 0) {
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
export const isVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      $or: [{ _id: req.user?._id }, { email: req.body?.email }],
    }).exec();

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
