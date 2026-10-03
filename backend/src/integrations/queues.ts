import { Queue, type JobsOptions } from 'bullmq';
import { getRedis } from './redis';
export function createQueue<T = unknown>(name: string) {
    return new Queue<T>(name, {
        connection: getRedis(),
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 100
        }
    });
}
export function enqueue<T>(queue: Queue<T>, name: string, data: T, options?: JobsOptions) {
    return queue.add(name as any, data as any, options);
}
