import express from "express";
import mongoose from "mongoose";
import genreRouter from "./routes/genres";
import customerRouter from "./routes/customers";
import "dotenv/config";

const app = express();
mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message));

app.use(express.json());
app.use("/api/genres", genreRouter);
app.use("/api/customers", customerRouter);

const port = process.env.PORT ?? 8080;
app.listen(port, () => {
  console.log("Server started on http://localhost:" + port);
});
