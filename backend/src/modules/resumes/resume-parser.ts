const SECTION_ALIASES: Record<string, string[]> = {
  summary: ['summary', 'profile', 'objective', 'professional summary'],
  experience: ['experience', 'work experience', 'employment', 'professional experience'],
  education: ['education', 'academic background'],
  skills: ['skills', 'technical skills', 'core skills'],
  projects: ['projects', 'personal projects'],
  certifications: ['certifications', 'certificates'],
};

function sectionKey(line: string): string | null {
  const normalized = line.trim().toLowerCase().replace(/[:\-]+$/, '');
  return Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] ?? null;
}

export interface ParsedResumeData {
  schemaVersion: 1;
  personal: { name?: string; email?: string; phone?: string; location?: string; linkedin?: string; github?: string; portfolio?: string };
  sections: Record<string, string[]>;
  skills: string[];
}

export function parseResumeText(text: string): ParsedResumeData {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const sections: Record<string, string[]> = {};
  let current = 'header';
  sections[current] = [];
  for (const line of lines) {
    const key = sectionKey(line);
    if (key) { current = key; sections[current] ??= []; continue; }
    sections[current].push(line);
  }

  const header = sections.header.join(' ');
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  const links = [...text.matchAll(/https?:\/\/[^\s)]+/gi)].map((match) => match[0]);
  const name = lines.find((line) => !line.includes('@') && !/^https?:\/\//i.test(line) && line.length <= 80);
  const skills = [...(sections.skills ?? []).join(' ').split(/[,|•·]/).map((skill) => skill.trim()).filter(Boolean)];

  return {
    schemaVersion: 1,
    personal: {
      name,
      email,
      phone,
      linkedin: links.find((url) => /linkedin\.com/i.test(url)),
      github: links.find((url) => /github\.com/i.test(url)),
      portfolio: links.find((url) => !/linkedin\.com|github\.com/i.test(url)),
      location: undefined
    },
    sections,
    skills
  };
}
