// Had to comment out the typeRoots in tsconfig.json file to make this test file
// detect the jest libraries. I don't know why.

import { User } from "../../../src/models/User";
import jwt from "jsonwebtoken";
import "dotenv/config";
import mongoose from "mongoose";

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toString(),
      isAdmin: true,
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY!);
    expect(decoded).toMatchObject(payload);
  });
});
