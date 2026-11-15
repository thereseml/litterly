import type { LitterInput } from './api';

export function validateLitter(input: LitterInput): string | null {
  if (!input.name.trim() || input.name.trim().length > 100) return 'litters.nameError';
  const date = new Date(`${input.born_on}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.born_on) || input.born_on.startsWith('0000') || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input.born_on || input.born_on > new Date().toISOString().slice(0, 10)) return 'litters.dateError';
  if (!Number.isInteger(input.count) || input.count < 1 || input.count > 30) return 'litters.countError';
  if ((input.mother_name?.length ?? 0) > 100 || (input.father_name?.length ?? 0) > 100 || (input.notes?.length ?? 0) > 2000) return 'litters.lengthError';
  return null;
}

export function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
