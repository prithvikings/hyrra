import { describe, it, expect } from 'vitest';
import { loadEnv } from '../src/config/env';
describe('env', () => {
    it('rejects missing vars', () => expect(() => loadEnv({ NODE_ENV: 'test' })).toThrow(/Invalid environment/));
    it('accepts valid test config', () =>
        expect(
            loadEnv({
                NODE_ENV: 'test',
                PORT: '3000',
                DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/hyrra',
                REDIS_URL: 'redis://localhost:6379',
                JWT_SECRET: 'a'.repeat(32),
                JWT_EXPIRES_IN: '15m'
            }).PORT
        ).toBe(3000));
});
