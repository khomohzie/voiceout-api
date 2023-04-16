import { Schema, model, InferSchemaType } from "mongoose";

const adminModel = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "Your firstname is required"],
    },
    lastname: {
      type: String,
      required: [true, "Your lastname is required"],
    },
    email: {
      type: String,
      lowercase: true,
      index: {
        unique: true,
      },
      required: [true, "Your email address is required"],
    },
    password: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: [true, "Please select your university"],
    },
    office: {
      type: String,
      required: [true, "What is your position in your institution"],
    },
    phone_number: {
      type: String,
    },
    extra_info: {
      type: String,
      maxlength: 80,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    authorized: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export type TAdminModel = InferSchemaType<typeof adminModel>;

export default model<TAdminModel>("Admin", adminModel);
