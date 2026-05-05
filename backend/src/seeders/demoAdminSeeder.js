import * as userRepository from "../repositories/userRepository.js";
import { ROLES } from "../utils/roles.js";

const DEMO_ADMIN_PROFILE = {
  name: "Aisha Rahman",
  email: "admin@ngo.org",
  password: "Admin123",
  phone: "+91 98765 43210",
  location: "Kolkata",
  bio: "Operations lead coordinating volunteer programs across education and healthcare drives.",
  interests: ["Community Outreach", "Impact Reporting"],
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
};

export const DEMO_ADMIN_EMAIL = DEMO_ADMIN_PROFILE.email;
export const DEMO_ADMIN_PASSWORD = DEMO_ADMIN_PROFILE.password;

export const ensureDemoAdminUser = async () => {
  const existing = await userRepository.findUserByEmail(DEMO_ADMIN_EMAIL, {
    includePassword: true,
    includeSecurity: true
  });

  if (!existing) {
    return userRepository.createUser({
      ...DEMO_ADMIN_PROFILE,
      role: ROLES.ADMIN,
      isEmailVerified: true
    });
  }

  let hasChanges = false;

  const fieldsToSync = {
    name: DEMO_ADMIN_PROFILE.name,
    role: ROLES.ADMIN,
    phone: DEMO_ADMIN_PROFILE.phone,
    location: DEMO_ADMIN_PROFILE.location,
    bio: DEMO_ADMIN_PROFILE.bio,
    interests: DEMO_ADMIN_PROFILE.interests,
    avatarUrl: DEMO_ADMIN_PROFILE.avatarUrl,
    isEmailVerified: true
  };

  for (const [field, value] of Object.entries(fieldsToSync)) {
    const currentValue = existing[field];
    const valuesMatch = Array.isArray(value)
      ? JSON.stringify(currentValue || []) === JSON.stringify(value)
      : currentValue === value;

    if (!valuesMatch) {
      existing[field] = value;
      hasChanges = true;
    }
  }

  const passwordMatches = await existing.comparePassword(DEMO_ADMIN_PASSWORD);
  if (!passwordMatches) {
    existing.password = DEMO_ADMIN_PASSWORD;
    existing.refreshTokens = [];
    hasChanges = true;
  }

  if (hasChanges) {
    await existing.save();
  }

  return existing;
};
