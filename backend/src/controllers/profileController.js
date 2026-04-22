import asyncHandler from "../utils/asyncHandler.js";
import * as profileService from "../services/profileService.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user._id);
  res.json(profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user._id, req.body);
  res.json(profile);
});

