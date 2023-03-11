import { NextFunction, Request, Response } from "express";
import CustomException from "@utils/handlers/error.handler";
import { signJwt, verifyJwt } from "@utils/jwt.utils";
import redisClient from "@utils/redis.util";
import CustomResponse from "@utils/handlers/response.handler";
import { accessTokenCookieOptions } from "@config/jwt.config";
import Account from "../../../services/account.service";

/**
 * @route POST /api/auth/refresh
 * @desc Refresh the user's access token
 * @access Public
 */

const refreshAccessToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Get the refresh token from cookie
		// const refresh_token = req.cookies.refresh_token as string;
		const refresh_token = req.headers.cookie as string;

		// Validate the Refresh token
		const decoded = verifyJwt<{ _id: string }>(
			refresh_token,
			process.env.JWT_REFRESH_PUBLIC_SECRET
		);

		if (!decoded || !decoded?._id) {
			return next(
				new CustomException(
					403,
					"Invalid refresh token! Sign in again."
				)
			);
		}

		// Check if the user has a valid session
		const session = await redisClient.get(decoded._id?.toString());

		if (!session) {
			return next(
				new CustomException(
					403,
					"Session expired. Please sign in again."
				)
			);
		}

		// Check if the user exist
		const user = await new Account(JSON.parse(session)._id).findUser();

		if (!user) {
			return next(
				new CustomException(400, "You do not have an account with us.")
			);
		}

		// Sign new access token
		const accessToken = signJwt(
			{ _id: user._id },
			process.env.JWT_ACCESS_PRIVATE_SECRET,
			{
				expiresIn: `${process.env.ACCESS_TOKEN_EXPIRES_IN}m`,
			}
		);

		// Send the access token as cookie
		res.cookie("access_token", accessToken, accessTokenCookieOptions);

		// Send response
		return new CustomResponse(res).success(
			"Access token generated",
			accessToken,
			200,
			{
				status: "success",
				path: "refresh token handler",
			}
		);
	} catch (err: any) {
		return next(err);
	}
};

export default refreshAccessToken;
