import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { getConfig } from '../../config/env';

export interface ResumeStorage { put(key: string, data: Buffer): Promise<void>; get(key: string): Promise<Buffer>; delete(key: string): Promise<void>; }
class LocalResumeStorage implements ResumeStorage {
  private readonly root = resolve(getConfig().STORAGE_ROOT);
  private pathFor(key: string) {
    const path = resolve(this.root, key.replace(/\\/g, '/'));
    const relativePath = relative(this.root, path);
    if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || relativePath.includes(`${sep}..${sep}`)) throw new Error('Invalid storage key');
    return path;
  }
  async put(key: string, data: Buffer) { const path = this.pathFor(key); await mkdir(dirname(path), { recursive: true }); await writeFile(path, data, { flag: 'wx' }); }
  async get(key: string) { return readFile(this.pathFor(key)); }
  async delete(key: string) { try { await unlink(this.pathFor(key)); } catch (error: any) { if (error?.code !== 'ENOENT') throw error; } }
}
let storage: ResumeStorage | undefined;
export function getResumeStorage() { return storage ??= new LocalResumeStorage(); }
export function createStorageKey(resumeId: string, versionId: string, extension: string) { return `${resumeId}/${versionId}-${randomUUID()}${extension}`; }
