import IORedis from 'ioredis';
import { getConfig } from '../config/env';
let client: IORedis | undefined;
export function getRedis() {
    if (!client) {
        const config = getConfig();
        client = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    }
    return client;
}
export async function checkRedis() {
    const redis = getRedis();
    if (redis.status === 'wait') await redis.connect();
    await redis.ping();
}
export async function closeRedis() {
    if (client) {
        await client.quit();
        client = undefined;
    }
}
