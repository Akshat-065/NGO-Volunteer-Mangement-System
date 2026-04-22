import AppError from "../utils/AppError.js";
import { serializeVolunteer } from "../utils/serializers.js";
import * as applicationRepository from "../repositories/applicationRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import * as volunteerRepository from "../repositories/volunteerRepository.js";

export const listVolunteers = async (filters = {}) => {
  const { q = "", availability = "", skill = "" } = filters;

  const filter = {};

  if (availability) {
    filter.availability = availability;
  }

  if (skill) {
    filter.skills = { $elemMatch: { $regex: skill, $options: "i" } };
  }

  const searchText = q.trim();
  if (searchText) {
    const userIds = await userRepository.findUserIdsBySearch(searchText);
    if (!userIds.length) {
      return [];
    }
    filter.userId = { $in: userIds };
  }

  const volunteers = await volunteerRepository.findVolunteers(filter, {
    populateUser: true,
    sort: { createdAt: -1 }
  });

  return volunteers.map(serializeVolunteer);
};

export const createVolunteer = async (payload) => {
  const {
    name,
    email,
    password,
    phone = "",
    location = "",
    bio = "",
    interests = [],
    skills = [],
    availability = "Flexible"
  } = payload;

  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw new AppError("A volunteer with this email already exists", 409);
  }

  const user = await userRepository.createUser({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    location,
    bio,
    interests,
    role: "volunteer"
  });

  try {
    const volunteer = await volunteerRepository.createVolunteer({
      userId: user._id,
      skills,
      availability
    });

    const populated = await volunteerRepository.findVolunteerById(volunteer._id, { populateUser: true });
    return serializeVolunteer(populated);
  } catch (error) {
    await userRepository.deleteUserById(user._id);
    throw error;
  }
};

export const updateVolunteer = async (volunteerId, payload) => {
  const volunteer = await volunteerRepository.findVolunteerById(volunteerId, { populateUser: true });

  if (!volunteer) {
    throw new AppError("Volunteer not found", 404);
  }

  const {
    name,
    email,
    phone,
    location,
    bio,
    interests,
    skills,
    availability,
    password
  } = payload;

  if (email && email.toLowerCase() !== volunteer.userId.email) {
    const taken = await userRepository.isEmailTaken(email, volunteer.userId._id);
    if (taken) {
      throw new AppError("Another user already uses this email address", 409);
    }
  }

  volunteer.userId.name = name ?? volunteer.userId.name;
  volunteer.userId.email = email?.toLowerCase() ?? volunteer.userId.email;
  volunteer.userId.phone = phone ?? volunteer.userId.phone;
  volunteer.userId.location = location ?? volunteer.userId.location;
  volunteer.userId.bio = bio ?? volunteer.userId.bio;
  volunteer.userId.interests = interests ?? volunteer.userId.interests;

  if (password) {
    volunteer.userId.password = password;
  }

  volunteer.skills = skills ?? volunteer.skills;
  volunteer.availability = availability ?? volunteer.availability;

  await volunteer.userId.save();
  await volunteer.save();

  const updated = await volunteerRepository.findVolunteerById(volunteerId, { populateUser: true });
  return serializeVolunteer(updated);
};

export const deleteVolunteer = async (volunteerId) => {
  const volunteer = await volunteerRepository.findVolunteerById(volunteerId, { populateUser: false });

  if (!volunteer) {
    throw new AppError("Volunteer not found", 404);
  }

  await applicationRepository.deleteApplications({ volunteerId: volunteer._id });
  await eventRepository.updateEventsPullVolunteer(volunteer._id);
  await userRepository.deleteUserById(volunteer.userId);
  await volunteerRepository.deleteVolunteerById(volunteer._id);

  return { message: "Volunteer deleted successfully" };
};

