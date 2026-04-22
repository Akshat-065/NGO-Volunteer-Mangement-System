import AppError from "../utils/AppError.js";
import { deriveEventStatus } from "../models/Event.js";
import * as applicationRepository from "../repositories/applicationRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import { serializeEvent } from "../utils/serializers.js";

const normalizeEventStatus = async (event) => {
  const derived = deriveEventStatus(event.date);
  if (event.status !== derived) {
    event.status = derived;
    await event.save();
  }
};

export const listEvents = async () => {
  const events = await eventRepository.findEvents({}, { populateAssignedVolunteers: true, sort: { date: 1 } });
  await Promise.all(events.map(normalizeEventStatus));
  return events.map(serializeEvent);
};

export const createEvent = async (payload) => {
  const { title, description, date, location, assignedVolunteers = [] } = payload;
  const uniqueAssignedVolunteers = [...new Set(assignedVolunteers)];

  const event = await eventRepository.createEvent({
    title,
    description,
    date,
    location,
    assignedVolunteers: uniqueAssignedVolunteers,
    status: deriveEventStatus(date)
  });

  const populated = await eventRepository.findEventById(event._id, { populateAssignedVolunteers: true });
  return serializeEvent(populated);
};

export const updateEvent = async (eventId, payload) => {
  const event = await eventRepository.findEventById(eventId, { populateAssignedVolunteers: false });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const { title, description, date, location, assignedVolunteers } = payload;

  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.date = date ?? event.date;
  event.location = location ?? event.location;

  if (assignedVolunteers) {
    event.assignedVolunteers = [...new Set(assignedVolunteers)];
  }

  event.status = deriveEventStatus(event.date);
  await event.save();

  const populated = await eventRepository.findEventById(eventId, { populateAssignedVolunteers: true });
  return serializeEvent(populated);
};

export const deleteEvent = async (eventId) => {
  const event = await eventRepository.findEventById(eventId, { populateAssignedVolunteers: false });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  await applicationRepository.deleteApplications({ eventId: event._id });
  await eventRepository.deleteEventById(event._id);

  return { message: "Event deleted successfully" };
};

