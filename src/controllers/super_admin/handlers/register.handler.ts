import transporter from "@config/email";
import cloudinaryUpload from "@utils/cloudinary";
import CustomException from "@utils/handlers/error.handler";
import CustomResponse from "@utils/handlers/response.handler";
import { NextFunction, Request, Response } from "express";
import translateError from "helpers/mongo_helper";
import superadminModel, { TSuperAdminModel } from "models/superadmin.model";
import { TCreateSuperAdminInput } from "schema/superadmin.schema";

/**
 * @desc Allows the super admin of an institution to register a new institution.
 * @api {POST} /superadmin/register
 * @access Public
 * @param req
 * @param res
 * @param next
 */

const register = async (
  req: Request<{}, {}, TCreateSuperAdminInput>,
  res: Response,
  next: NextFunction
) => {
  const body = req.body.data as string;

  let data: TSuperAdminModel;

  if (body) {
    data = JSON.parse(body);
  } else {
    data = {} as TSuperAdminModel;
  }

  const adminExists = await superadminModel
    .findOne({ email: data.email })
    .exec();

  if (adminExists) {
    return next(
      new CustomException(400, "This email is already registered", {
        status: false,
        path: "/superadmin/register",
      })
    );
  }

  // Upload image to cloudinary
  const cloudinaryFolder = `${data.email}`;

  const id_photo_front = req.files?.[0] as unknown as Express.Multer.File;
  const id_photo_back = req.files?.[1] as unknown as Express.Multer.File;

  if (id_photo_front) {
    await cloudinaryUpload(id_photo_front.path, cloudinaryFolder)
      .then(async (downloadURL) => {
        data.id_photo_front = downloadURL;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  if (id_photo_back) {
    await cloudinaryUpload(id_photo_back.path, cloudinaryFolder)
      .then(async (downloadURL) => {
        data.id_photo_back = downloadURL;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const msg = `${data.email} - ${data.firstname} ${data.lastname} just registered their university`;

  const superAdmin = new superadminModel({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: data.password,
    id_photo_front: data.id_photo_front,
    id_photo_back: data.id_photo_back,
    university: data.university,
    office: data.office,
    phone_number: data.phone_number,
    extra_info: data.extra_info,
  });

  await superAdmin
    .save()
    .then((response) =>
      new CustomResponse(res).success(
        "School registration submitted for verification. We will contact you",
        response,
        200,
        {
          success: true,
          path: "/superadmin/register",
        }
      )
    )
    .catch((err) =>
      next(new CustomException(500, translateError(err).toString()))
    );

  transporter(
    process.env.DEVELOPER_EMAIL,
    "VoiceOut account - University Registration",
    msg
  )
    .then((data: any) => {
      console.log("University registration email sent", data);
    })
    .catch((err: any) => {
      console.error(err);
    });
};

export default register;
