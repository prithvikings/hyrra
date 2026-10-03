import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { validate } from '../src/middleware/validate';
import { errorHandler } from '../src/errors/error-handler';

describe('validate middleware', () => {
    it('rejects invalid body', async () => {
        const app = express();
        app.use(express.json());
        app.post(
            '/test',
            validate(z.object({ body: z.object({ age: z.number() }) })),
            (req, res) => res.json({ body: req.body })
        );
        app.use(errorHandler);

        const r = await request(app).post('/test').send({ age: 'not a number' });
        expect(r.status).toBe(400);
        expect(r.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('allows valid body and applies transformations', async () => {
        const app = express();
        app.use(express.json());
        app.post(
            '/test',
            validate(z.object({ body: z.object({ age: z.coerce.number(), name: z.string().default('anonymous') }) })),
            (req, res) => res.json({ body: req.body })
        );
        app.use(errorHandler);

        const r = await request(app).post('/test').send({ age: '25' });
        expect(r.status).toBe(200);
        expect(r.body.body.age).toBe(25); // Coerced to number
        expect(r.body.body.name).toBe('anonymous'); // Default applied
    });

    it('validates and transforms params', async () => {
        const app = express();
        app.get(
            '/test/:id',
            validate(z.object({ params: z.object({ id: z.coerce.number() }) })),
            (req, res) => res.json({ params: req.params })
        );
        app.use(errorHandler);

        const r = await request(app).get('/test/10');
        expect(r.status).toBe(200);
        expect(r.body.params.id).toBe(10);
    });

    it('validates and transforms query', async () => {
        const app = express();
        app.get(
            '/test',
            validate(z.object({ query: z.object({ page: z.coerce.number().default(1) }) })),
            (req, res) => res.json({ query: req.query })
        );
        app.use(errorHandler);

        const r = await request(app).get('/test?page=5');
        expect(r.status).toBe(200);
        expect(r.body.query.page).toBe(5);

        const r2 = await request(app).get('/test');
        expect(r2.status).toBe(200);
        expect(r2.body.query.page).toBe(1);
    });
});
