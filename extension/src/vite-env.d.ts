/// <reference types="vite/client" />

interface FileSystemDirectoryHandle {
  queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
}

interface Window {
  showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
}

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
