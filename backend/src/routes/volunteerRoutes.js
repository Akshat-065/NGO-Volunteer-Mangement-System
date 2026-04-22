import express from "express";
import {
  createVolunteer,
  deleteVolunteer,
  getVolunteers,
  searchVolunteers,
  updateVolunteer
} from "../controllers/volunteerController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  volunteerCreateSchema,
  volunteerIdParamSchema,
  volunteerListSchema,
  volunteerUpdateSchema
} from "../validators/volunteerSchemas.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", validate(volunteerListSchema), getVolunteers);
router.get("/search", validate(volunteerListSchema), searchVolunteers);
router.post("/", validate(volunteerCreateSchema), createVolunteer);
router.put("/:id", validate(volunteerUpdateSchema), updateVolunteer);
router.delete("/:id", validate(volunteerIdParamSchema), deleteVolunteer);

export default router;
