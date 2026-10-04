import type { Job } from 'bullmq';
import { getPrisma } from '../../db/prisma';
import { getResumeStorage } from '../../integrations/storage/resume-storage';
import { createWorker } from '../../workers/worker-factory';
import { getDocumentParser } from './document-parser';
import { parseResumeText } from './resume-parser';
import { resumeProcessingQueue, type ResumeProcessingJob } from './resume.queue';

export async function processResumeVersion(job: Job<ResumeProcessingJob>) {
  const { resumeVersionId } = job.data;
  const db = getPrisma();
  const version = await db.resumeVersion.findUnique({ where: { id: resumeVersionId } });
  if (!version) return;
  if (version.status === 'COMPLETED') return;
  await db.resumeVersion.update({ where: { id: resumeVersionId }, data: { status: 'PROCESSING', failureCode: null } });
  try {
    const buffer = await getResumeStorage().get(version.storageKey);
    const parser = getDocumentParser(version.mimeType);
    const extracted = await parser.parse(buffer);
    const parsedData = parseResumeText(extracted.text);
    await db.resumeVersion.update({
      where: { id: resumeVersionId },
      data: { status: 'COMPLETED', extractedText: extracted.text, parsedData, parsingMetadata: { ...extracted.metadata, parser: 'deterministic-v1' }, failureCode: null }
    });
  } catch (error) {
    await db.resumeVersion.update({ where: { id: resumeVersionId }, data: { status: 'FAILED', failureCode: error instanceof Error && error.message.includes('parse') ? 'DOCUMENT_PARSE_FAILED' : 'PROCESSING_FAILED' } });
    throw error;
  }
}

export function startResumeWorker() {
  return createWorker<ResumeProcessingJob>('resume-processing', processResumeVersion);
}

export function createResumeWorkerQueue() { return resumeProcessingQueue(); }
