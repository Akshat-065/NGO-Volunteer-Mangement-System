import * as emailService from "../services/emailService.js";
import AppError from "../utils/AppError.js";
import { calculateProfileCompletion } from "../utils/profile.js";
import {
  createRandomToken,
  getEmailVerificationExpiryDate,
  hashToken
} from "../utils/token.js";
import * as userRepository from "../repositories/userRepository.js";
import * as volunteerRepository from "../repositories/volunteerRepository.js";

const buildProfileResponse = (user, volunteer) => ({
  user: {
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
  },
  volunteer: volunteer
    ? {
        id: volunteer._id,
        skills: volunteer.skills,
        availability: volunteer.availability
      }
    : null,
  profileCompletion: calculateProfileCompletion(user, volunteer)
});

export const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const volunteer = await volunteerRepository.findVolunteerByUserId(userId, { populateUser: false });
  return buildProfileResponse(user, volunteer);
};

export const updateProfile = async (userId, payload) => {
  const user = await userRepository.findUserById(userId, { includeSecurity: true });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const volunteer = await volunteerRepository.findVolunteerByUserId(userId, { populateUser: false });
  let verificationTokenToSend = null;

  const { name, email, phone, location, bio, interests, avatarUrl, skills, availability } = payload;

  if (email && email.toLowerCase() !== user.email) {
    const taken = await userRepository.isEmailTaken(email, user._id);
    if (taken) {
      throw new AppError("Another account already uses this email address", 409);
    }

    user.isEmailVerified = false;
    verificationTokenToSend = createRandomToken();
    user.emailVerificationTokenHash = hashToken(verificationTokenToSend);
    user.emailVerificationExpiresAt = getEmailVerificationExpiryDate();
  }

  user.name = name ?? user.name;
  user.email = email?.toLowerCase() ?? user.email;
  user.phone = phone ?? user.phone;
  user.location = location ?? user.location;
  user.bio = bio ?? user.bio;
  user.interests = interests ?? user.interests;
  user.avatarUrl = avatarUrl ?? user.avatarUrl;

  await user.save();

  if (verificationTokenToSend) {
    await emailService.sendVerificationEmail({
      user: {
        name: user.name,
        email: user.email
      },
      token: verificationTokenToSend
    });
  }

  if (volunteer) {
    volunteer.skills = skills ?? volunteer.skills;
    volunteer.availability = availability ?? volunteer.availability;
    await volunteer.save();
  }

  return buildProfileResponse(user, volunteer);
};
