import mongoose from "mongoose";
import { logger } from "../loggers/logger";
import "dotenv/config";

export default function () {
  mongoose
    .connect(process.env.db!)
    .then(() => logger.info(`Connected to ${process.env.db}`));
}
