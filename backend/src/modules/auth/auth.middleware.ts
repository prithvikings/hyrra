import type { NextFunction, Request, Response } from 'express';
import { authenticateAccessToken } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';
export async function requireAuth(req:Request,res:Response,next:NextFunction){try{const header=req.header('authorization');if(!header?.startsWith('Bearer '))throw new Error('missing');const claims=await authenticateAccessToken(header.slice(7));const auth=req as AuthenticatedRequest;auth.userId=claims.sub;auth.sessionId=claims.sid;next();}catch(error){next(error);}}
