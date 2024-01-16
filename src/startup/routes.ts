import express from "express";
import genreRouter from "../routes/genres";
import customerRouter from "../routes/customers";
import movieRouter from "../routes/movies";
import rentalRouter from "../routes/rentals";
import usersRouter from "../routes/users";
import auth from "../routes/auth";
import { errorHandler } from "../middlewares/error";

export default function (app: express.Application) {
  app.use(express.json());
  app.use("/api/genres", genreRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/movies", movieRouter);
  app.use("/api/rentals", rentalRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", auth);

  app.use(errorHandler);
}
