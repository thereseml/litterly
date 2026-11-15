import assert from 'node:assert/strict';
import test from 'node:test';
import { suggestedPetName, validatePets } from '../src/lib/pets';

test('pet names are suggested by species and ordinal', () => {
  assert.equal(suggestedPetName('cat', 2), 'Kattunge 2');
  assert.equal(suggestedPetName('dog', 4), 'Valp 4');
});

test('a pet requires a name and a selected sex', () => {
  assert.equal(validatePets([{ name: 'Kattunge 1', sex: 'female', notes: null }]), null);
  assert.equal(validatePets([{ name: '   ', sex: 'male', notes: null }]), 'pets.nameError');
  assert.equal(validatePets([{ name: 'Valp 1', sex: '' as never, notes: null }]), 'pets.sexError');
});

test('pet batches and notes enforce bounds', () => {
  assert.equal(validatePets([]), 'pets.countError');
  assert.equal(validatePets(Array.from({ length: 31 }, (_, index) => ({ name: `Pet ${index}`, sex: 'male' as const, notes: null }))), 'pets.countError');
  assert.equal(validatePets([{ name: 'Kattunge', sex: 'female', notes: 'x'.repeat(2001) }]), 'pets.notesError');
});
