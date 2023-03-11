import { any, object, string, TypeOf } from "zod";

export const createUserSchema = object({
	body: object({
		email: string({ required_error: "Email is required" }).email(
			"Invalid email"
		),
		password: string({ required_error: "Password is required" })
			.min(8, "Password must be at least 8 characters")
			.max(32, "Password must be less than 32 characters"),
	}),
});

export const loginUserSchema = object({
	body: object({
		email: string({ required_error: "Email is required" }).email(
			"This is not a valid email address"
		),
		name: string().optional(), // for googlefacebooklogin
		picture: string().optional(), // for googlefacebooklogin
		password: string({ required_error: "Password is required" }),
	}),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];
