import { getConfig } from "../config/config.js";
import { getLogger } from "../utils/logger.js";

const buildFrontendLink = (path, token) =>
  `${getConfig().frontendUrl}${path}?token=${encodeURIComponent(token)}`;

const deliverEmail = async ({ to, subject, message, link }) => {
  const logger = getLogger();
  const { isProduction } = getConfig();

  logger.info(subject, {
    to,
    delivery: "application-log",
    link,
    message
  });

  if (isProduction) {
    return undefined;
  }

  return {
    to,
    subject,
    link
  };
};

export const sendVerificationEmail = ({ user, token }) =>
  deliverEmail({
    to: user.email,
    subject: "Verify your NGO Connect account",
    message: `Hi ${user.name}, verify your email to activate your account.`,
    link: buildFrontendLink("/verify-email", token)
  });

export const sendPasswordResetEmail = ({ user, token }) =>
  deliverEmail({
    to: user.email,
    subject: "Reset your NGO Connect password",
    message: `Hi ${user.name}, use the secure link to reset your password.`,
    link: buildFrontendLink("/reset-password", token)
  });
