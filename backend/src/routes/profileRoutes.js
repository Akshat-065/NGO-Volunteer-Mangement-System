import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProfileImage } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import { profileUpdateSchema } from "../validators/profileSchemas.js";
import * as userRepository from "../repositories/userRepository.js";

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.post(
  "/avatar",
  uploadProfileImage,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("Please choose an image to upload", 400);
    }

    const user = await userRepository.findUserById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/profile-images/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.status(201).json({
      message: "Profile image uploaded successfully",
      avatarUrl
    });
  })
);
router.put("/", validate(profileUpdateSchema), updateProfile);

export default router;
