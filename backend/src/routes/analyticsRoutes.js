import express from "express";
import { getSummary } from "../controllers/analyticsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getSummary);

export default router;
