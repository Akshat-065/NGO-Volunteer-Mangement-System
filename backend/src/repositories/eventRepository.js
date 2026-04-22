import Event from "../models/Event.js";

const assignedVolunteerPopulate = {
  path: "assignedVolunteers",
  populate: {
    path: "userId",
    select: "name email avatarUrl"
  }
};

export const createEvent = (payload) => Event.create(payload);

export const findEvents = (filter = {}, options = {}) => {
  const { populateAssignedVolunteers = true, sort = { date: 1 }, limit } = options;
  let query = Event.find(filter).sort(sort);

  if (limit) {
    query = query.limit(limit);
  }

  if (populateAssignedVolunteers) {
    query = query.populate(assignedVolunteerPopulate);
  }

  return query;
};

export const findEventById = (eventId, options = {}) => {
  const { populateAssignedVolunteers = false } = options;
  let query = Event.findById(eventId);

  if (populateAssignedVolunteers) {
    query = query.populate(assignedVolunteerPopulate);
  }

  return query;
};

export const countEvents = (filter = {}) => Event.countDocuments(filter);

export const updateEventsPullVolunteer = (volunteerId) =>
  Event.updateMany({ assignedVolunteers: volunteerId }, { $pull: { assignedVolunteers: volunteerId } });

export const addVolunteerToEvent = (eventId, volunteerId) =>
  Event.findByIdAndUpdate(eventId, { $addToSet: { assignedVolunteers: volunteerId } });

export const removeVolunteerFromEvent = (eventId, volunteerId) =>
  Event.findByIdAndUpdate(eventId, { $pull: { assignedVolunteers: volunteerId } });

export const deleteEventById = (eventId) => Event.findByIdAndDelete(eventId);
