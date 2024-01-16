import Joi from "joi";
import mongoose, { Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);

// Check out https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface User {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}
// Check out https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface InstanceMethods {
  generateAuthToken(): string;
}

type UserModel = Model<User, {}, InstanceMethods>;

const userSchema = new Schema<User, UserModel, InstanceMethods>({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 256,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 256,
  },
  isAdmin: Boolean,
});

userSchema.method("generateAuthToken", function () {
  const token: string = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.PRIVATE_KEY!
  );
  return token;
});

export const User = mongoose.model("User", userSchema);

export function validateUser(user: any) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(256).required(),
    email: Joi.string().min(5).max(256).email().required(),
    password: joiPassword
      .string()
      .min(8)
      .minOfSpecialCharacters(3)
      .minOfLowercase(4)
      .minOfUppercase(5)
      .minOfNumeric(6)
      .noWhiteSpaces()
      .onlyLatinCharacters(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}
