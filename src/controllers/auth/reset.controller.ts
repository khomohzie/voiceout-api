import { NextFunction, Request, Response } from "express";
import User from "../../models/user.model";
import randToken from "rand-token";
import redisClient from "@utils/redis.util";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { encrypt } from "@utils/auth.util";
import transporter from "@config/email";

/**
 * @api {post} /api/auth/forgot Forgot password
 * @param req
 * @param res
 * @param next
 */

const forgot = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email }: { email: string } = req.body;

		// If the email is not provided
		if (!email) {
			return next(new CustomException(400, "Email is required!"));
		}

		//  Find the user
		const user = await User.findOne({ email });

		// If the user is not found
		if (!user) {
			return next(new CustomException(400, "User not found!"));
		}

		// Generate a new reset pin
		const token = randToken.uid(6);
		const identifier = `reset:${token}`;
		const pointer = `resetpointer:${email}`;

		// Check if redis entry exists
		const redisExists = await redisClient.exists(pointer); // check if pointer exists

		// If the redis entry exists
		if (redisExists) {
			return next(
				new CustomException(
					429,
					"Please wait for 5 minutes before requesting for another pin"
				)
			);
		}

		// Save the token to redis for 15 minutes
		await redisClient.setEx(identifier, 600, token);

		// Save email for rate limiting
		await redisClient.setEx(pointer, 300, email);

		// Send the email
		const msg = `Hello <b>${user?.firstname || "there"}</b>,
      <br/> You have requested to reset your password. Copy the code below. It expires in 10 minutes.
			<h1 class="code block text-5xl text-center font-bold tracking-wide my-10">${token}</h1>
			<p class="text-xs my-1 text-center">If you did not request this email, kindly ignore it or reach out to support if you think your account is at risk.</p>
    `;

		User.updateOne({ _id: user._id }, { reset_password_pin: token }).exec();

		await transporter(email, "Reset your password", msg)
			.then((data: any) => {
				return new CustomResponse(res).success(
					`A password reset code has been sent to ${email}`,
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
 * @api {post} /api/auth/reset - Reset password
 * @param req
 * @param res
 * @param next
 */

const reset = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { resetToken, newPassword, location } = req.body;

		// If any of the fields are not provided
		if (!(resetToken && newPassword)) {
			return next(new CustomException(400, "All fields are required"));
		}

		// Extract location data
		const country_name = location?.country_name || "unknown";
		const city = location?.city || "unknown";
		const state = location?.state || city || "unknown";

		// Attempt to fetch token from redis
		const identifier = `reset:${resetToken}`; // for reset tokens + jwt
		const redisExists = await redisClient.exists(identifier); // check if token exists

		// If the token is not found
		if (!redisExists) {
			return next(new CustomException(400, "Invalid reset pin"));
		}

		// Extract token
		const token = await redisClient.get(identifier);

		// Check if the token is valid
		if (resetToken !== token) {
			return next(new CustomException(400, "Invalid reset pin"));
		}

		const user = await User.findOne({
			reset_password_pin: resetToken,
		}).exec();

		if (!user) return next(new CustomException(400, "Wrong pin!"));

		const hashedPassword = await encrypt.password(newPassword);

		// Delete the token from redis
		const pointer = `resetpointer:${user.email}`;

		await redisClient.del(identifier);
		await redisClient.del(pointer);

		// Send email notification
		const msg = `
            Hello,<br/> Your password has been reset successfully.<br/><br/> Approximate location: ${state}, ${country_name} <br/><br/> If you did not request to reset your password, please immediately reset your password.
        `;

		await User.updateOne(
			{ _id: user._id },
			{
				password: hashedPassword,
				reset_password_pin: "",
			}
		).exec();

		await transporter(user.email, "Password reset successful", msg)
			.then((data: any) => {
				console.log(data);
			})
			.catch((err: any) => {
				console.log(err);
			});

		return new CustomResponse(res).success(
			"Password reset successful.",
			{},
			200
		);
	} catch (err) {
		return next(err);
	}
};

export { forgot, reset };
