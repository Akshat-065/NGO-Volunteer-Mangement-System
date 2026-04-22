import express from "express";
import {
  forgotPassword,
  getCsrfToken,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "../validators/authSchemas.js";

const router = express.Router();

router.get("/csrf-token", getCsrfToken);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/verify-email/resend", validate(resendVerificationSchema), resendVerification);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
