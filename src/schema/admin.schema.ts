import { object, string, TypeOf, any } from "zod";

export const createAdminSchema = object({
  body: object({
    email: string({ required_error: "Email is required" }).email(
      "Invalid email"
    ),
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be less than 32 characters"),
    firstname: string({ required_error: "Your firstname is required" }).refine(
      (value) => value.length >= 2,
      "Firstname cannot be empty and must be at least 2 characters"
    ),
    lastname: string({ required_error: "Your lastname is required" }).refine(
      (value) => value.length >= 2,
      "Lastname cannot be empty and must be at least 2 characters"
    ),
    university: string({
      required_error: "Please select your university",
    }).refine(
      (value) => value.length >= 2,
      "University cannot be empty and must be at least 2 characters"
    ),
    office: string({
      required_error: "What is your position in your institution",
    }).refine(
      (value) => value.length >= 2,
      "Position cannot be empty and must be at least 2 characters"
    ),
    phone_number: string().optional(),
    extra_info: string().optional(),
    data: any().optional(),
  }),
});

export const loginAdminSchema = object({
  body: object({
    email: string({ required_error: "Email is required" }).email(
      "This is not a valid email address"
    ),
    password: string({ required_error: "Password is required" }),
  }),
});

export type TCreateAdminInput = TypeOf<typeof createAdminSchema>["body"];
export type TLoginAdminInput = TypeOf<typeof loginAdminSchema>["body"];
