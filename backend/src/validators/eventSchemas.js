import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const eventCreateSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    date: z.coerce.date(),
    location: z.string().min(2),
    assignedVolunteers: z.array(objectIdSchema).optional().default([])
  })
});

export const eventUpdateSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    date: z.coerce.date().optional(),
    location: z.string().min(2).optional(),
    assignedVolunteers: z.array(objectIdSchema).optional()
  })
});

export const eventIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

