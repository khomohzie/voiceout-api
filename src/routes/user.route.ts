import express, { Router } from "express";
import formidable from "express-formidable-typescript";

const router: Router = express.Router();

//Import Controller
import {
  updateProfile,
  changeAvatar,
  changeCoverImage,
  profiles,
  userProfile,
  aUserData,
  changePassword,
  deleteAccount,
  deleteAll,
} from "../controllers/user";

//Import middleware
import { logger } from "../middlewares/logger.middleware";
import { requireSignin, isAdmin } from "../middlewares/auth.middleware";

router.get("/user/all", requireSignin("admin"), isAdmin, profiles);
router.get("/user/data/:id", requireSignin("admin"), isAdmin, aUserData);

router.get("/user/me", requireSignin("user"), userProfile);
router.put("/user/me", requireSignin("user"), formidable(), updateProfile);

router.put("/user/avatar", requireSignin("user"), formidable(), changeAvatar);
router.put(
  "/user/cover",
  requireSignin("user"),
  formidable(),
  changeCoverImage
);

// Security routes
router.put("/user/me/password", requireSignin("user"), changePassword);

router.delete("/user/me/delete", requireSignin("user"), deleteAccount);

logger({
  allowed: ["status", "host", "method", "protocol", "path"],
  log: process.env.NODE_ENV !== "production",
  // format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
