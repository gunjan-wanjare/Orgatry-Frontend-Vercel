import { format, isValid, parseISO } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const DEFAULT_LOCALE = 'en-IN';

const toDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const fromIso = parseISO(trimmed);
    if (isValid(fromIso)) {
      return fromIso;
    }

    const parsed = new Date(trimmed);
    return isValid(parsed) ? parsed : null;
  }

  const parsed = new Date(String(value));
  return isValid(parsed) ? parsed : null;
};

export const getDefaultTimezone = (): string => DEFAULT_TIMEZONE;

export const getDefaultLocale = (): string => DEFAULT_LOCALE;

export const formatDate = (value: unknown, pattern = 'dd MMM yyyy', fallback = '-'): string => {
  const parsedDate = toDate(value);

  if (!parsedDate) {
    return fallback;
  }

  return format(parsedDate, pattern);
};

export const formatDateTime = (value: unknown, fallback = '-'): string => {
  return formatDate(value, 'dd MMM yyyy, hh:mm a', fallback);
};

export const formatDateTimeInTimezone = (
  value: unknown,
  timezone?: string,
  fallback = '-',
): string => {
  if (!value || value === '') return fallback;
  const str = String(value);
  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    const tz = timezone ?? DEFAULT_TIMEZONE;
    const zoned = toZonedTime(date, tz);
    return tzFormat(zoned, "dd MMM yyyy, hh:mm:ss a", { timeZone: tz });
  } catch {
    return str;
  }
};

export const getDateValue = (value: unknown): Date | null => toDate(value);
