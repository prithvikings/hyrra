import { describe, expect, it } from 'vitest';
import { parseResumeText } from '../src/modules/resumes/resume-parser';

describe('resume parser', () => {
  it('normalizes sections and extracts contact links and skills', () => {
    const result = parseResumeText(`Jane Doe\njane@example.com\nhttps://linkedin.com/in/jane\n\nSkills\nTypeScript, React, PostgreSQL\n\nExperience\nSenior Engineer at Acme`);
    expect(result.schemaVersion).toBe(1);
    expect(result.personal.name).toBe('Jane Doe');
    expect(result.personal.email).toBe('jane@example.com');
    expect(result.personal.linkedin).toContain('linkedin.com');
    expect(result.skills).toEqual(['TypeScript', 'React', 'PostgreSQL']);
    expect(result.sections.experience).toContain('Senior Engineer at Acme');
  });
});
