import { API_BASE_URL } from '../config';
import { tokenStore } from '../auth/tokenStore';
import { clientMessage, localizeServerMessage } from '../lib/serverMessages';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

/** Normalized error for every failed request. */
export class ApiError extends Error {
  status: number;
  /** Field → message map built from express-validator `errors[]` (keyed by `path`). */
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** Human friendly message for any thrown value. */
export function errorMessage(e: unknown, fallback = clientMessage('generic')): string {
  if (isApiError(e)) return e.message || fallback;
  if (e instanceof Error && e.name !== 'AbortError') return e.message || fallback;
  return fallback;
}

/**
 * Builds a query string. Keys are passed through verbatim so bracket
 * operators work (`price[gte]`, `ratingsAverage[gte]`). Empty values are
 * dropped; arrays repeat the key.
 */
export function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const v of values) {
      if (v === undefined || v === null || v === '') continue;
      qs.append(key, String(v));
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

type UnauthorizedHandler = (message: string) => void;
let onUnauthorized: UnauthorizedHandler | null = null;
/** Registered by AuthProvider: clears the session and redirects to login. */
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  onUnauthorized = fn;
}

interface RequestOptions {
  params?: QueryParams;
  /** JSON body (object) or multipart body (FormData). */
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Backend bug (not in the guide's list): updating a product/category calls
 * `save()` after the post-init hook turned the file name into a full URL, so
 * the URL is persisted and prefixed again on every read
 * (`http://host/categories/http://host/categories/x.jpeg`). Keep the last,
 * real URL. Remove once the backend stops re-saving the populated document.
 */
const NESTED_URL = /^https?:\/\/.+https?:\/\//;
function fixNestedUrls(value: unknown): unknown {
  if (typeof value === 'string') return NESTED_URL.test(value) ? value.slice(value.lastIndexOf('http')) : value;
  if (Array.isArray(value)) return value.map(fixNestedUrls);
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) (value as Record<string, unknown>)[k] = fixNestedUrls(v);
  }
  return value;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return fixNestedUrls(JSON.parse(text));
  } catch {
    return text;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const body = (payload && typeof payload === 'object' ? payload : {}) as {
    errors?: Array<{ msg?: string; path?: string; param?: string }>;
    message?: string;
  };
  if (Array.isArray(body.errors) && body.errors.length) {
    const fieldErrors: Record<string, string> = {};
    for (const err of body.errors) {
      const key = err.path || err.param;
      if (key && !fieldErrors[key] && err.msg) fieldErrors[key] = localizeServerMessage(err.msg);
    }
    return new ApiError(localizeServerMessage(body.errors[0].msg || '') || clientMessage(400), status, fieldErrors);
  }
  const known = [400, 401, 403, 404, 500] as const;
  const fallback = (known as readonly number[]).includes(status) ? clientMessage(status as (typeof known)[number]) : `Request failed (${status}).`;
  const message = typeof body.message === 'string' && body.message ? localizeServerMessage(body.message) : fallback;
  return new ApiError(message, status);
}

export async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body; // browser sets the multipart boundary
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(opts.params)}`, {
      method,
      headers,
      body,
      signal: opts.signal
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError(clientMessage('network'), 0);
  }

  const payload = await parseBody(res);
  if (!res.ok) {
    const err = toApiError(res.status, payload);
    // Only an authenticated request can mean "session expired"; a failed
    // login also returns 401 but carries no token.
    // In NODE_ENV=development the backend skips its JWT→401 mapping and
    // returns these as 500, so match the jsonwebtoken messages too.
    const jwtFailure = res.status === 500 && /jwt|invalid signature|invalid token/i.test(err.message);
    if ((res.status === 401 || jwtFailure) && token && onUnauthorized) onUnauthorized(err.message);
    throw err;
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) => request<T>('GET', path, { params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T = null>(path: string) => request<T>('DELETE', path)
};
