import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export const loadEnv = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const cwd = process.cwd();

  const candidates = [`.env.${nodeEnv}`, ".env"];

  for (const candidate of candidates) {
    const candidatePath = path.join(cwd, candidate);
    if (fs.existsSync(candidatePath)) {
      dotenv.config({ path: candidatePath });
      return candidatePath;
    }
  }

  return null;
};

