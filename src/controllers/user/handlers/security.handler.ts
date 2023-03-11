import { compare, encrypt } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import User from "../../../models/user.model";

/**
 * @route DELETE /api/user/me/delete
 * @desc Delete my profile
 * @access Public
 */

const deleteAccount = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user) {
			return next(
				new CustomException(404, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);
		}

		//* Soft delete option
		await User.updateOne(
			{ _id: req.user._id },
			{
				$set: {
					deleted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
				},
			}
		).exec();

		return new CustomResponse(res).success(
			"Account deleted successfully.",
			{},
			200,
			{
				path: "delete my account",
			}
		);
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route PUT /api/user/me/password
 * @desc Change my password
 * @access Public
 */

const changePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { oldPassword, password } = req.body;

		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user)
			return next(
				new CustomException(400, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		// authenticate the entered password
		const verifyPassword = await compare.password(
			oldPassword,
			user.password
		);

		if (!verifyPassword) {
			return next(new CustomException(400, "Password is incorrect!"));
		}

		const hashedPassword = await encrypt.password(password);

		User.updateOne(
			{ _id: req.user._id },
			{ $set: { password: hashedPassword } }
		).exec();

		return new CustomResponse(res).success("Password updated!", {}, 200, {
			path: "change password",
		});
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route DELETE /api/user/all/delete
 * @desc Delete all profiles
 * @access Public
 */

const deleteAll = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await User.find({}).exec();

		if (!user) {
			return next(
				new CustomException(400, "No user data!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);
		}

		await User.deleteMany({}).exec();

		return new CustomResponse(res).success(
			"All accounts deleted successfully.",
			{},
			200,
			{
				path: "Delete all accounts",
			}
		);
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

export { deleteAccount, changePassword, deleteAll };
