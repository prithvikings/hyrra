import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/db/prisma',()=>({getPrisma:vi.fn()}));
import { getPrisma } from '../src/db/prisma'; import { register,login,logout,authenticateAccessToken } from '../src/modules/auth/auth.service';
const db:any={user:{findUnique:vi.fn(),create:vi.fn()},session:{create:vi.fn(),findUnique:vi.fn(),update:vi.fn()}}; vi.mocked(getPrisma).mockReturnValue(db);
describe('authentication service',()=>{
 it('rejects duplicate registration',async()=>{db.user.findUnique.mockResolvedValue({id:'u1'});await expect(register('test@example.com','password123')).rejects.toMatchObject({code:'EMAIL_ALREADY_EXISTS',statusCode:409});});
 it('rejects invalid credentials without revealing account existence',async()=>{db.user.findUnique.mockResolvedValue(null);await expect(login('missing@example.com','password123')).rejects.toMatchObject({code:'INVALID_CREDENTIALS',statusCode:401});});
 it('revokes the authenticated session on logout',async()=>{db.session.findUnique.mockResolvedValue({id:'s1',revokedAt:null});await logout('s1');expect(db.session.update).toHaveBeenCalledWith({where:{id:'s1'},data:{revokedAt:expect.any(Date)}});});
 it('rejects revoked sessions even with a structurally valid token',async()=>{process.env.JWT_SECRET='x'.repeat(32);process.env.JWT_EXPIRES_IN='15m';process.env.DATABASE_URL='postgresql://postgres:postgres@localhost:5432/hyrra';process.env.REDIS_URL='redis://localhost:6379';const {createAccessToken}=await import('../src/modules/auth/auth.crypto');db.session.findUnique.mockResolvedValue({id:'s1',userId:'u1',revokedAt:new Date(),expiresAt:new Date(Date.now()+60000)});await expect(authenticateAccessToken(createAccessToken('u1','s1'))).rejects.toMatchObject({code:'UNAUTHORIZED'});});
});
