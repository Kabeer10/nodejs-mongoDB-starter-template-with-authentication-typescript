import { Router } from "express";
import passport from "passport";
import {
  forgetPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
} from "../../controllers/user/auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import {
  validateForgetPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyEmail,
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
router.get("/logout", logout);

// GOOGLE login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, _, next) => {
    req.body.type = "GOOGLE";
    next();
  },
  login
);

// email verification, password reset, routes
router.post("/forgot-password", validateForgetPassword, forgetPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

router.post("/verify-email", verifyJWT, sendEmailVerification);
router.put("/verify-email", verifyJWT, validateVerifyEmail, verifyEmail);

router.post("/refresh-token", refreshToken);

export default router;
