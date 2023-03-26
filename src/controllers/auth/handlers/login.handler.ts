import { NextFunction, Request, Response } from "express";
import User, { TUser } from "../../../models/user.model";
import { LoginUserInput } from "../../../schema/user.schema";
import CustomException from "@utils/handlers/error.handler";
import { compare, generate, TAUser } from "@utils/auth.util";
import CustomResponse from "@utils/handlers/response.handler";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@config/jwt.config";
import superadminModel, { TSuperAdminModel } from "models/superadmin.model";

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */

const login = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find the user by email or username
    let user: TSuperAdminModel | TUser | null = await User.findOne({
      email,
      deleted_at: null || "",
    }).exec();

    // If the account is not found then maybe they are a super admin since I am using the
    // same endpoint.
    if (!user) {
      user = await superadminModel.findOne({ email }).exec();

      // If there is no account at all
      if (!user) {
        return next(new CustomException(404, "Email does not exist!"));
      }
    }

    // authenticate the entered password
    const verifyPassword = await compare.password(password, user.password);

    if (!verifyPassword) {
      return next(new CustomException(401, "Password is incorrect!"));
    }

    // Generate the JWT tokens
    const { accessToken, refreshToken } = await generate(user as TAUser);

    // Send Access Token in Cookie
    res.cookie("access_token", accessToken, accessTokenCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

    //* Do not return the password value.
    delete (user as any).password;

    return new CustomResponse(res).success(
      "Welcome back!",
      { accessToken, refreshToken, user },
      200,
      {
        type: "success",
        action: "Login",
      }
    );
  } catch (err) {
    return next(err);
  }
};

export default login;
