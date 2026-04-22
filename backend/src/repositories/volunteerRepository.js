import Volunteer from "../models/Volunteer.js";

const userSelect = "name email phone location bio interests avatarUrl";

export const createVolunteer = (payload) => Volunteer.create(payload);

export const findVolunteerById = (volunteerId, options = {}) => {
  const { populateUser = true } = options;
  let query = Volunteer.findById(volunteerId);

  if (populateUser) {
    query = query.populate("userId", userSelect);
  }

  return query;
};

export const findVolunteerByUserId = (userId, options = {}) => {
  const { populateUser = false } = options;
  let query = Volunteer.findOne({ userId });

  if (populateUser) {
    query = query.populate("userId", userSelect);
  }

  return query;
};

export const findVolunteers = (filter = {}, options = {}) => {
  const { populateUser = true, sort = { createdAt: -1 } } = options;
  let query = Volunteer.find(filter).sort(sort);

  if (populateUser) {
    query = query.populate("userId", userSelect);
  }

  return query;
};

export const countVolunteers = (filter = {}) => Volunteer.countDocuments(filter);

export const deleteVolunteerById = (volunteerId) => Volunteer.findByIdAndDelete(volunteerId);

