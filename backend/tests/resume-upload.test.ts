import { describe, expect, it } from 'vitest';
import { validateResumeUpload, MAX_RESUME_SIZE_BYTES } from '../src/modules/resumes/resume-upload';

describe('resume upload validation', () => {
  const file = (overrides: Partial<Express.Multer.File> = {}) => ({ originalname: 'resume.pdf', mimetype: 'application/pdf', size: 1024, buffer: Buffer.from('pdf'), fieldname: 'file', encoding: '7bit', destination: '', filename: '', path: '', stream: undefined as any, ...overrides }) as Express.Multer.File;
  it('accepts PDF and DOCX metadata', () => { expect(validateResumeUpload(file()).mimetype).toBe('application/pdf'); expect(validateResumeUpload(file({ originalname: 'resume.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).mimetype).toContain('wordprocessing'); });
  it('rejects unsupported extension/type and oversized files', () => {
    expect(() => validateResumeUpload(file({ originalname: 'resume.txt', mimetype: 'text/plain' }))).toThrow('Only PDF and DOCX');
    expect(() => validateResumeUpload(file({ size: MAX_RESUME_SIZE_BYTES + 1 }))).toThrow('5 MB');
  });
});
