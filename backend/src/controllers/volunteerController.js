import asyncHandler from "../utils/asyncHandler.js";
import * as volunteerService from "../services/volunteerService.js";

export const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.listVolunteers(req.query);
  res.json(volunteers);
});

export const searchVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.searchVolunteers(req.query.q);
  res.json(volunteers);
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
