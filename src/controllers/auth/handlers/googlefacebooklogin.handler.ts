import { NextFunction, Request, Response } from "express";
import User from "../../../models/user.model";
import { LoginUserInput } from "../../../schema/user.schema";
import { generate } from "@utils/auth.util";
import CustomResponse from "@utils/handlers/response.handler";
import {
	accessTokenCookieOptions,
	refreshTokenCookieOptions,
} from "@config/jwt.config";

/**
 * @route POST /api/auth/googlefacebooklogin
 * @desc Login a user using google or facebook credentials
 * @access Public
 */

const GoogleFacebookLogin = async (
	req: Request<{}, {}, LoginUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, name, picture, password } = req.body;

		// User profile from Google or Facebook
		let firstname: string | undefined = undefined,
			lastname: string | undefined = undefined,
			avatar: string = "";
		if (name != null && name.length > 0) {
			firstname = name.split(" ")[0];
			lastname = name.split(" ")[1];
		}
		if (picture != null && picture.length > 0) avatar = picture;

		// Find the user by email or username
		let user = await User.findOne({ email }).exec();

		// If the account is not found
		if (!user) {
			await new User({
				email,
				firstname: firstname,
				lastname: lastname,
				password,
				avatar: avatar,
				verified: true,
			}).save();

			const createdUser = await User.findOne({ email }).exec();

			user = createdUser;
		}

		// Generate the JWT tokens
		const { accessToken, refreshToken } = await generate(user!);

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

export default GoogleFacebookLogin;
