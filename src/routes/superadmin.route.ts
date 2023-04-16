import express, { Router } from "express";
import formidable from "express-formidable-typescript";
import uploader from "@config/uploader";

const router: Router = express.Router();

//Import Controller
import {
  reassignComplaint,
  register,
  retrieveAllComplaints,
} from "../controllers/super_admin";

//Import middleware
import { logger } from "../middlewares/logger.middleware";
import { requireSignin, isSuperAdmin } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

import { createSuperAdminSchema } from "schema/superadmin.schema";

router.post(
  "/superadmin/register",
  uploader.array("id_photo"),
  validate(createSuperAdminSchema),
  register
);

router.post(
  "/superadmin/reassign",
  requireSignin,
  isSuperAdmin,
  reassignComplaint
);

router.get(
  "/superadmin/complaints",
  requireSignin,
  isSuperAdmin,
  retrieveAllComplaints
);

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
