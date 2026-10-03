import IORedis from 'ioredis';
let client: IORedis | undefined;
export function getRedis() {
    if (!client) client = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, lazyConnect: true });
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
