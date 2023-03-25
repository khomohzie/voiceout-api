import { Schema, model, InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";

const superAdminModel = new Schema(
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
    id_photo_front: {
      type: String,
      required: [true, "Please upload a front photo of your id card"],
    },
    id_photo_back: {
      type: String,
      required: [true, "Please upload a back photo of your id card"],
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

superAdminModel.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(12, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

superAdminModel.methods.comparePassword = function (
  candidatePassword: string | Buffer,
  cb: (arg0: Error | null, arg1?: boolean | undefined) => void
) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export type TSuperAdminModel = InferSchemaType<typeof superAdminModel>;

export default model<TSuperAdminModel>("Super Admin", superAdminModel);
