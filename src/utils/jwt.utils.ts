import jwt, { SignOptions } from "jsonwebtoken";

export const signJwt = (
	payload: Object,
	key:
		| "process.env.JWT_ACCESS_PRIVATE_SECRET"
		| "process.env.JWT_REFRESH_PRIVATE_SECRET"
		| "process.env.JWT_PRIVATE_ACTIVATION",
	options: SignOptions = {}
) => {
	const privateKey = Buffer.from(key, "base64").toString("ascii");

	return jwt.sign(payload, privateKey, {
		...(options && options),
		algorithm: "RS256",
	});
};

export const verifyJwt = <T>(
	token: string,
	key:
		| "process.env.JWT_ACCESS_PUBLIC_SECRET"
		| "process.env.JWT_REFRESH_PUBLIC_SECRET"
		| "process.env.JWT_PUBLIC_ACTIVATION"
): T | null => {
	try {
		const publicKey = Buffer.from(key, "base64").toString("ascii");

		return jwt.verify(token, publicKey) as T;
	} catch (error) {
		console.log(error);
		return error as T;
	}
};
