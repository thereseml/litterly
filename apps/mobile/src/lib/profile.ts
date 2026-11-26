import type { BreederProfileInput } from './api-client';

export function profileInput(kennelName: string): BreederProfileInput | null {
  const kennel_name = kennelName.trim();
  if (kennel_name.length > 100) return null;
  return { kennel_name: kennel_name || null };
}
