/**
 * Centralized helper for sending form submissions to the brand email.
 *
 * IMPORTANT: This uses the `mailto:` protocol because Magic Patterns is a
 * frontend-only environment with no backend. It opens the user's default
 * email app pre-filled with their submission, ready to send.
 *
 * To switch to true one-click delivery (no email app step), replace the
 * body of `sendToEmail` with a call to a service like EmailJS, Formspree,
 * Resend, or your own backend endpoint. The rest of the app code does not
 * need to change.
 */

export const BRAND_EMAIL = 'royalcareuae@hotmail.com';

export interface EmailPayload {
  subject: string;
  /** Object whose keys become labels and values become the message body. */
  fields: Record<string, string>;
}

function buildBody(fields: Record<string, string>): string {
  return Object.entries(fields).
  filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '').
  map(([k, v]) => `${k}: ${v}`).
  join('\n');
}

export function sendToEmail({ subject, fields }: EmailPayload): void {
  const body = buildBody(fields);
  const url = `mailto:${BRAND_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}