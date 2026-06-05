import { en } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';
export type Messages = typeof en;

export const messages: Record<Locale, Messages> = { en, ar };