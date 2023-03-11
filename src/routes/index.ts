import { Router } from "express";
import { default as scrawny } from "scrawny";
import { default as authRoute } from "./auth.route";
import { default as userRoute } from "./user.route";

const router: Router = require("express").Router();

router.use(
	"",
	scrawny({
		log: true,
	}),
	authRoute
);

router.use(
	"",
	scrawny({
		log: true,
	}),
	userRoute
);

export default router;
