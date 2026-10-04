import { z } from 'zod';
const email=z.string().trim().email().transform(v=>v.toLowerCase()); const password=z.string().min(8).max(128);
export const registerSchema=z.object({body:z.object({email,password}),params:z.object({}),query:z.object({})});
export const loginSchema=z.object({body:z.object({email,password}),params:z.object({}),query:z.object({})});
export const emptySchema=z.object({body:z.object({}).default({}),params:z.object({}),query:z.object({})});
export { email,password };
