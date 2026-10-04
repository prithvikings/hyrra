import type { Request, Response } from 'express';
import { AppError } from '../../errors/app-error';
import { resumeMetadataSchema, resumeUpdateSchema } from './resume.schemas';
import * as service from './resume.service';
import { validateResumeUpload } from './resume-upload';

function userId(req: Request) {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  return req.userId;
}
function body(req: Request) { return resumeMetadataSchema.parse({ name: req.body?.name, targetRole: req.body?.targetRole }); }
function requireFile(req: Request) { return validateResumeUpload(req.file); }

export async function createResume(req: Request, res: Response) { res.status(201).json({ success: true, data: await service.createResume(userId(req), body(req), requireFile(req)) }); }
export async function listResumes(req: Request, res: Response) { res.json({ success: true, data: await service.listResumes(userId(req)) }); }
export async function getResume(req: Request, res: Response) { res.json({ success: true, data: await service.getResume(userId(req), req.params.id) }); }
export async function updateResume(req: Request, res: Response) { res.json({ success: true, data: await service.updateResume(userId(req), req.params.id, resumeUpdateSchema.parse(req.body)) }); }
export async function deleteResume(req: Request, res: Response) { await service.deleteResume(userId(req), req.params.id); res.status(204).send(); }
export async function listVersions(req: Request, res: Response) { res.json({ success: true, data: await service.listVersions(userId(req), req.params.id) }); }
export async function getVersion(req: Request, res: Response) { res.json({ success: true, data: await service.getVersion(userId(req), req.params.id, req.params.versionId) }); }
export async function createVersion(req: Request, res: Response) { res.status(201).json({ success: true, data: await service.createResumeVersion(userId(req), req.params.id, requireFile(req)) }); }
export async function deleteVersion(req: Request, res: Response) { await service.deleteVersion(userId(req), req.params.id, req.params.versionId); res.status(204).send(); }
export async function getParsed(req: Request, res: Response) {
  const version = await service.getVersion(userId(req), req.params.id, req.params.versionId);
  if (!version.parsedData) throw new AppError('PARSED_DATA_NOT_AVAILABLE', 409, 'Parsed resume data is not available yet');
  res.json({ success: true, data: version.parsedData });
}
