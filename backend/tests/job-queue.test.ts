import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  createQueue: vi.fn(() => ({ add: vi.fn() })),
  enqueue: vi.fn((_queue, name, data) => ({ name, data }))
}));
vi.mock('../src/integrations/queues', () => ({ createQueue: mocks.createQueue, enqueue: mocks.enqueue }));

import { enqueueJobIngestion, jobIngestionQueue } from '../src/modules/jobs/job-ingestion.queue';

describe('job ingestion queue', () => {
  it('creates the dedicated queue', () => {
    jobIngestionQueue();
    expect(mocks.createQueue).toHaveBeenCalledWith('job.ingestion');
  });

  it('keeps queue payload small and identifier-based', () => {
    enqueueJobIngestion('source-123');
    expect(mocks.enqueue).toHaveBeenCalledWith(expect.anything(), 'ingest-source', { sourceId: 'source-123' });
  });
});
