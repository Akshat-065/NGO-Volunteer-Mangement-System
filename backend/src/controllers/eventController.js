import asyncHandler from "../utils/asyncHandler.js";
import * as eventService from "../services/eventService.js";

export const getEvents = asyncHandler(async (_req, res) => {
  const events = await eventService.listEvents();
  res.json(events);
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body);
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id);
  res.json(result);
});

