import { NextFunction, Request, Response } from "express";
import User from "../../../models/user.model";
import cloudinaryUpload from "@utils/cloudinary";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import match from "@utils/match.util";
import filter from "@utils/filter.util";
import { IUser } from "../../../interfaces/auth.interfaces";
import * as formidable from "formidable";

/**
 * @route PUT /api/user/me
 * @desc Update my profile
 * @access Public
 */

const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const body = req.fields?.data as string;

		let data: IUser;

		if (body) {
			data = JSON.parse(body);
		} else {
			data = {} as IUser;
		}

		const avatarImage = req.files?.avatarImage as formidable.File;
		const coverImage = req.files?.coverImage as formidable.File;

		//* If this controller is called for profile setup, then these are required.
		if (req.query.action === "setup") {
			const validate = match.obj(data, [
				"firstname",
				"lastname",
				"matric",
			]);

			if (validate !== true) {
				return next(
					new CustomException(
						400,
						"One or more required fields are missing.",
						validate
					)
				);
			}

			if (await User.findOne({ matric: data.matric }).exec()) {
				return next(
					new CustomException(
						400,
						"Matric number has already been used."
					)
				);
			}

			//* active is false until user sets up profile. It will also help in routing
			//* on the frontend - either to profile_setup screen or home screen.
			data.active = true;
		}

		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user)
			return next(
				new CustomException(400, "No user found!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		// Upload image to cloudinary
		const cloudinaryFolder = `${user.email}-${user._id}`;

		if (avatarImage) {
			await cloudinaryUpload(avatarImage.filepath, cloudinaryFolder)
				.then((downloadURL) => {
					data.avatar = downloadURL;
				})
				.catch((error) => {
					console.error(error);
				});
		}

		if (coverImage) {
			await cloudinaryUpload(coverImage.filepath, cloudinaryFolder)
				.then((downloadURL) => {
					data.cover_photo = downloadURL;
				})
				.catch((error) => {
					console.error(error);
				});
		}

		// If someone entered a new password/pin illegally, revert to old password/pin
		data.password = user.password;
		data.reset_password_pin = user.reset_password_pin;
		data.email = user.email;
		if (user.matric && user.matric?.length > 0) data.matric = user.matric;
		if (data && data.role) {
			data.role.type = user.role.type;
			data.role.id = user.role.id;
		}

		// Capitalize firstname and lastname
		if (data && data.firstname)
			data.firstname = filter.str(data.firstname, "F");
		if (data && data.lastname)
			data.lastname = filter.str(data.lastname, "F");

		await User.updateOne({ _id: req.user._id }, { $set: data }).exec();

		return new CustomResponse(res).success("Profile updated.", {}, 200, {
			status: "Success",
			path: "profile setup",
		});
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route PUT /api/user/avatar
 * @desc Update my avatar
 * @access Public
 */

const changeAvatar = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const avatarImage = req.files?.avatarImage as formidable.File;

		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user)
			return next(
				new CustomException(400, "No user found!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		// Upload image to cloudinary
		const cloudinaryFolder = `${user.email}-${user._id}`;

		if (avatarImage) {
			await cloudinaryUpload(avatarImage.filepath, cloudinaryFolder)
				.then(async (downloadURL) => {
					await User.updateOne(
						{ _id: req.user._id },
						{ $set: { avatar: downloadURL } }
					).exec();

					return new CustomResponse(res).success(
						"Avatar updated.",
						{},
						200,
						{
							status: "Success",
							path: "change avatar",
						}
					);
				})
				.catch((error) => {
					console.error(error);
					return next(
						new CustomException(error.status || 400, error)
					);
				});
		} else {
			return next(new CustomException(400, "No data/image sent."));
		}
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

/**
 * @route PUT /api/user/cover
 * @desc Update my cover photo
 * @access Public
 */

const changeCoverImage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const coverImage = req.files?.coverImage as formidable.File;

		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user)
			return next(
				new CustomException(400, "No user found!", {
					reason: "account not found",
					alias: "acc_not_found",
					code: "ACC_ERR_01",
				})
			);

		// Upload image to cloudinary
		const cloudinaryFolder = `${user.email}-${user._id}`;

		if (coverImage) {
			await cloudinaryUpload(coverImage.filepath, cloudinaryFolder)
				.then(async (downloadURL) => {
					await User.updateOne(
						{ _id: req.user._id },
						{ $set: { cover_photo: downloadURL } }
					).exec();

					return new CustomResponse(res).success(
						"Cover photo updated.",
						{},
						200,
						{
							status: "Success",
							path: "change cover photo",
						}
					);
				})
				.catch((error) => {
					console.error(error);
					return next(
						new CustomException(error.status || 400, error)
					);
				});
		} else {
			return next(new CustomException(400, "No data/image sent."));
		}
	} catch (error) {
		console.log(error);
		return next(error);
	}
};

export { updateProfile, changeAvatar, changeCoverImage };
