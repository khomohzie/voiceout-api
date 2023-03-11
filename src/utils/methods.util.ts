import randToken from "rand-token";
import redisClient from "./redis.util";

// Token methods
const tokenMethods = {
	create: async (data = "", length = 4, expiry = 600) => {
		const token = randToken.uid(length);
		const identifier = `otp:${token}`;
		const pointer = `otppointer:${data}`;

		await redisClient.setEx(identifier, expiry, data);
		await redisClient.setEx(pointer, expiry, token);

		return token;
	},

	get: async (token: string) => {
		const identifier = `otp:${token}`;

		// Check if it exists in redis
		const exists = await redisClient.exists(identifier);

		if (exists) {
			const data = await redisClient.get(identifier);
			return data;
		} else {
			return null;
		}
	},

	delete: async (token: string) => {
		const identifier = `otp:${token}`;
		const data = await redisClient.get(identifier);
		const pointer = `otppointer:${data}`;

		// Check if it exists in redis
		const exists = await redisClient.exists(identifier);

		if (exists) {
			await redisClient.del(identifier);
			if (pointer) {
				await redisClient.del(pointer);
			}
			return true;
		} else {
			return false;
		}
	},

	verify: async (token: string) => {
		const identifier = `otp:${token}`;

		// Check if it exists in redis
		const exists = await redisClient.exists(identifier);

		if (exists) {
			return true;
		} else {
			return false;
		}
	},

	exists: async (data: any) => {
		const pointer = `otppointer:${data}`;

		// Check if it exists in redis
		const exists = await redisClient.exists(pointer);
		return exists;
	},
};

export default tokenMethods;
