import User from "../models/User.js";

const SECURITY_SELECT = [
  "+refreshTokens",
  "+emailVerificationTokenHash",
  "+emailVerificationExpiresAt",
  "+passwordResetTokenHash",
  "+passwordResetExpiresAt"
].join(" ");

export const createUser = (payload) => User.create(payload);

export const findUserByEmail = (email, options = {}) => {
  const { includePassword = false, includeSecurity = false, select } = options;
  const normalizedEmail = email.toLowerCase();
  let query = User.findOne({ email: normalizedEmail });

  if (select) {
    query = query.select(select);
  }
  if (includePassword) {
    query = query.select("+password");
  }
  if (includeSecurity) {
    query = query.select(SECURITY_SELECT);
  }

  return query;
};

export const findUserById = (userId, options = {}) => {
  const { includePassword = false, includeSecurity = false, select } = options;
  let query = User.findById(userId);

  if (select) {
    query = query.select(select);
  }
  if (includePassword) {
    query = query.select("+password");
  }
  if (includeSecurity) {
    query = query.select(SECURITY_SELECT);
  }

  return query;
};

export const isEmailTaken = async (email, excludeUserId) => {
  const normalizedEmail = email.toLowerCase();
  const query = { email: normalizedEmail };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existing = await User.findOne(query).select("_id");
  return Boolean(existing);
};

export const findUserIdsBySearch = async (searchText) => {
  const regex = new RegExp(searchText, "i");
  const users = await User.find({
    $or: [{ name: regex }, { email: regex }]
  }).select("_id");

  return users.map((user) => user._id);
};

export const findUserByVerificationTokenHash = (tokenHash) =>
  User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() }
  }).select(SECURITY_SELECT);

export const findUserByPasswordResetTokenHash = (tokenHash) =>
  User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  }).select("+password " + SECURITY_SELECT);

export const deleteUserById = (userId) => User.findByIdAndDelete(userId);
