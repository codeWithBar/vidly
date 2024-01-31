require("express-async-errors");
import start from "./startup/routes";
import express from "express";
import "dotenv/config";
import connectToDB from "./startup/db";
import prod from "./startup/prod";

connectToDB();
const app = express();
start(app);
prod(app);

if (!process.env.PRIVATE_KEY)
  throw new Error("FATAL ERROR: jwtPrivateKey is not defined");

const port = process.env.PORT ?? 8080;
const server = app.listen(port, () => {
  console.log("Server started on http://localhost:" + port);
});

export default server;
