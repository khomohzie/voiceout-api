import { Schema, model, InferSchemaType } from "mongoose";
import { IUser } from "../interfaces/auth.interfaces";

const userModel = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required!"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    matric: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    university: {
      type: String,
    },
    faculty: {
      type: String,
    },
    department: {
      type: String,
    },
    level: {
      type: Number,
    },
    bio: {
      type: String,
      required: false,
      maxlength: [800, "Maximum characters is 800!"],
    },
    avatar: {
      type: String,
      default: "",
    },
    cover_photo: {
      type: String,
      default: "",
    },
    phone_no: {
      type: String,
    },
    office: {
      type: String,
    },
    role: {
      type: {
        type: String,
        default: "student",
        enum: ["admin", "student"],
      },
      id: {
        type: Number,
        default: 1,
        enum: [0, 1],
      },
    },
    reset_password_pin: {
      type: String,
      default: "",
    },
    reset_pin_expiry: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtuals
userModel.virtual("fullname").get(function () {
  return this.firstname || "" + this.lastname || "";
});

export type TUser = InferSchemaType<typeof userModel>;

export default model<IUser & TUser>("User", userModel);
