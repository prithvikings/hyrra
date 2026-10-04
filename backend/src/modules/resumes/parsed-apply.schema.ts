import { z } from 'zod';
export const parsedApplySchema = z.object({
  personal: z.object({ fullName: z.string().trim().max(200).optional(), location: z.string().trim().max(200).optional(), websiteUrl: z.string().url().max(500).optional().nullable() }).optional(),
  skills: z.array(z.string().trim().min(1).max(100)).max(100).optional()
}).refine((data) => Boolean(data.personal || data.skills), { message: 'At least one parsed field must be selected' });
