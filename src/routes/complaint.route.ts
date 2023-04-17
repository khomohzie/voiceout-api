import express, { Router } from "express";
import uploader from "@config/uploader";

const router: Router = express.Router();

//Import Controller
import {
  complaintDetails,
  getMyComplaints,
  submitComplaint,
} from "../controllers/complaint";

//Import middleware
import { logger } from "../middlewares/logger.middleware";
import { requireSignin } from "../middlewares/auth.middleware";

router.post(
  "/complaint",
  requireSignin("user"),
  uploader.array("attachments"),
  submitComplaint
);

router.get("/complaints/me", requireSignin("user"), getMyComplaints);

router.get("/complaints/:id", complaintDetails);

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
