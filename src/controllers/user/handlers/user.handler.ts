import { NextFunction, Request, Response } from "express";
import User from "../../../models/user.model";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";

/**
 * @route GET /api/user/me
 * @desc Get my profile
 * @access Public
 */

const userProfile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await User.findOne(
			{ _id: req.user._id },
			{ password: 0, reset_password_pin: 0 }
		).exec();

		if (!user)
			return next(
				new CustomException(400, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		return new CustomResponse(res).success(
			"Profile retrieved successfully.",
			user,
			200,
			{
				path: "user's profile",
			}
		);
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route GET /api/user/data/:id
 * @desc Get a user's profile by admin
 * @access Public
 */

//* Admin can retrieve a user's profile using this controller.
const aUserData = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await User.findOne(
			{ _id: req.params.id },
			{ password: 0, reset_password_pin: 0 }
		).exec();

		if (!user)
			return next(
				new CustomException(400, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		return new CustomResponse(res).success(
			"Profile retrieved successfully.",
			user,
			200,
			{
				path: "a user's data by admin",
			}
		);
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route GET /api/user/all
 * @desc Get all profiles
 * @access Public
 */

const profiles = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const users = await User.find(
			{},
			{ password: 0, reset_password_pin: 0 }
		).exec();

		if (!users || users.length <= 0)
			return next(
				new CustomException(400, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		return new CustomResponse(res).success(
			"Profiles retrieved successfully.",
			users,
			200,
			{
				path: "profiles",
			}
		);
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

export { userProfile, aUserData, profiles };
