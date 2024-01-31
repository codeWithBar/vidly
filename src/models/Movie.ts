import Joi from "joi";
import mongoose from "mongoose";
import { genreSchema } from "./Genre";

export const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 255,
    },
    genre: {
      type: genreSchema,
      required: true,
    },
    numberInStock: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      max: 255,
    },
  })
);

export function validateMovie(movie: any) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    genreId: Joi.string().length(24).required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  });

  return schema.validate(movie);
}
