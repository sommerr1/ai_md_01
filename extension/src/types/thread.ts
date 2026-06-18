export interface ThreadTurn {
  role: 'user' | 'ai';
  html: string;
  plainText: string;
}

export interface ThreadPayload {
  turns: ThreadTurn[];
  sourceUrl: string;
  extractedAt: string;
  partial?: boolean;
}

export interface SaveMeta {
  filename: string;
  sourceUrl: string;
  title: string;
  date: string;
}
