import Application from "../models/Application.js";

const volunteerPopulate = {
  path: "volunteerId",
  populate: {
    path: "userId",
    select: "name email avatarUrl"
  }
};

export const createApplication = (payload) => Application.create(payload);

export const findApplicationByVolunteerAndEvent = (volunteerId, eventId) =>
  Application.findOne({ volunteerId, eventId });

export const findApplications = (filter = {}, options = {}) => {
  const { populate = true, sort = { createdAt: -1 }, limit } = options;
  let query = Application.find(filter).sort(sort);

  if (limit) {
    query = query.limit(limit);
  }

  if (populate) {
    query = query
      .populate(volunteerPopulate)
      .populate("eventId", "title date location status");
  }

  return query;
};

export const findApplicationById = (applicationId, options = {}) => {
  const { populate = false } = options;
  let query = Application.findById(applicationId);

  if (populate) {
    query = query
      .populate(volunteerPopulate)
      .populate("eventId", "title date location status");
  }

  return query;
};

export const countApplications = (filter = {}) => Application.countDocuments(filter);

export const deleteApplications = (filter = {}) => Application.deleteMany(filter);

