import express from "express";
import User from "../models/User.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { serializeSessionUser } from "../utils/serializers.js";

const router = express.Router();

router.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(serializeSessionUser));
  })
);

export default router;
