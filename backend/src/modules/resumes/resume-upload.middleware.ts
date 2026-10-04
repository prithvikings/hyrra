import multer from 'multer';
import type { RequestHandler } from 'express';
import { AppError } from '../../errors/app-error';
import { MAX_RESUME_SIZE_BYTES, ALLOWED_RESUME_TYPES } from './resume-upload';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ALLOWED_RESUME_TYPES.has(file.mimetype))
});

export const resumeFileUpload = (field = 'file'): RequestHandler => (req, res, next) => {
  upload.single(field)(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return next(new AppError('RESUME_FILE_TOO_LARGE', 413, 'Resume file exceeds the 5 MB limit'));
      return next(new AppError('INVALID_RESUME_UPLOAD', 400, 'Invalid resume upload'));
    }
    next();
  });
};
