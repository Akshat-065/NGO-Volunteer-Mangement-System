import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

const emailSchema = z.string().trim().email();
const trimmedString = z.string().trim();

export const registerSchema = z.object({
  body: z.object({
    name: trimmedString.min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    phone: trimmedString.max(40).optional().default(""),
    interests: z.array(trimmedString.max(60)).optional().default([]),
    skills: z.array(trimmedString.max(60)).optional().default([]),
    availability: trimmedString.max(40).optional().default("Flexible")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1)
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1)
  })
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: passwordSchema
  })
});
