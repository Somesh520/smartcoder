import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  googleAuth,
  googleAuthCallback,
  getCurrentUser,
  logout,
  getHistory,
  github,
  githubcallback,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleAuth);

router.get("/google/callback", googleAuthCallback);
router.get("/current_user", verifyToken, getCurrentUser);
router.get("/logout", logout);
router.get("/history", verifyToken, getHistory);
router.get("/github", github);
router.get("/github/callback", githubcallback);

export default router;
