import { Secret } from "jwt-promisify";
import { Request } from "express";
import { IUser } from "./src/interfaces/auth.interfaces";
import { TUser } from "./src/models/user.model";
import mongoose from "mongoose";
import nodemailer, {
	TransportOptions,
	Transporter,
	Transport,
} from "nodemailer";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production" | "test";
			PORT: number;
			DB_HOST: string;
			DB_PORT: number;
			DB_USER: string;
			DB_PASSWORD: string;
			DB_NAME: string;
			DB_NAME_TEST: string;
			JWT_ACCESS_PRIVATE_SECRET: Secret;
			JWT_ACCESS_PUBLIC_SECRET: Secret;
			JWT_REFRESH_PRIVATE_SECRET: Secret;
			JWT_REFRESH_PUBLIC_SECRET: Secret;
			JWT_PRIVATE_ACTIVATION: Secret;
			JWT_PUBLIC_ACTIVATION: Secret;
			REDIS_URL: string;
			PROD_API: string;
			DEV_API: string;
			ACCESS_TOKEN_EXPIRES_IN: number;
			REFRESH_TOKEN_EXPIRES_IN: number;
			ACTIVATION_TOKEN_EXPIRES_IN: number;
			ACCESS_TOKEN_EXPIRES_IN_DAY: number;
			REFRESH_TOKEN_EXPIRES_IN_DAY: number;
			PAYSTACK_SECRET: string;
			CLIENT_URL: string;
			DB_HOST_PROD: string;
			DB_PORT_PROD: number;
			DB_USER_PROD: string;
			DB_PASSWORD_PROD: string;
			DB_NAME_PROD: string;
		}
	}

	namespace Express {
		export interface Request {
			user: {
				_id: string;
				email?: string;
				expiresIn?: any;
			};
		}
	}
}

declare module "nodemailer" {
	export interface TransportOptions {
		host?: string;
		service?: string;
		auth: {};
	}

	export interface Transporter {
		host?: string;
		service?: string;
		auth: {};
	}

	export interface Transport {
		host?: string;
		service?: string;
		auth: {};
	}
}

export {};
