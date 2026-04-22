import AppError from "../utils/AppError.js";
import * as applicationRepository from "../repositories/applicationRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import * as volunteerRepository from "../repositories/volunteerRepository.js";
import { serializeApplication } from "../utils/serializers.js";

export const applyToEvent = async (userId, eventId) => {
  const volunteer = await volunteerRepository.findVolunteerByUserId(userId, { populateUser: false });
  if (!volunteer) {
    throw new AppError("Volunteer profile not found", 404);
  }

  const event = await eventRepository.findEventById(eventId, { populateAssignedVolunteers: false });
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const existing = await applicationRepository.findApplicationByVolunteerAndEvent(volunteer._id, eventId);
  if (existing) {
    throw new AppError("You have already applied to this event", 409);
  }

  const application = await applicationRepository.createApplication({
    volunteerId: volunteer._id,
    eventId
  });

  const populated = await applicationRepository.findApplicationById(application._id, { populate: true });
  return serializeApplication(populated);
};

export const listApplications = async (user, filters = {}) => {
  const { status } = filters;
  const query = {};

  if (user.role === "volunteer") {
    const volunteer = await volunteerRepository.findVolunteerByUserId(user._id, { populateUser: false });
    if (!volunteer) {
      return [];
    }
    query.volunteerId = volunteer._id;
  }

  if (status) {
    query.status = status;
  }

  const applications = await applicationRepository.findApplications(query, { populate: true, sort: { createdAt: -1 } });
  return applications.map(serializeApplication);
};

export const reviewApplication = async (applicationId, status) => {
  const application = await applicationRepository.findApplicationById(applicationId, { populate: false });
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const previousStatus = application.status;
  application.status = status;
  await application.save();

  if (status === "Approved") {
    await eventRepository.addVolunteerToEvent(application.eventId, application.volunteerId);
  }

  if (status === "Rejected") {
    await eventRepository.removeVolunteerFromEvent(application.eventId, application.volunteerId);
  }

  const populated = await applicationRepository.findApplicationById(application._id, { populate: true });
  return {
    application: serializeApplication(populated),
    previousStatus
  };
};
