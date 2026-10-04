import { createQueue } from '../../integrations/queues';

export interface ResumeProcessingJob { resumeVersionId: string; }
export function resumeProcessingQueue() { return createQueue<ResumeProcessingJob>('resume-processing'); }
