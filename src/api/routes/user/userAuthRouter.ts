import { Router } from "express";
import passport from "passport";
import { login, register } from "../../controllers/user/auth.controller";
import {
  validateLogin,
  validateRegister,
} from "../../validators/auth.validator";
const router = Router();

// AUTH ROUTES

router.post("/register", validateRegister, register);
router.post(
  "/login",
  validateLogin,
  passport.authenticate("local", { session: false }),
  login
);

// email verification, password reset, routes
router.post("/forgot-password");
router.post("/reset-password");

router.post("/verify-email");
router.post("/verify-email/:token");

router.post("/refresh-token");

export default router;
