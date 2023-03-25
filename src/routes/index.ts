import { Router } from "express";
import { default as scrawny } from "scrawny";
import { default as authRoute } from "./auth.route";
import { default as userRoute } from "./user.route";
import { default as complaintRoute } from "./complaint.route";
import { default as superAdminRoute } from "./superadmin.route";

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

router.use(
  "",
  scrawny({
    log: true,
  }),
  complaintRoute
);

router.use(
  "",
  scrawny({
    log: true,
  }),
  superAdminRoute
);

export default router;
