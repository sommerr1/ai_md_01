export type ExtractErrorCode = 'EMPTY_THREAD' | 'DOM_CHANGED';

export class ExtractError extends Error {
  readonly code: ExtractErrorCode;

  constructor(code: ExtractErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
