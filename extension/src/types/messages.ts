import type { ThreadPayload } from './thread';

export type MessageType =
  | 'GET_STATUS'
  | 'STATUS_RESPONSE'
  | 'GET_PREVIEW'
  | 'PREVIEW_RESPONSE'
  | 'PICK_FOLDER'
  | 'FOLDER_SET'
  | 'GET_FOLDER_STATUS'
  | 'SAVE_REQUEST'
  | 'EXTRACT_THREAD'
  | 'THREAD_EXTRACTED'
  | 'WRITE_FILE'
  | 'WRITE_SUCCESS'
  | 'WRITE_ERROR'
  | 'SAVE_SUCCESS'
  | 'SAVE_ERROR';

export interface StatusResponse {
  type: 'STATUS_RESPONSE';
  aiMode: boolean;
  turnCount?: number;
}

export interface SaveError {
  type: 'SAVE_ERROR';
  code: string;
  message?: string;
}

export interface SaveSuccess {
  type: 'SAVE_SUCCESS';
  filename: string;
}

export type RuntimeMessage =
  | { type: 'GET_STATUS' }
  | StatusResponse
  | { type: 'GET_PREVIEW' }
  | { type: 'PREVIEW_RESPONSE'; firstMessage?: string }
  | { type: 'PICK_FOLDER' }
  | { type: 'FOLDER_SET'; displayName: string }
  | { type: 'GET_FOLDER_STATUS' }
  | { type: 'SAVE_REQUEST'; filename: string }
  | { type: 'EXTRACT_THREAD' }
  | { type: 'THREAD_EXTRACTED'; payload: ThreadPayload }
  | { type: 'WRITE_FILE'; filename: string; content: string }
  | { type: 'WRITE_SUCCESS'; filename: string }
  | { type: 'WRITE_ERROR'; code: string }
  | SaveSuccess
  | SaveError;
