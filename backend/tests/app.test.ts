import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
describe('boot', () => {
    it('boots without infrastructure', async () => {
        const r = await request(createApp()).get('/api/v1');
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ success: true, data: { service: 'hyrra-backend' } });
    });
});
