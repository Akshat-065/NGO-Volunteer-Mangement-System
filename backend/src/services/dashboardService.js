import * as applicationRepository from "../repositories/applicationRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import * as volunteerRepository from "../repositories/volunteerRepository.js";
import { calculateProfileCompletion } from "../utils/profile.js";
import { isPrivilegedRole } from "../utils/roles.js";

const getMonthLabel = (date) =>
  date.toLocaleString("en-US", {
    month: "short"
  });

export const getDashboardStats = async (user) => {
  if (isPrivilegedRole(user.role)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalVolunteers, activeEvents, pendingRequests, recentApplications, allApplications] =
      await Promise.all([
        volunteerRepository.countVolunteers(),
        eventRepository.countEvents({ date: { $gte: today } }),
        applicationRepository.countApplications({ status: "Pending" }),
        applicationRepository.findApplications({}, { populate: true, sort: { createdAt: -1 }, limit: 5 }),
        applicationRepository.findApplications({}, { populate: false, sort: { createdAt: 1 } })
      ]);

    const chartBuckets = Array.from({ length: 6 }, (_value, index) => {
      const cursor = new Date();
      cursor.setMonth(cursor.getMonth() - (5 - index));
      return {
        month: getMonthLabel(cursor),
        applications: 0
      };
    });

    allApplications.forEach((application) => {
      const month = getMonthLabel(new Date(application.createdAt));
      const bucket = chartBuckets.find((item) => item.month === month);
      if (bucket) {
        bucket.applications += 1;
      }
    });

    return {
      role: user.role,
      stats: {
        totalVolunteers,
        activeEvents,
        pendingRequests,
        totalApplications: allApplications.length
      },
      chartData: chartBuckets,
      recentActivity: recentApplications.map((application) => ({
        id: application._id,
        volunteerName: application.volunteerId?.userId?.name || "Volunteer",
        volunteerAvatar: application.volunteerId?.userId?.avatarUrl || "",
        eventTitle: application.eventId?.title || "Event",
        status: application.status,
        createdAt: application.createdAt
      }))
    };
  }

  const volunteer = await volunteerRepository.findVolunteerByUserId(user._id, { populateUser: false });

  const [upcomingEventCount, joinedEventCount, pendingApplications, upcomingEvents, joinedEvents, freshUser] =
    await Promise.all([
      eventRepository.countEvents({ status: "Upcoming" }),
      volunteer ? eventRepository.countEvents({ assignedVolunteers: volunteer._id }) : 0,
      volunteer
        ? applicationRepository.countApplications({ volunteerId: volunteer._id, status: "Pending" })
        : 0,
      eventRepository.findEvents({ status: "Upcoming" }, { populateAssignedVolunteers: false, sort: { date: 1 }, limit: 6 }),
      volunteer
        ? eventRepository.findEvents({ assignedVolunteers: volunteer._id }, { populateAssignedVolunteers: false, sort: { date: 1 }, limit: 6 })
        : [],
      userRepository.findUserById(user._id)
    ]);

  return {
    role: "volunteer",
    stats: {
      upcomingEvents: upcomingEventCount,
      joinedEvents: joinedEventCount,
      pendingApplications,
      profileCompletion: calculateProfileCompletion(freshUser, volunteer)
    },
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      status: event.status,
      assignedCount: event.assignedVolunteers.length
    })),
    joinedEvents: joinedEvents.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      location: event.location,
      status: event.status
    }))
  };
};
