import express from "express";
import { apply, listApplications, updateApplication } from "../controllers/applicationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { applicationUpdateSchema, applicationsListSchema, applySchema } from "../validators/applicationSchemas.js";

const router = express.Router();

router.post("/apply", protect, authorize("volunteer"), validate(applySchema), apply);
router.get("/applications", protect, validate(applicationsListSchema), listApplications);
router.put("/applications/:id", protect, authorize("admin"), validate(applicationUpdateSchema), updateApplication);

export default router;

