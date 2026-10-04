export type JobFreshnessStatus = 'ACTIVE' | 'EXPIRED';

export function resolveFreshness(expiresAt: Date | undefined, now = new Date()): JobFreshnessStatus {
  return expiresAt && expiresAt <= now ? 'EXPIRED' : 'ACTIVE';
}
