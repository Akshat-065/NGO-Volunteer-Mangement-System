import express from "express";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { eventCreateSchema, eventIdParamSchema, eventUpdateSchema } from "../validators/eventSchemas.js";

const router = express.Router();

router.use(protect);

router.get("/", getEvents);
router.post("/", authorize("admin"), validate(eventCreateSchema), createEvent);
router.put("/:id", authorize("admin"), validate(eventUpdateSchema), updateEvent);
router.delete("/:id", authorize("admin"), validate(eventIdParamSchema), deleteEvent);

export default router;

