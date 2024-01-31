import winston from "winston";
import "winston-mongodb";

winston.addColors({ info: ["green", "bold"] });

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "logfile.log", dirname: "log/" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.MongoDB({
      db: process.env.db!,
      options: {
        useUnifiedTopology: true,
      },
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: "exceptions.log",
      dirname: "log/",
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: "rejections.log",
      dirname: "log/",
    }),
  ],
});
