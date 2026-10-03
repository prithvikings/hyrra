import { logger } from './logger';

export type CleanupFunction = () => Promise<void> | void;

const cleanupCallbacks: CleanupFunction[] = [];
let isShuttingDown = false;

export function registerCleanup(fn: CleanupFunction) {
    cleanupCallbacks.push(fn);
}

export async function shutdown(signal: string) {
    if (isShuttingDown) {
        logger.warn({ signal }, 'Shutdown already in progress...');
        return;
    }
    
    isShuttingDown = true;
    logger.info({ signal }, 'Shutting down gracefully...');

    try {
        for (const cleanup of cleanupCallbacks) {
            try {
                await cleanup();
            } catch (error) {
                logger.error({ err: error }, 'Error during cleanup');
            }
        }
        logger.info('Shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error({ err: error }, 'Fatal error during shutdown');
        process.exit(1);
    }
}
