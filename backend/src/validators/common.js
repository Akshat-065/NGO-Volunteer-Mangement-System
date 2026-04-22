import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const emptyToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

