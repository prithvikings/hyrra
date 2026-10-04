import type { NextFunction, Request, Response } from 'express';
import { authenticateAccessToken } from './auth.service';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) throw new Error('missing');

    const claims = await authenticateAccessToken(header.slice(7));
    req.userId = claims.sub;
    req.sessionId = claims.sid;
    next();
  } catch (error) {
    next(error);
  }
}
