import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../core/logger';
import { AppError } from './app-error';
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    if (error instanceof ZodError)
        return res
            .status(400)
            .json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.flatten() }
            });
    if (error instanceof AppError)
        return res
            .status(error.statusCode)
            .json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    ...(error.details !== undefined ? { details: error.details } : {})
                }
            });
    logger.error({ err: error, method: req.method, path: req.path, requestId: req.id }, 'Unhandled application error');
    return res
        .status(500)
        .json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
};
