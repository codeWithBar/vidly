import { Server, IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import { logger } from "../../src/loggers/logger";
import { Rental } from "../../src/models/Rental";
import request from "supertest";
import { User } from "../../src/models/User";
import moment from "moment";
import { Movie } from "../../src/models/Movie";

// POST /api/returns {customerId, movieId}
// Return 401 if client is not logged in
// Return 400 if customerId is not provided
// Return 400 if movieId is not provided
// Return 404 if no rental found for this customer/movie
// Return 400 if rental already processed
// Return 200 if valid request
// Set the return date
// Increase the stock
// Return the rental

let server: Server<typeof IncomingMessage, typeof ServerResponse>;

describe("/api/returns", () => {
  let customerId: any;
  let movieId: any;
  let rental: any;
  let movie: any;

  beforeEach(async () => {
    const mod = await import("../../src/index");
    server = (mod as any).default;

    customerId = new mongoose.Types.ObjectId().toString();
    movieId = new mongoose.Types.ObjectId().toString();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "action" },
      numberInStock: 10,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "0123456789",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  afterAll(async () => {
    logger.close();
    await mongoose.connection.close();
  });

  describe("POST /", () => {
    it("should return 401 if client is not logged in", async () => {
      const res = await request(server)
        .post("/api/returns")
        .send({ customerId: customerId, movieId: movieId });

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      const token = new User().generateAuthToken();
      User.print(); // To test whether mongoose's static methods work or not
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ movieId: movieId });

      expect(res.status).toBe(400);
    });
    it("should return 400 if movieId is not provided", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId });

      expect(res.status).toBe(400);
    });

    it("should return 404 if no rental is found for the specified movie/customer combination", async () => {
      await Rental.deleteMany({});

      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      expect(res.status).toBe(404);
    });

    it("should return 400 if rental already processed", async () => {
      const token = new User().generateAuthToken();
      rental.dateReturned = Date.now();
      await rental.save();
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      expect(res.status).toBe(400);
    });

    it("should return 200 if the req is valid", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      expect(res.status).toBe(200);
    });

    it("should set the returnDate if input is valid", async () => {
      const token = new User().generateAuthToken();
      await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      const rentalInDb = await Rental.findById(rental._id);
      const timeDifference =
        new Date().getTime() - rentalInDb!.dateReturned!.getTime();
      console.log(`Time Difference is ${timeDifference} milliseconds`);

      expect(timeDifference).toBeLessThan(10000);
    });

    it("should calculate the rental fee if the input is valid", async () => {
      rental.dateOut = moment().add(-7, "days").toDate();
      await rental.save();

      const token = new User().generateAuthToken();
      await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      const rentalInDb = await Rental.findById(rental._id);
      expect(rentalInDb?.rentalFee).toBe(14);
    });

    it("should increase the movie stock if the input is valid", async () => {
      const token = new User().generateAuthToken();
      await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      const movieInDb = await Movie.findById(movie._id);
      expect(movieInDb?.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the rental if the input is valid", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId: customerId, movieId: movieId });

      expect(res.body).toHaveProperty("dateOut");
      expect(res.body).toHaveProperty("dateReturned");
      expect(res.body).toHaveProperty("rentalFee");
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("movie");
    });
  });
});
