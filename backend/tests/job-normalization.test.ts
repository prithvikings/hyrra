import { describe, expect, it } from 'vitest';
import { buildDedupeFingerprint, buildDescriptionSignature, normalizeEmploymentType, normalizeExperienceLevel, normalizeJob, normalizeLocation, normalizeSourceUrl, normalizeTitle, normalizeWorkMode } from '../src/modules/jobs/job-normalizer';
import { resolveFreshness } from '../src/modules/jobs/job-freshness';

const base = { externalJobId: '1', title: 'Senior Software Engineer - Backend', company: { name: 'Acme Inc' }, description: 'Build backend systems', location: 'Remote', workMode: 'WFH', employmentType: 'FT', experienceLevel: 'Senior', salaryMin: 100000, salaryMax: 120000, salaryCurrency: 'usd', skills: ['TypeScript', ' TypeScript ', 'Node.js'] };

describe('job normalization', () => {
  it('normalizes title while preserving display title', () => {
    expect(normalizeTitle(base.title)).toBe('senior software engineer');
    expect(normalizeJob(base).title).toBe(base.title);
  });
  it('normalizes location and work mode', () => {
    expect(normalizeLocation('  Bengaluru, India ')).toBe('bengaluru india');
    expect(normalizeWorkMode('work from home')).toBe('REMOTE');
    expect(normalizeWorkMode('Hybrid')).toBe('HYBRID');
    expect(normalizeWorkMode('On-site')).toBe('ONSITE');
  });
  it('normalizes employment and experience categories', () => {
    expect(normalizeEmploymentType('full time')).toBe('FULL_TIME');
    expect(normalizeEmploymentType('contract')).toBe('CONTRACT');
    expect(normalizeExperienceLevel('senior engineer')).toBe('SENIOR');
    expect(normalizeExperienceLevel('junior')).toBe('ENTRY');
  });
  it('normalizes salary and deduplicates skills', () => {
    const result = normalizeJob(base);
    expect(result.salaryCurrency).toBe('USD');
    expect(result.skills).toEqual(['typescript', 'node js']);
  });
});

describe('deterministic deduplication', () => {
  it('produces the same candidate fingerprint for equivalent source representations', () => {
    expect(buildDedupeFingerprint('Acme Inc', 'Senior Software Engineer', 'Remote', 'FULL_TIME', 'SENIOR')).toBe(buildDedupeFingerprint('ACME INC', 'senior software engineer', 'REMOTE', 'FULL_TIME', 'SENIOR'));
  });
  it('keeps materially different locations distinct', () => {
    expect(buildDedupeFingerprint('Acme', 'Software Engineer', 'Bengaluru', 'FULL_TIME', 'MID')).not.toBe(buildDedupeFingerprint('Acme', 'Software Engineer', 'Delhi', 'FULL_TIME', 'MID'));
  });
  it('does not treat the candidate fingerprint as sufficient identity', () => {
    const first = normalizeJob({ ...base, externalJobId: 'a', description: 'Build backend systems', sourceUrl: 'https://jobs.example.com/a' });
    const second = normalizeJob({ ...base, externalJobId: 'b', description: 'Lead a completely different platform team', sourceUrl: 'https://jobs.example.com/b' });
    expect(first.dedupeFingerprint).toBe(second.dedupeFingerprint);
    expect(first.descriptionSignature).not.toBe(second.descriptionSignature);
    expect(first.normalizedSourceUrl).not.toBe(second.normalizedSourceUrl);
  });
  it('normalizes tracking parameters out of source URLs', () => {
    expect(normalizeSourceUrl('https://jobs.example.com/role/123?utm_source=feed&utm_campaign=test&ref=home')).toBe('https://jobs.example.com/role/123');
  });
  it('creates deterministic description signatures', () => {
    expect(buildDescriptionSignature(' Build backend systems ')).toBe(buildDescriptionSignature('build   BACKEND systems'));
  });
});

describe('freshness', () => {
  it('marks explicit past expiration as expired', () => {
    expect(resolveFreshness(new Date('2026-01-01'), new Date('2026-02-01'))).toBe('EXPIRED');
  });
  it('keeps jobs without an expiration active', () => {
    expect(resolveFreshness(undefined, new Date('2026-02-01'))).toBe('ACTIVE');
  });
});
