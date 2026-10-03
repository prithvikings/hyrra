import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { z } from "zod";
import { errorHandler } from "../src/errors/error-handler";
import { validate } from "../src/middleware/validate";
import { AppError } from "../src/errors/app-error";
import { notFoundHandler } from "../src/middleware/not-found";

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

  it("handles AppError correctly", async () => {
    const app = express();
    app.get("/app-error", (_req, _res, next) => {
      // code, statusCode, message, details
      next(new AppError("FORBIDDEN", 403, "You cannot pass", { reason: "test" }));
    });
    app.use(errorHandler);
    const r = await request(app).get("/app-error");
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe("FORBIDDEN");
    expect(r.body.error.message).toBe("You cannot pass");
    expect(r.body.error.details).toEqual({ reason: "test" });
  });

  it("handles unknown errors as 500 without stack trace", async () => {
    const app = express();
    app.get("/unknown", (_req, _res, next) => {
      next(new Error("Secret internal error details"));
    });
    app.use(errorHandler);
    const r = await request(app).get("/unknown");
    expect(r.status).toBe(500);
    expect(r.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(r.body.error.message).toBe("Internal server error");
    expect(r.body.error.details).toBeUndefined();
    expect(r.body.error.stack).toBeUndefined();
  });

  it("handles 404 for unknown routes", async () => {
    const app = express();
    app.use(notFoundHandler);
    app.use(errorHandler);
    const r = await request(app).get("/does-not-exist");
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe("ROUTE_NOT_FOUND");
    expect(r.body.error.message).toBe("Route GET /does-not-exist not found");
  });
});
