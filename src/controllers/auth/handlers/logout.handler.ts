import { NextFunction, Request, Response } from "express";
import redisClient from "@utils/redis.util";
import CustomResponse from "@utils/handlers/response.handler";

const removeCookies = (res: Response) => {
	res.cookie("access_token", "", { maxAge: 1 });
	res.cookie("refresh_token", "", { maxAge: 1 });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user;

		await redisClient.del(user._id);

		removeCookies(res);

		return new CustomResponse(res).success(
			"Logged out successfully",
			{},
			200,
			{
				status: "success",
				path: "logout",
			}
		);
	} catch (err: any) {
		return next(err);
	}
};

export default logout;
