import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { isApiError } from '../api/client';

type Errors = Record<string, string | undefined>;

/**
 * Minimal controlled-form helper. `applyServerError` maps express-validator
 * `errors[].path` onto fields and returns the message to show globally.
 */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: undefined } : e));
  }, []);

  const bind = (key: keyof T & string) => ({
    name: key,
    value: (values[key] ?? '') as string,
    error: errors[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as T[typeof key])
  });

  /** Returns the message for a banner/toast, or null if every error was mapped to a visible field. */
  const applyServerError = (err: unknown, knownFields: string[] = Object.keys(values)): string => {
    if (isApiError(err) && Object.keys(err.fieldErrors).length) {
      setErrors((e) => ({ ...e, ...err.fieldErrors }));
      const unmapped = Object.keys(err.fieldErrors).filter((k) => !knownFields.includes(k));
      return unmapped.length ? err.fieldErrors[unmapped[0]]! : err.message;
    }
    return isApiError(err) || err instanceof Error ? (err as Error).message : 'Something went wrong.';
  };

  const reset = useCallback((next?: T) => {
    setValues(next ?? initial);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { values, setValues, errors, setErrors, set, bind, applyServerError, reset };
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Keeps the latest value of a callback without re-running effects. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Backend accepts UAE, Egyptian or Saudi mobile numbers (isMobilePhone ar-AE / ar-EG / ar-SA). */
export const PHONE_RE = /^(\+?971|0)?5[024568]\d{7}$|^(\+?20|0)?1[0125]\d{8}$|^(\+?966|0)?5\d{8}$/;
