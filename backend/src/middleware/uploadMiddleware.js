import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import AppError from "../utils/AppError.js";

const uploadRoot = path.resolve(process.cwd(), "uploads", "profile-images");

fs.mkdirSync(uploadRoot, { recursive: true });

const sanitizeFileName = (fileName) =>
  fileName
    .replace(path.extname(fileName), "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "profile-image";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadRoot);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = sanitizeFileName(file.originalname);
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;

    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Only image files are allowed", 400));
      return;
    }

    callback(null, true);
  }
});

export const uploadProfileImage = (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Profile image must be 5MB or smaller", 400));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};
