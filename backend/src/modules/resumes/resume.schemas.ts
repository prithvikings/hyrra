import { z } from 'zod';

export const resumeMetadataSchema = z.object({
  name: z.string().trim().min(1).max(160),
  targetRole: z.string().trim().max(160).optional().nullable()
});

export const resumeIdSchema = z.object({ id: z.string().uuid() });
export const versionIdSchema = z.object({ id: z.string().uuid(), versionId: z.string().uuid() });

export const resumeUpdateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  targetRole: z.string().trim().max(160).optional().nullable(),
  isDefault: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const resumeVersionMetadataSchema = z.object({
  originalFilename: z.string().trim().min(1).max(255).optional()
});
