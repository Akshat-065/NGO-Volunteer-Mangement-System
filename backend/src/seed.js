import { loadEnv } from "./config/loadEnv.js";
import connectDB from "./config/db.js";
import Application from "./models/Application.js";
import Event, { deriveEventStatus } from "./models/Event.js";
import User from "./models/User.js";
import Volunteer from "./models/Volunteer.js";
import { getLogger } from "./utils/logger.js";
import { ROLES } from "./utils/roles.js";

loadEnv();
const logger = getLogger();

const seedData = async () => {
  await connectDB();

  await Promise.all([
    Application.deleteMany(),
    Event.deleteMany(),
    Volunteer.deleteMany(),
    User.deleteMany()
  ]);

  await User.create([
    {
      name: "Aisha Rahman",
      email: "admin@ngo.org",
      password: "Admin123!",
      role: ROLES.ADMIN,
      isEmailVerified: true,
      phone: "+91 98765 43210",
      location: "Kolkata",
      bio: "Operations lead coordinating volunteer programs across education and healthcare drives.",
      interests: ["Community Outreach", "Impact Reporting"],
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Sara Iqbal",
      email: "superadmin@ngo.org",
      password: "SuperAdmin123!",
      role: ROLES.SUPER_ADMIN,
      isEmailVerified: true,
      phone: "+91 98989 89898",
      location: "Kolkata",
      bio: "Platform owner responsible for governance, security, and privileged administration.",
      interests: ["Platform Governance", "Security"],
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  const volunteerUsers = await User.create([
    {
      name: "Rohan Sen",
      email: "rohan@ngo.org",
      password: "Volunteer123!",
      role: ROLES.VOLUNTEER,
      isEmailVerified: true,
      phone: "+91 90000 11111",
      location: "Howrah",
      bio: "Engineering student who helps with logistics, registration desks, and on-ground support.",
      interests: ["Education", "Youth Programs"],
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Meera Dutta",
      email: "meera@ngo.org",
      password: "Volunteer123!",
      role: ROLES.VOLUNTEER,
      isEmailVerified: true,
      phone: "+91 90000 22222",
      location: "Salt Lake",
      bio: "Community volunteer focused on donor coordination and beneficiary communication.",
      interests: ["Healthcare", "Communication"],
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Arjun Ghosh",
      email: "arjun@ngo.org",
      password: "Volunteer123!",
      role: ROLES.VOLUNTEER,
      isEmailVerified: true,
      phone: "+91 90000 33333",
      location: "New Town",
      bio: "Weekend volunteer experienced in logistics planning and public engagement.",
      interests: ["Environment", "Fundraising"],
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  const volunteers = await Volunteer.create([
    {
      userId: volunteerUsers[0]._id,
      skills: ["Event Coordination", "Registration", "Excel"],
      availability: "Weekends"
    },
    {
      userId: volunteerUsers[1]._id,
      skills: ["Public Speaking", "Volunteer Training", "Community Outreach"],
      availability: "Flexible"
    },
    {
      userId: volunteerUsers[2]._id,
      skills: ["Logistics", "First Aid", "Photography"],
      availability: "Evenings"
    }
  ]);

  const now = new Date();
  const events = await Event.create([
    {
      title: "Community Health Camp",
      description: "Free health checkups, awareness sessions, and medication distribution for local families.",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 10, 0),
      location: "Shibpur Community Center",
      assignedVolunteers: [volunteers[1]._id]
    },
    {
      title: "River Cleanup Drive",
      description: "Weekend cleanup and waste segregation initiative along the riverfront.",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12, 8, 30),
      location: "Prinsep Ghat",
      assignedVolunteers: [volunteers[0]._id, volunteers[2]._id]
    },
    {
      title: "School Supply Distribution",
      description: "Distribute learning kits and stationery to students before the new term.",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 9, 0),
      location: "Behala Municipal School",
      assignedVolunteers: [volunteers[0]._id]
    }
  ]);

  await Promise.all(
    events.map(async (event) => {
      event.status = deriveEventStatus(event.date);
      await event.save();
    })
  );

  await Application.create([
    {
      volunteerId: volunteers[1]._id,
      eventId: events[0]._id,
      status: "Approved"
    },
    {
      volunteerId: volunteers[0]._id,
      eventId: events[1]._id,
      status: "Approved"
    },
    {
      volunteerId: volunteers[2]._id,
      eventId: events[1]._id,
      status: "Approved"
    },
    {
      volunteerId: volunteers[2]._id,
      eventId: events[0]._id,
      status: "Pending"
    },
    {
      volunteerId: volunteers[0]._id,
      eventId: events[2]._id,
      status: "Approved"
    }
  ]);

  logger.info("Seed completed successfully");
  logger.info("Admin login: admin@ngo.org / Admin123!");
  logger.info("Super Admin login: superadmin@ngo.org / SuperAdmin123!");
  logger.info("Volunteer login: rohan@ngo.org / Volunteer123!");

  process.exit(0);
};

seedData().catch((error) => {
  logger.error(`Seed failed: ${error.message}`);
  process.exit(1);
});
