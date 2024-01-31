import helmet from "helmet";
import compression from "compression";
import express from "express";

export default function (app: express.Application) {
  app.use(helmet());
  app.use(compression());
}
