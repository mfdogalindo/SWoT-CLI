export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export interface LogMeta {
  [key: string]: any;
}
