import type { User } from '../api/types';

const KEY = 'rc_session';

export interface StoredSession {
  token: string;
  user: User | null;
}

function read(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed && typeof parsed.token === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

let cache: StoredSession | null = read();

/** Single source of truth for the persisted auth token (used by the API client). */
export const tokenStore = {
  get: () => cache?.token ?? null,
  getSession: () => cache,
  set(session: StoredSession | null) {
    cache = session;
    try {
      if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable — session lives in memory only */
    }
  }
};
