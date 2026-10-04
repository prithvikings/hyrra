import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/modules/jobs/job.service', () => ({
  listJobs: vi.fn(),
  getJob: vi.fn(),
  toPublicJob: (job: unknown) => job
}));

import * as jobService from '../src/modules/jobs/job.service';
import { createApp } from '../src/app';

describe('job API', () => {
  it('lists canonical jobs publicly with deterministic filters', async () => {
    vi.mocked(jobService.listJobs).mockResolvedValue({ page: 1, limit: 20, total: 1, items: [{ id: 'job-1', title: 'Engineer' }] } as never);
    const response = await request(createApp()).get('/api/v1/jobs?workMode=REMOTE');
    expect(response.status).toBe(200);
    expect(jobService.listJobs).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20, workMode: 'REMOTE' }));
    expect(response.body.pagination.total).toBe(1);
  });

  it('rejects invalid filters', async () => {
    const response = await request(createApp()).get('/api/v1/jobs?workMode=INVALID');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
