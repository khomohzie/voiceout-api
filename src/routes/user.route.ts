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

router.get("/user/all", requireSignin, isAdmin, profiles);
router.get("/user/data/:id", requireSignin, isAdmin, aUserData);

router.get("/user/me", requireSignin, userProfile);
router.put("/user/me", requireSignin, formidable(), updateProfile);

router.put("/user/avatar", requireSignin, formidable(), changeAvatar);
router.put("/user/cover", requireSignin, formidable(), changeCoverImage);

// Security routes
router.put("/user/me/password", requireSignin, changePassword);

router.delete("/user/me/delete", requireSignin, deleteAccount);
router.delete("/user/all/delete", requireSignin, isAdmin, deleteAll);

logger({
	allowed: ["status", "host", "method", "protocol", "path"],
	log: process.env.NODE_ENV !== "production",
	// format: "[STATUS] [METHOD] [PATH] [TIME]",
});

export default router;
