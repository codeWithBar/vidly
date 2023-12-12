import Joi from "joi";
import mongoose from "mongoose";

export const Customer = mongoose.model(
  "Customer",
  // Built-in validation of Mongoose
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    isGold: {
      type: Boolean,
      required: false,
      default: false,
    },
    phone: {
      type: String,
      required: true,
    },
  })
);

export function validateCustomer(customer: any) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    phone: Joi.string().length(10).required(),
    isGold: Joi.boolean(),
  });

  return schema.validate(customer);
}
