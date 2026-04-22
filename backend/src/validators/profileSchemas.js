import { z } from "zod";
import { emptyToUndefined } from "./common.js";

export const profileUpdateSchema = z.object({
  body: z.object({
    name: emptyToUndefined(z.string().min(2).optional()),
    email: emptyToUndefined(z.string().email().optional()),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
    avatarUrl: z.string().optional(),
    skills: z.array(z.string()).optional(),
    availability: z.string().optional()
  })
});

