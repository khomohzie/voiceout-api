import express, { Router } from "express";
import formidable from "express-formidable-typescript";
import uploader from "@config/uploader";

const router: Router = express.Router();

//Import Controller
import { register } from "../controllers/super_admin";

//Import middleware
import { logger } from "../middlewares/logger.middleware";
import { requireSignin, isAdmin } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

import { createAdminSchema } from "schema/admin.schema";

router.post(
  "/superadmin/register",
  uploader.array("id_photo"),
  validate(createAdminSchema),
  register
);

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
