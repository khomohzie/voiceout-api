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
      MONGO_URI: string;
      MONGO_URI_CLOUD: string;
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
      DEVELOPER_EMAIL: string;
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
