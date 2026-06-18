import { stringify } from 'yaml';

export function buildFrontmatter(meta: {
  title: string;
  date: string;
  source_url: string;
}): string {
  return `---\n${stringify(meta).trim()}\n---\n\n`;
}
