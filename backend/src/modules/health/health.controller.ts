import type { Request, Response } from 'express';
import { getPrisma } from '../../db/prisma';
import { checkRedis } from '../../integrations/redis';
export async function health(req: Request, res: Response) {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString(), requestId: req.id } });
}
export async function readiness(_req: Request, res: Response) {
    const checks = { postgres: 'ok', redis: 'ok' } as Record<string, string>;
    try {
        await getPrisma().$queryRaw`SELECT 1`;
    } catch {
        checks.postgres = 'error';
    }
    try {
        await checkRedis();
    } catch {
        checks.redis = 'error';
    }
    const ready = Object.values(checks).every(v => v === 'ok');
    res.status(ready ? 200 : 503).json({
        success: ready,
        data: { status: ready ? 'ready' : 'not_ready', checks, timestamp: new Date().toISOString() }
    });
}
