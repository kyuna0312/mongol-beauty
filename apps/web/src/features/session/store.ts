import { makeVar, useReactiveVar } from '@apollo/client';

export interface SessionUserSnapshot {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export type SessionState = 'unknown' | 'authenticated' | 'anonymous';

export const sessionUserVar = makeVar<SessionUserSnapshot | null>(null);
export const sessionStateVar = makeVar<SessionState>('unknown');

export function setSessionUser(user: SessionUserSnapshot) {
  sessionUserVar(user);
  sessionStateVar('authenticated');
}

export function clearSessionUser() {
  sessionUserVar(null);
  sessionStateVar('anonymous');
}

export function useSessionStore() {
  return {
    user: useReactiveVar(sessionUserVar),
    state: useReactiveVar(sessionStateVar),
  };
}
