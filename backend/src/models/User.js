import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ROLES } from "../utils/roles.js";

const refreshSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    userAgent: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VOLUNTEER
    },
    phone: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    interests: {
      type: [String],
      default: []
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
      select: false
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
      select: false
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false
    },
    refreshTokens: {
      type: [refreshSessionSchema],
      default: [],
      select: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
