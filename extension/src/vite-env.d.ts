/// <reference types="vite/client" />

declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: Record<string, unknown>);
    use(plugin: unknown): TurndownService;
    addRule(name: string, rule: { filter: unknown; replacement: (...args: unknown[]) => string }): TurndownService;
    turndown(html: string): string;
  }
}

declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';
  export function gfm(service: TurndownService): void;
}
