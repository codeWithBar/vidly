import request from "supertest";
import { Genre } from "../../src/models/Genre";
import { User } from "../../src/models/User";
import { Server, IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import { logger } from "../../src/loggers/logger";

let server: Server<typeof IncomingMessage, typeof ServerResponse>;

describe("api/genres", () => {
  beforeEach(async () => {
    const mod = await import("../../src/index");
    server = (mod as any).default;
  });

  afterEach(async () => {
    server.close();
    await Genre.deleteMany({});
  });

  afterAll(async () => {
    logger.close();
    await mongoose.disconnect(); // One of the so called OpenHandles
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some((g: { name: string }) => g.name === "genre1")
      ).toBeTruthy();
      expect(
        res.body.some((g: { name: string }) => g.name === "genre2")
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if valid ID is passed", async () => {
      const genre = new Genre({ name: "genre1234" });
      await genre.save();

      const res = await request(server).get(
        "/api/genres/" + genre._id.toString()
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre1234");
    });

    it("should return 404 if invalid ID is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    it("should return a 401 if client is not logged in", async () => {
      const res = await request(server)
        .post("/api/genres")
        .send({ name: "genre 1" });

      expect(res.status).toBe(401);
    });

    it("should return a 400 if genre is less than 5 chars", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "1234" });

      expect(res.status).toBe(400);
    });

    it("should return a 400 if genre is more than 50 chars", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "1234andbfkabkasbgkasbgbsakbsbgakjbsgkasbjgbkajsbgjsabjkgsbjkasbgkasbgkajsbjaskjgbakgbk",
        });

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "genreBlaBla",
        });
      const genre = await Genre.find({ name: "genreBlaBla" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre in the body of the response if it is valid", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "genreBlaBla",
        });

      expect(res.body).toMatchObject({ name: "genreBlaBla" });
      expect(res.body).toHaveProperty("_id");
    });
  });
});
