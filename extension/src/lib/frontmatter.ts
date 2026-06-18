function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Frontmatter field order: title, date, source_url (local date). */
export function buildFrontmatter(meta: {
  title: string;
  date: string;
  source_url: string;
}): string {
  const lines = [
    '---',
    `title: ${yamlQuote(meta.title)}`,
    `date: ${meta.date}`,
    `source_url: ${yamlQuote(meta.source_url)}`,
    '---',
    '',
  ];
  return lines.join('\n');
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
