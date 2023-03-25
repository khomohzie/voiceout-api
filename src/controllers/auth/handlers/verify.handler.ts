import { NextFunction, Request, Response } from "express";
import User from "../../../models/user.model";
import otp from "@utils/methods.util";
import { generate } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import transporter from "@config/email";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@config/jwt.config";

/**
 * @route POST /api/auth/resend
 * @desc Send verification email to user
 */

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      return next(new CustomException(400, "Email is required!"));
    }

    const checkExists = await otp.exists(email);

    if (checkExists) {
      return next(
        new CustomException(
          429,
          "Please wait for 10 minutes before requesting again."
        )
      );
    }

    const verifyToken = await otp.create(email, 4, 600);

    const msg = `<div style="text-align:center;">Use this code to verify your VoiceOut account
			<h1 style="text-align:center; font-size:3rem;font-weight: 800">${verifyToken}</h1>
			<p class="text-xs my-1 text-center">If you did not request this email, kindly ignore it or reach out to support if you think your account is at risk.</p></div>
  		`;

    await transporter(email, "VoiceOut account - Email verification", msg)
      .then((data: any) => {
        return new CustomResponse(res).success(
          `A verification code has been sent to ${email}`,
          {},
          200,
          data
        );
      })
      .catch((err: any) => {
        next(
          new CustomException(
            500,
            "Failed to send email. Please try again.",
            err
          )
        );
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * @route PUT /api/auth/verify
 * @desc Verify email
 * @access Public
 */

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code }: { email: string; code: string } = req.body;

    if (!(email && code)) {
      return next(new CustomException(400, "All fields are required!"));
    }

    // Find the user's code
    const userCode = await otp.get(code);

    // If no code has been requested
    if (!userCode) {
      return next(
        new CustomException(400, "Invalid OTP! Please request for another one")
      );
    }

    // If the code is invalid
    if (email !== userCode) {
      return next(new CustomException(400, "Incorrect OTP!"));
    }

    const updateUser = await User.updateOne(
      { email },
      { $set: { verified: true } },
      { new: true }
    ).exec();

    const deleteCode = await otp.delete(code);

    if (!updateUser || !deleteCode) {
      return next(new CustomException(500, "Something went wrong!"));
    }

    const user = await User.findOne({ email });
    // console.log(user);
    // Create the Access and refresh Tokens
    const { accessToken, refreshToken } = await generate(user!);

    // Send Access Token in Cookie
    res.cookie("access_token", accessToken, accessTokenCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

    return new CustomResponse(res).success(
      "Account verified successfully",
      {
        accessToken,
        refreshToken,
        user,
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

export { sendEmail, verifyEmail };
