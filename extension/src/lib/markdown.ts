import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { ThreadPayload, SaveMeta, ThreadTurn } from '../types/thread';

export function createTurndownService(): TurndownService {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  td.use(gfm);
  td.addRule('removeMedia', {
    filter: ['img', 'video', 'svg'],
    replacement: () => '',
  });
  return td;
}

export function turnToMarkdown(_turn: ThreadTurn): string {
  return '';
}

export function buildMarkdown(_payload: ThreadPayload, _meta: SaveMeta): string {
  return '';
}
