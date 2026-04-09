import { AsyncLocalStorage } from 'node:async_hooks';

export type HttpRequestContext = {
  requestId: string;
  traceId: string;
};

export const requestContext = new AsyncLocalStorage<HttpRequestContext>();

export function getRequestContext(): HttpRequestContext | undefined {
  return requestContext.getStore();
}
