import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { ThreadPayload, SaveMeta, ThreadTurn } from '../types/thread';
import { buildFrontmatter } from './frontmatter';

export function createTurndownService(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  td.use(gfm);

  td.addRule('removeMedia', {
    filter: ['img', 'video', 'svg'],
    replacement: () => '',
  });

  td.addRule('removeCitationPills', {
    filter(node: HTMLElement) {
      return (
        node.nodeName === 'BUTTON' &&
        node.getAttribute('data-amic') === 'true' &&
        node.hasAttribute('data-icl-uuid')
      );
    },
    replacement: () => '',
  });

  return td;
}

export function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

export function turnToMarkdown(turn: ThreadTurn, td: TurndownService = createTurndownService()): string {
  const heading = turn.role === 'user' ? '## User' : '## AI';
  const body = normalizeMarkdown(td.turndown(turn.html));
  return `${heading}\n\n${body}`;
}

export function buildMarkdown(payload: ThreadPayload, meta: SaveMeta): string {
  const td = createTurndownService();
  const frontmatter = buildFrontmatter({
    title: meta.title,
    date: meta.date,
    source_url: meta.sourceUrl,
  });
  const sections = payload.turns.map((turn) => turnToMarkdown(turn, td)).join('\n\n');
  return `${frontmatter}${sections}\n`;
}

export function buildTitleFromPayload(payload: ThreadPayload): string {
  const firstUser = payload.turns.find((turn) => turn.role === 'user')?.plainText.trim();
  return firstUser?.slice(0, 80) ?? 'Untitled chat';
}
