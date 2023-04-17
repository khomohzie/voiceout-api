import express, { Router } from "express";

const router: Router = express.Router();

//Import Controller
import {
  signup,
  login,
  logout,
  sendEmail,
  verifyEmail,
  refresh,
  forgot,
  reset,
  googlefacebooklogin,
} from "../controllers/auth";

import { validate } from "../middlewares/validate.middleware";
import { requireSignin } from "../middlewares/auth.middleware";

import { createUserSchema, loginUserSchema } from "../schema/user.schema";

router.post("/auth/signup", validate(createUserSchema), signup);
router.post("/auth/login", validate(loginUserSchema), login("user"));
router.post("/auth/admin/login", validate(loginUserSchema), login("admin"));
router.post(
  "/auth/superadmin/login",
  validate(loginUserSchema),
  login("superadmin")
);
router.post(
  "/auth/googlefacebooklogin",
  validate(loginUserSchema),
  googlefacebooklogin
);

router.post("/auth/logout", requireSignin("user"), logout);

router.post("/auth/forgot", forgot);
router.put("/auth/reset", reset);

router.post("/auth/resend", sendEmail);
router.put("/auth/verify", verifyEmail);
router.get("/auth/refresh", refresh);

//Import middleware
import { logger } from "../middlewares/logger.middleware";

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
