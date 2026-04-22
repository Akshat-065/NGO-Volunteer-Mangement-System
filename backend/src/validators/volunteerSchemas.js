import { z } from "zod";
import { emptyToUndefined, objectIdSchema } from "./common.js";

export const volunteerListSchema = z.object({
  query: z.object({
    q: z.string().optional().default(""),
    availability: z.string().optional().default(""),
    skill: z.string().optional().default("")
  })
});

export const volunteerCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional().default(""),
    location: z.string().optional().default(""),
    bio: z.string().optional().default(""),
    interests: z.array(z.string()).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    availability: z.string().optional().default("Flexible")
  })
});

export const volunteerUpdateSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    name: emptyToUndefined(z.string().min(2).optional()),
    email: emptyToUndefined(z.string().email().optional()),
    password: emptyToUndefined(z.string().min(6).optional()),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    availability: z.string().optional()
  })
});

export const volunteerIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

