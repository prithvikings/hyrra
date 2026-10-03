import { createApp } from './app';
import { getConfig } from './config/env';
import { logger } from './core/logger';
import { shutdown, registerCleanup } from './core/lifecycle';
import { disconnectPrisma } from './db/prisma';
import { closeRedis } from './integrations/redis';

const env = getConfig();
const app = createApp();
const server = app.listen(env.PORT, () =>
    logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Hyrra backend started')
);

registerCleanup(() => new Promise<void>((resolve, reject) => {
    server.close((err) => {
        if (err) reject(err);
        else {
            logger.info('HTTP server closed');
            resolve();
        }
    });
}));

registerCleanup(async () => {
    await closeRedis();
    logger.info('Redis disconnected');
});

registerCleanup(async () => {
    await disconnectPrisma();
    logger.info('Prisma disconnected');
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
