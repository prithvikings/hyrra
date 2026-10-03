import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { z } from "zod";
import { errorHandler } from "../src/errors/error-handler";
import { validate } from "../src/middleware/validate";
describe("errors", () => {
  it("returns validation error", async () => {
    const app = express();
    app.use(express.json());
    app.post(
      "/test",
      validate(z.object({ body: z.object({ email: z.string().email() }) })),
      (_req, res) => res.json({ success: true }),
    );
    app.use(errorHandler);
    const r = await request(app).post("/test").send({ email: "bad" });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe("VALIDATION_ERROR");
  });
});
