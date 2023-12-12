import express from "express";
import { Customer, validateCustomer } from "../models/Customer";

const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.post("/", async (req, res) => {
  const { error, value } = validateCustomer(req.body);
  if (error) {
    res.status(400).send(error.message);
    console.log(error.message);
    return;
  }

  // try catch block because of the built in validation of mongoose
  try {
    let customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    });
    customer = await customer.save(); // We want to return the customer that is saved to the database
    console.log(customer);
    res.send(customer);
  } catch (e: any) {
    console.log(e.message);
    res.send(e.message);
  }
});

router.put("/:id", async (req, res) => {
  const { value, error } = validateCustomer(req.body);
  if (error) {
    res.status(400).send(error.message);
    console.log(error.message);
    return;
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      isGold: req.body.isGold,
    },
    { new: true }
  );

  if (!customer)
    return res.status(404).send("The customer with the given ID was not found");

  res.send(customer);
});

router.delete("/:id", async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer)
    return res.status(404).send("The customer with the given ID was not found");

  res.send(customer);
});

export default router;
