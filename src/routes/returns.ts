import express from "express";
import { Rental } from "../models/Rental";
import authorize from "../middlewares/authorization";
import moment from "moment";
import { Movie } from "../models/Movie";
import Joi from "joi";

const router = express.Router();

router.post("/", authorize, async (req, res) => {
  const { error, value } = validateReturn(req.body);
  if (error) {
    res.status(400).send(error.message);
    console.log(error.message);
    return;
  }

  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental)
    return res.status(404).send("The specified rental doesn't exist");

  if (rental.dateReturned)
    return res
      .status(400)
      .send("The selected rental has already been returned.");

  rental.calcRentalFee();
  await rental.save();

  await Movie.findOneAndUpdate(
    { _id: req.body.movieId },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(req: any) {
  const schema = Joi.object({
    customerId: Joi.string().length(24).required(),
    movieId: Joi.string().length(24).required(),
  });

  return schema.validate(req);
}

export default router;
