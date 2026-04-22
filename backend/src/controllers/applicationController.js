import asyncHandler from "../utils/asyncHandler.js";
import * as applicationService from "../services/applicationService.js";

const emitApplicationEvent = (req, eventName, payload) => {
  const io = req.app.get("io");

  if (!io) {
    return;
  }

  io.emit(eventName, payload);
};

export const apply = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToEvent(req.user._id, req.body.eventId);
  emitApplicationEvent(req, "application:created", {
    type: "application-created",
    application
  });
  res.status(201).json(application);
});

export const listApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listApplications(req.user, req.query);
  res.json(applications);
});

export const updateApplication = asyncHandler(async (req, res) => {
  const { application, previousStatus } = await applicationService.reviewApplication(
    req.params.id,
    req.body.status
  );
  emitApplicationEvent(req, "application:statusChanged", {
    type: "application-status-changed",
    application,
    previousStatus
  });
  res.json(application);
});
