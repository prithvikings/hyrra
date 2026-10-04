import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1),
  AI_PROVIDER: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  STORAGE_PROVIDER: z.string().default('local'),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ROOT: z.string().default('./storage/resumes')
});
export type Env = z.infer<typeof envSchema>;
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env { const result = envSchema.safeParse(source); if (!result.success) throw new Error(`Invalid environment configuration: ${JSON.stringify(result.error.flatten().fieldErrors)}`); return result.data; }
let _config: Env | undefined;
export const getConfig = (): Env => { if (!_config) _config = loadEnv(); return _config; };
