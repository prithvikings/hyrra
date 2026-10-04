import { createHash } from 'node:crypto';
import { z } from 'zod';

export const rawJobSchema = z.object({
  externalJobId: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(300),
  company: z.object({ name: z.string().trim().min(1).max(200), website: z.string().url().optional(), logoUrl: z.string().url().optional(), description: z.string().optional() }),
  description: z.string().trim().min(1),
  location: z.string().trim().max(300).optional(),
  workMode: z.string().trim().optional(),
  employmentType: z.string().trim().optional(),
  experienceLevel: z.string().trim().optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  salaryCurrency: z.string().trim().length(3).optional(),
  salaryText: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1).max(100)).default([]),
  sourceUrl: z.string().url().optional(),
  postedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  rawMetadata: z.record(z.string(), z.unknown()).optional()
});

export type RawJobRecord = z.input<typeof rawJobSchema>;
export type ValidatedRawJob = z.output<typeof rawJobSchema>;

export type CanonicalJobInput = {
  externalJobId: string;
  title: string;
  normalizedTitle: string;
  company: { name: string; normalizedName: string; website?: string; logoUrl?: string; description?: string };
  description: string;
  location?: string;
  normalizedLocation?: string;
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY' | 'FREELANCE';
  experienceLevel?: 'INTERN' | 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'EXECUTIVE';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryText?: string;
  skills: string[];
  sourceUrl?: string;
  normalizedSourceUrl?: string;
  descriptionSignature: string;
  postedAt?: Date;
  expiresAt?: Date;
  rawMetadata?: Record<string, unknown>;
  dedupeFingerprint: string;
};

export const normalizeText = (value: string) => value.normalize('NFKC').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

export function normalizeTitle(value: string) {
  return normalizeText(value.replace(/\s[-–—]\s.+$/u, ''));
}

export function normalizeLocation(value?: string) {
  if (!value) return undefined;
  const normalized = normalizeText(value);
  return normalized || undefined;
}

export function normalizeSourceUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    url.hash = '';
    const trackingParameters = new Set(['fbclid', 'gclid', 'ref', 'source', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term']);
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || trackingParameters.has(key.toLowerCase())) url.searchParams.delete(key);
    }
    url.search = url.searchParams.toString();
    return url.toString().replace(/\/$/u, '');
  } catch {
    return undefined;
  }
}

export function normalizeWorkMode(value?: string): CanonicalJobInput['workMode'] {
  if (!value) return undefined;
  const normalized = normalizeText(value).replace(/\s/g, '');
  if (['remote', 'remotely', 'wfh', 'workfromhome'].includes(normalized)) return 'REMOTE';
  if (['hybrid', 'hybridremote'].includes(normalized)) return 'HYBRID';
  if (['onsite', 'on-site', 'office', 'onpremise'].includes(normalized)) return 'ONSITE';
  return undefined;
}

export function normalizeEmploymentType(value?: string): CanonicalJobInput['employmentType'] {
  if (!value) return undefined;
  const normalized = normalizeText(value).replace(/\s/g, '');
  if (['fulltime', 'fulltimeemployment', 'ft', 'permanent'].includes(normalized)) return 'FULL_TIME';
  if (['parttime', 'pt'].includes(normalized)) return 'PART_TIME';
  if (['contract', 'contractor'].includes(normalized)) return 'CONTRACT';
  if (['internship', 'intern'].includes(normalized)) return 'INTERNSHIP';
  if (['temporary', 'temp'].includes(normalized)) return 'TEMPORARY';
  if (['freelance', 'freelancer'].includes(normalized)) return 'FREELANCE';
  return undefined;
}

export function normalizeExperienceLevel(value?: string): CanonicalJobInput['experienceLevel'] {
  if (!value) return undefined;
  const normalized = normalizeText(value);
  if (/intern/.test(normalized)) return 'INTERN';
  if (/entry|junior|graduate|fresher/.test(normalized)) return 'ENTRY';
  if (/mid|intermediate|associate/.test(normalized)) return 'MID';
  if (/senior|sr\b/.test(normalized)) return 'SENIOR';
  if (/lead|principal|staff/.test(normalized)) return 'LEAD';
  if (/manager|head/.test(normalized)) return 'MANAGER';
  if (/director|executive|vp|chief/.test(normalized)) return 'EXECUTIVE';
  return undefined;
}

export function normalizeSkill(value: string) { return normalizeText(value); }

export function buildDedupeFingerprint(company: string, title: string, location?: string, employmentType?: string, experienceLevel?: string) {
  const material = [normalizeText(company), normalizeTitle(title), normalizeLocation(location) ?? '', employmentType ?? '', experienceLevel ?? ''].join('|');
  return createHash('sha256').update(material).digest('hex');
}

export function buildDescriptionSignature(description: string) {
  return createHash('sha256').update(normalizeText(description)).digest('hex');
}

export function normalizeJob(input: RawJobRecord): CanonicalJobInput {
  const raw = rawJobSchema.parse(input);
  const normalizedCompany = normalizeText(raw.company.name);
  const normalizedTitle = normalizeTitle(raw.title);
  const normalizedLocation = normalizeLocation(raw.location);
  const workMode = normalizeWorkMode(raw.workMode);
  const employmentType = normalizeEmploymentType(raw.employmentType);
  const experienceLevel = normalizeExperienceLevel(raw.experienceLevel);
  if (raw.salaryMin !== undefined && raw.salaryMax !== undefined && raw.salaryMin > raw.salaryMax) throw new Error('salary_min_greater_than_max');
  const skills = [...new Set(raw.skills.map(normalizeSkill).filter(Boolean))];
  const normalizedSourceUrl = normalizeSourceUrl(raw.sourceUrl);
  return {
    externalJobId: raw.externalJobId,
    title: raw.title,
    normalizedTitle,
    company: { ...raw.company, normalizedName: normalizedCompany },
    description: raw.description,
    location: raw.location,
    normalizedLocation,
    workMode,
    employmentType,
    experienceLevel,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    salaryCurrency: raw.salaryCurrency?.toUpperCase(),
    salaryText: raw.salaryText,
    skills,
    sourceUrl: raw.sourceUrl,
    normalizedSourceUrl,
    descriptionSignature: buildDescriptionSignature(raw.description),
    postedAt: raw.postedAt,
    expiresAt: raw.expiresAt,
    rawMetadata: raw.rawMetadata,
    dedupeFingerprint: buildDedupeFingerprint(normalizedCompany, raw.title, raw.location, employmentType, experienceLevel)
  };
}
