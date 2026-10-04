import { describe, expect, it, vi, beforeEach } from 'vitest';
import { calculateProfileCompletion } from '../src/modules/candidates/profile-completion';
import { hashPassword, verifyPassword, createRefreshToken, hashRefreshToken } from '../src/modules/auth/auth.crypto';
import { profileUpdateSchema, experienceCreateSchema } from '../src/modules/candidates/candidate.schemas';

describe('phase 2 pure domain behavior',()=>{
  it('calculates deterministic profile completion',()=>{expect(calculateProfileCompletion({})).toEqual({percentage:0,completedFields:0,totalFields:8});expect(calculateProfileCompletion({fullName:'A',headline:'Dev',bio:'x',location:'Patna',skills:[1],experience:[1],education:[1],preferences:{}})).toEqual({percentage:100,completedFields:8,totalFields:8});});
  it('hashes passwords with a verifiable one-way hash',async()=>{const hash=await hashPassword('correct horse battery staple');expect(hash).not.toBe('correct horse battery staple');expect(await verifyPassword(hash,'correct horse battery staple')).toBe(true);expect(await verifyPassword(hash,'wrong')).toBe(false);});
  it('hashes high-entropy refresh tokens without storing raw values',()=>{const token=createRefreshToken();expect(token.length).toBeGreaterThan(40);expect(hashRefreshToken(token)).not.toBe(token);expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));});
  it('validates profile data and rejects malformed urls',()=>{expect(profileUpdateSchema.parse({body:{fullName:'Dev'},params:{},query:{}}).body.fullName).toBe('Dev');expect(()=>profileUpdateSchema.parse({body:{websiteUrl:'bad'},params:{},query:{}})).toThrow();});
  it('coerces experience dates',()=>{const parsed=experienceCreateSchema.parse({body:{company:'Acme',title:'Engineer',startDate:'2026-01-01'},params:{},query:{}});expect(parsed.body.startDate).toBeInstanceOf(Date);});
});

vi.mock('../src/db/prisma',()=>({getPrisma:vi.fn()}));
beforeEach(()=>vi.clearAllMocks());
