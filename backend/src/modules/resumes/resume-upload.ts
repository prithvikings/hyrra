import { AppError } from '../../errors/app-error';
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RESUME_TYPES = new Map([['application/pdf', '.pdf'], ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx']]);
function contentMatches(file: Express.Multer.File, extension: string) { if (extension === '.pdf') return file.buffer.subarray(0, 5).toString('ascii') === '%PDF-'; if (extension === '.docx') return file.buffer.subarray(0, 2).toString('hex') === '504b'; return false; }
export function validateResumeUpload(file: Express.Multer.File | undefined): Express.Multer.File {
  if (!file) throw new AppError('RESUME_FILE_REQUIRED', 400, 'A resume file is required');
  if (file.size <= 0) throw new AppError('RESUME_FILE_EMPTY', 400, 'Resume file is empty');
  if (file.size > MAX_RESUME_SIZE_BYTES) throw new AppError('RESUME_FILE_TOO_LARGE', 413, 'Resume file exceeds the 5 MB limit');
  const expectedExtension = ALLOWED_RESUME_TYPES.get(file.mimetype);
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (!expectedExtension || extension !== expectedExtension || !contentMatches(file, expectedExtension)) throw new AppError('UNSUPPORTED_RESUME_TYPE', 415, 'Only valid PDF and DOCX resumes are supported');
  return file;
}
