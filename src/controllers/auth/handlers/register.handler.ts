import { NextFunction, Request, Response } from "express";
import User from "../../../models/user.model";
import { CreateUserInput } from "../../../schema/user.schema";
import CustomException from "@utils/handlers/error.handler";
import { signJwt } from "@utils/jwt.utils";
import { encrypt } from "@utils/auth.util";
import redisClient from "@utils/redis.util";
import CustomResponse from "@utils/handlers/response.handler";
import otp from "@utils/methods.util";
import transporter from "@config/email";

const signup = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await encrypt.password(password);

    const userExists = await User.findOne({ email }).exec();

    if (userExists) {
      if (
        userExists.deleted_at != null &&
        (userExists.deleted_at as Date).toDateString().length > 0
      ) {
        return next(
          new CustomException(
            400,
            "You cannot use this email to create an account with us again."
          )
        );
      }

      return next(new CustomException(400, "Email already taken!"));
    }

    const token = signJwt({ email }, process.env.JWT_PRIVATE_ACTIVATION, {
      expiresIn: `${process.env.ACTIVATION_TOKEN_EXPIRES_IN}m`,
    });

    // Create a Session
    await redisClient.set(token, JSON.stringify(email), {
      EX: 10,
      NX: true,
    });

    // Prepare verification mail variables
    const verifyToken = await otp.create(email.toLowerCase(), 4, 600);

    const msg = `Use this code to verify your VoiceOut account. It expires in 10 minutes.
			<h1 class="code block text-5xl text-center font-bold tracking-wide my-10">${verifyToken}</h1>
			<p class="text-xs my-1 text-center">If you did not request this email, kindly ignore it or reach out to support if you think your account is at risk.</p>
		`;

    await new User({
      email,
      password: hashedPassword,
    })
      .save()
      .then(async (_) => {
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
            return next(
              new CustomException(
                500,
                "Failed to send verification email. You can still login.",
                err
              )
            );
          });
      })
      .catch((err) => {
        return next(
          new CustomException(
            500,
            "Failed to create account. Try again or try logging in.",
            err
          )
        );
      });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export default signup;
