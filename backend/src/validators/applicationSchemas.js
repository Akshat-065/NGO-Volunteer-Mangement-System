import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const applySchema = z.object({
  body: z.object({
    eventId: objectIdSchema
  })
});

export const applicationsListSchema = z.object({
  query: z.object({
    status: z.enum(["Pending", "Approved", "Rejected"]).optional()
  })
});

export const applicationUpdateSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    status: z.enum(["Approved", "Rejected"])
  })
});

