export const serializeSessionUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  phone: user.phone,
  location: user.location,
  bio: user.bio,
  interests: user.interests,
  avatarUrl: user.avatarUrl
});

export const serializeVolunteer = (volunteer) => ({
  id: volunteer._id,
  skills: volunteer.skills,
  availability: volunteer.availability,
  createdAt: volunteer.createdAt,
  user: volunteer.userId
    ? {
        id: volunteer.userId._id,
        name: volunteer.userId.name,
        email: volunteer.userId.email,
        phone: volunteer.userId.phone,
        location: volunteer.userId.location,
        bio: volunteer.userId.bio,
        interests: volunteer.userId.interests,
        avatarUrl: volunteer.userId.avatarUrl
      }
    : null
});

export const serializeEvent = (event) => ({
  id: event._id,
  title: event.title,
  description: event.description,
  date: event.date,
  location: event.location,
  status: event.status,
  assignedVolunteers: (event.assignedVolunteers || []).map((volunteer) => ({
    id: volunteer._id,
    name: volunteer.userId?.name || "Volunteer",
    email: volunteer.userId?.email || "",
    avatarUrl: volunteer.userId?.avatarUrl || ""
  })),
  createdAt: event.createdAt
});

export const serializeApplication = (application) => ({
  id: application._id,
  status: application.status,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
  volunteer: application.volunteerId
    ? {
        id: application.volunteerId._id,
        name: application.volunteerId.userId?.name || "Volunteer",
        email: application.volunteerId.userId?.email || "",
        avatarUrl: application.volunteerId.userId?.avatarUrl || ""
      }
    : null,
  event: application.eventId
    ? {
        id: application.eventId._id,
        title: application.eventId.title,
        date: application.eventId.date,
        location: application.eventId.location,
        status: application.eventId.status
      }
    : null
});
