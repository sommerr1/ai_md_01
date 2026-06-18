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
  | 'EXTRACT_ERROR'
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

export interface PreviewResponse {
  type: 'PREVIEW_RESPONSE';
  firstMessage?: string;
  defaultFilename?: string;
}

export interface SaveError {
  type: 'SAVE_ERROR';
  code: SaveErrorCode;
  message?: string;
}

export interface SaveSuccess {
  type: 'SAVE_SUCCESS';
  filename: string;
  partial?: boolean;
}

export type SaveErrorCode =
  | 'NOT_AI_MODE'
  | 'NO_FOLDER'
  | 'NO_TAB'
  | 'PERMISSION_DENIED'
  | 'EMPTY_THREAD'
  | 'DOM_CHANGED'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type RuntimeMessage =
  | { type: 'GET_STATUS' }
  | StatusResponse
  | { type: 'GET_PREVIEW' }
  | PreviewResponse
  | { type: 'PICK_FOLDER' }
  | { type: 'FOLDER_SET'; displayName: string }
  | { type: 'GET_FOLDER_STATUS' }
  | { type: 'FOLDER_STATUS'; hasFolder: boolean; displayName?: string }
  | { type: 'SAVE_REQUEST'; filename: string }
  | { type: 'EXTRACT_THREAD' }
  | { type: 'THREAD_EXTRACTED'; payload: ThreadPayload }
  | { type: 'EXTRACT_ERROR'; code: 'EMPTY_THREAD' | 'DOM_CHANGED'; message?: string }
  | { type: 'WRITE_FILE'; filename: string; content: string }
  | { type: 'WRITE_SUCCESS'; filename: string }
  | { type: 'WRITE_ERROR'; code: string }
  | SaveSuccess
  | SaveError;
