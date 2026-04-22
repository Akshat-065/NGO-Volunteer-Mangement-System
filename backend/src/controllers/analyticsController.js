import asyncHandler from "../utils/asyncHandler.js";
import Application from "../models/Application.js";
import Event from "../models/Event.js";
import Volunteer from "../models/Volunteer.js";

const aggregateCount = async (model, fieldName) => {
  const [result] = await model.aggregate([{ $count: fieldName }]);
  return result?.[fieldName] ?? 0;
};

export const getSummary = asyncHandler(async (_req, res) => {
  const [totalVolunteers, totalEvents, totalApplications] = await Promise.all([
    aggregateCount(Volunteer, "totalVolunteers"),
    aggregateCount(Event, "totalEvents"),
    aggregateCount(Application, "totalApplications")
  ]);

  res.json({
    totals: {
      totalVolunteers,
      totalEvents,
      totalApplications
    }
  });
});
