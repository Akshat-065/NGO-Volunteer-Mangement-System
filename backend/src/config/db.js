import mongoose from "mongoose";
import { getConfig } from "./config.js";
import { getLogger } from "../utils/logger.js";

const connectDB = async () => {
  const { mongoUri } = getConfig();
  const logger = getLogger();

  try {
    const connection = await mongoose.connect(mongoUri);
    logger.info(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
