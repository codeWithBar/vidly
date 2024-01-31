import mongoose from "mongoose";
import express from "express";

export default function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid Object ID");

  next();
}
