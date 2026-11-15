import type { PetInput } from './api-client';

export function suggestedPetName(species: 'cat' | 'dog', number: number): string {
  return `${species === 'cat' ? 'Kattunge' : 'Valp'} ${number}`;
}

export function validatePets(pets: PetInput[]): string | null {
  if (pets.length < 1 || pets.length > 30) return 'pets.countError';
  if (pets.some((pet) => !pet.name.trim() || pet.name.trim().length > 100)) return 'pets.nameError';
  if (pets.some((pet) => pet.sex !== 'male' && pet.sex !== 'female')) return 'pets.sexError';
  if (pets.some((pet) => (pet.notes?.length ?? 0) > 2000)) return 'pets.notesError';
  return null;
}
