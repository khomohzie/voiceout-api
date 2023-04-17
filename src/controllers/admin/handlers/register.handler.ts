import transporter from "@config/email";
import { encrypt } from "@utils/auth.util";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { signJwt } from "@utils/jwt.utils";
import otp from "@utils/methods.util";
import redisClient from "@utils/redis.util";
import { NextFunction, Request, Response } from "express";
import adminModel, { TAdminModel } from "models/admin.model";
import { TCreateAdminInput } from "schema/admin.schema";

/**
 * @desc Allows the admins of an institution to register an account.
 * @api {POST} /admin/register
 * @access Public
 * @param req
 * @param res
 * @param next
 */

const register = async (
  req: Request<{}, {}, TCreateAdminInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body.data as string;

    let data: TAdminModel;

    if (body) {
      data = JSON.parse(body);
    } else {
      data = {} as TAdminModel;
    }

    const adminExists = await adminModel.findOne({ email: data.email }).exec();

    if (adminExists) {
      return next(
        new CustomException(400, "This email is already registered", {
          status: false,
          path: "/admin/register",
        })
      );
    }

    const hashedPassword = await encrypt.password(data.password);

    const token = signJwt(
      { email: data.email },
      process.env.JWT_PRIVATE_ACTIVATION,
      {
        expiresIn: `${process.env.ACTIVATION_TOKEN_EXPIRES_IN}m`,
      }
    );

    // Create a Session
    await redisClient.set(token, JSON.stringify(data.email), {
      EX: 10,
      NX: true,
    });

    // Prepare verification mail variables
    const verifyToken = await otp.create(data.email.toLowerCase(), 4, 600);

    const msg = `Use this code to verify your VoiceOut account. It expires in 10 minutes.
          <h1 class="code block text-5xl text-center font-bold tracking-wide my-10">${verifyToken}</h1>
          <p class="text-xs my-1 text-center">If you did not request this email, kindly ignore it or reach out to support if you think your account is at risk.</p>
      `;

    const admin = new adminModel({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
      university: data.university,
      office: data.office,
      phone_number: data.phone_number,
      extra_info: data.extra_info,
    });

    await admin
      .save()
      .then(async (_) => {
        await transporter(
          data.email,
          "VoiceOut account - Email verification",
          msg
        )
          .then((transportData: any) => {
            return new CustomResponse(res).success(
              `A verification code has been sent to ${data.email}`,
              {},
              200,
              transportData
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

export default register;
