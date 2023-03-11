import { CookieOptions } from "express";

const accessTokenCookieOptions: CookieOptions = {
	expires: new Date(
		Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN * 60 * 24 * 1000
	),
	maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN * 60 * 24 * 1000,
	httpOnly: true,
	sameSite: "lax",
};

const refreshTokenCookieOptions: CookieOptions = {
	expires: new Date(
		Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN * 60 * 24 * 7 * 1000
	),
	maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN * 60 * 24 * 7 * 1000,
	httpOnly: true,
	sameSite: "lax",
};

// Only set secure to true in production
if (process.env.NODE_ENV === "production")
	accessTokenCookieOptions.secure = true;

export { accessTokenCookieOptions, refreshTokenCookieOptions };
