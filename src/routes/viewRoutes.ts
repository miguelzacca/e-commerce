"use strict";

import express from "express";
import {
  accountPage,
  homePage,
  loginPage,
  registerPage,
  verifyEmailPage,
} from "../controllers/viewControllers.js";

const router = express.Router();

router.get("/", homePage);

router.get("/login", loginPage);

router.get("/register", registerPage);

router.get("/verify-email", verifyEmailPage);

router.get("/account", accountPage);

export default router;
