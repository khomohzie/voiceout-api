import transporter from "@config/email";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@config/jwt.config";
import adminModel from "@models/admin.model";
import { TAUser, generate } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import otp from "@utils/methods.util";
import { NextFunction, Request, Response } from "express";

/**
 * @route PUT /api/admin/auth/verify
 * @desc Verify email
 * @access Public
 */

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code }: { email: string; code: string } = req.body;

    if (!(email && code)) {
      return next(new CustomException(400, "All fields are required!"));
    }

    // Find the admin's code
    const adminCode = await otp.get(code);

    // If no code has been requested
    if (!adminCode) {
      return next(
        new CustomException(400, "Invalid OTP! Please request for another one")
      );
    }

    // If the code is invalid
    if (email !== adminCode) {
      return next(new CustomException(400, "Incorrect OTP!"));
    }

    const updateAdmin = await adminModel
      .updateOne({ email }, { $set: { verified: true } }, { new: true })
      .exec();

    const deleteCode = await otp.delete(code);

    if (!updateAdmin || !deleteCode) {
      return next(new CustomException(500, "Something went wrong!"));
    }

    const admin = await adminModel.findOne({ email });
    // console.log(admin);
    // Create the Access and refresh Tokens
    const { accessToken, refreshToken } = await generate(
      admin! as unknown as TAUser
    );

    // Send Access Token in Cookie
    res.cookie("access_token", accessToken, accessTokenCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

    return new CustomResponse(res).success(
      "Account verified successfully",
      {
        accessToken,
        refreshToken,
        admin,
      },
      200,
      {
        status: "success",
        action: "verify email",
      }
    );
  } catch (err) {
    return next(err);
  }
};

export default verifyEmail;
