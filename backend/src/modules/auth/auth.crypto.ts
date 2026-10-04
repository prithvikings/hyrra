import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { getConfig } from '../../config/env';
import type { AccessClaims } from './auth.types';

export const hashPassword = (password: string) => argon2.hash(password, { type: argon2.argon2id });
export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);
export const hashRefreshToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function createAccessToken(userId: string, sessionId: string): string {
  const config = getConfig();
  return jwt.sign({ sub: userId, sid: sessionId, type: 'access' }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessClaims {
  const payload = jwt.verify(token, getConfig().JWT_SECRET);
  if (typeof payload !== 'object' || payload.type !== 'access' || typeof payload.sub !== 'string' || typeof payload.sid !== 'string') throw new Error('Invalid access token');
  return payload as AccessClaims;
}

export function createRefreshToken(): string { return crypto.randomBytes(48).toString('base64url'); }
