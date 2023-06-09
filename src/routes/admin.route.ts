import uploader from "@config/uploader";
import express, { Router } from "express";

const router: Router = express.Router();

//Import Controller
import {
  adminList,
  getAssignedComplaints,
  register,
  verifyEmail,
} from "../controllers/admin";

//Import middleware
import { logger } from "../middlewares/logger.middleware";
import { validate } from "../middlewares/validate.middleware";

import { createAdminSchema } from "schema/admin.schema";
import { requireSignin } from "middlewares/auth.middleware";

router.post(
  "/admin/register",
  uploader.array(""),
  validate(createAdminSchema),
  register
);

router.put("/admin/auth/verify", verifyEmail);

router.get("/admin/list", requireSignin("user"), adminList("user"));

router.get(
  "/admin/list/superadmin",
  requireSignin("superadmin"),
  adminList("superadmin")
);

router.get("/admin/complaints", requireSignin("admin"), getAssignedComplaints);

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
