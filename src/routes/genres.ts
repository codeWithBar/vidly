import express from "express";
import { Genre, validateGenre } from "../models/Genre";
import authorize from "../middlewares/authorization";
import adminCheck from "../middlewares/adminCheck";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
  const genres = await Genre.find().sort("name");
  console.log(genres);
  res.send(genres);
});

router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre)
    return res.status(404).send("The genre with the given ID was not found.");

  res.send(genre);
});

router.post("/", authorize, async (req, res) => {
  const { error, value } = validateGenre(req.body);
  if (error) {
    res.status(400).send(error.message);
    console.log(error.message);
    return;
  }

  try {
    let genre = new Genre({ name: req.body.name });
    genre = await genre.save(); // We want to return the genre that is saved to the database
    console.log(genre);
    res.send(genre);
  } catch (e: any) {
    console.log(e.message);
    res.send(e.message);
  }
});

router.put("/:id", async (req, res) => {
  const { value, error } = validateGenre(req.body);
  if (error) {
    res.status(400).send(error.message);
    console.log(error.message);
    return;
  }

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");

  res.send(genre);
});

router.delete("/:id", [authorize, adminCheck], async (req: any, res: any) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");

  res.send(genre);
});

export default router;
