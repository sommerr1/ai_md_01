/**
 * KB-003 Turndown spike — same rules planned for extension/src/lib/markdown.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createTurndownService() {
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
    filter(node) {
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

const htmlPath = path.join(__dirname, 'sample-ai-response.html');
const outDir = path.join(__dirname, 'output');
const outPath = path.join(outDir, 'sample.md');

const html = fs.readFileSync(htmlPath, 'utf8');
const td = createTurndownService();
const markdown = td.turndown(html);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, markdown, 'utf8');

console.log('Written:', outPath);
console.log('---');
console.log(markdown);
