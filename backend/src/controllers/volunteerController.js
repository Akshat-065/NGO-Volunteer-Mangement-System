import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import { serializeVolunteer } from "../utils/serializers.js";
import * as volunteerService from "../services/volunteerService.js";

const populateUserSelect = "name email phone location bio interests avatarUrl";

const dedupeVolunteers = (volunteers) =>
  [...new Map(volunteers.map((volunteer) => [String(volunteer._id), volunteer])).values()];

export const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.listVolunteers(req.query);
  res.json(volunteers);
});

export const searchVolunteers = asyncHandler(async (req, res) => {
  const searchText = (req.query.q || "").trim();

  if (!searchText) {
    res.json([]);
    return;
  }

  const searchRegex = new RegExp(searchText, "i");

  const [matchedUsers, skillMatches] = await Promise.all([
    User.find({ name: searchRegex }).select("_id"),
    Volunteer.find({ skills: searchRegex }).populate("userId", populateUserSelect)
  ]);

  const matchedUserIds = matchedUsers.map((user) => user._id);
  const nameMatches = matchedUserIds.length
    ? await Volunteer.find({ userId: { $in: matchedUserIds } }).populate(
        "userId",
        populateUserSelect
      )
    : [];

  const volunteers = dedupeVolunteers([...nameMatches, ...skillMatches]).sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );

  res.json(volunteers.map(serializeVolunteer));
});

export const createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.createVolunteer(req.body);
  res.status(201).json(volunteer);
});

export const updateVolunteer = asyncHandler(async (req, res) => {
  const updated = await volunteerService.updateVolunteer(req.params.id, req.body);
  res.json(updated);
});

export const deleteVolunteer = asyncHandler(async (req, res) => {
  const result = await volunteerService.deleteVolunteer(req.params.id);
  res.json(result);
});
