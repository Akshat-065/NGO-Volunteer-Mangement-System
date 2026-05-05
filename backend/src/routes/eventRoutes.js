import express from "express";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/eventController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { eventCreateSchema, eventIdParamSchema, eventUpdateSchema } from "../validators/eventSchemas.js";

const router = express.Router();

router.get("/", getEvents);

router.post("/", protect, adminOnly, validate(eventCreateSchema), createEvent);
router.put("/:id", protect, adminOnly, validate(eventUpdateSchema), updateEvent);
router.delete("/:id", protect, adminOnly, validate(eventIdParamSchema), deleteEvent);

export default router;
