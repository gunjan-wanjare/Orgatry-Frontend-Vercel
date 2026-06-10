import { format, isValid, parseISO } from 'date-fns';

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

export const getDateValue = (value: unknown): Date | null => toDate(value);
