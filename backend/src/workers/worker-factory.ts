import { Worker, type Processor } from 'bullmq';
import { getRedis } from '../integrations/redis';
import { logger } from '../core/logger';
import { registerCleanup } from '../core/lifecycle';
export function createWorker<T>(queueName: string, processor: Processor<T>) {
    const worker = new Worker<T>(queueName, processor, { connection: getRedis() });
    worker.on('failed', (job, error) =>
        logger.error({ jobId: job?.id, queue: queueName, err: error }, 'Queue job failed')
    );
    registerCleanup(async () => {
        await worker.close();
        logger.info({ queue: queueName }, 'Worker closed');
    });
    return worker;
}
