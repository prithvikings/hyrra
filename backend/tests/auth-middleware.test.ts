import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/modules/auth/auth.service',()=>({authenticateAccessToken:vi.fn()}));
import { authenticateAccessToken } from '../src/modules/auth/auth.service'; import { requireAuth } from '../src/modules/auth/auth.middleware';
const mocked=vi.mocked(authenticateAccessToken);
describe('authentication middleware',()=>{it('rejects missing bearer token',async()=>{const next=vi.fn();await requireAuth({header:()=>undefined} as any,{} as any,next);expect(next).toHaveBeenCalledWith(expect.any(Error));});it('establishes authenticated identity from verified claims',async()=>{mocked.mockResolvedValue({sub:'user-a',sid:'session-a',type:'access'});const req:any={header:()=> 'Bearer token'};const next=vi.fn();await requireAuth(req,{} as any,next);expect(req.userId).toBe('user-a');expect(req.sessionId).toBe('session-a');expect(next).toHaveBeenCalledWith();});});
