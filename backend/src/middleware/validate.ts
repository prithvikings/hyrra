import type { RequestHandler } from 'express';
import type { z } from 'zod';

export const validate =
    (schema: z.ZodTypeAny): RequestHandler =>
    (req, _res, next) => {
        try {
            const parsed = schema.parse({ body: req.body, params: req.params, query: req.query }) as any;
            req.body = parsed.body;
            req.params = parsed.params;
            Object.defineProperty(req, 'query', { value: parsed.query, configurable: true });
            next();
        } catch (error) {
            next(error);
        }
    };
