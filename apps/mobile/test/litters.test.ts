import assert from 'node:assert/strict';
import test from 'node:test';
import { validateLitter, formatDate } from '../src/lib/litters';

const valid = { species: 'cat' as const, name: 'Solskenskullen', born_on: '2024-02-29', count: 4, mother_name: null, father_name: null, notes: null };

test('a valid born litter accepts optional parent names and notes', () => {
  assert.equal(validateLitter(valid), null);
  assert.equal(validateLitter({ ...valid, species: 'dog', mother_name: 'Luna', notes: 'Hello' }), null);
});
test('birth dates must be real calendar dates, not in the future', () => {
  for (const born_on of ['2023-02-29', '2024-04-31', '2024-13-01', '0000-01-01', '2024-2-1', '9999-01-01', '']) {
    assert.equal(validateLitter({ ...valid, born_on }), 'litters.dateError');
  }
  assert.equal(validateLitter({ ...valid, born_on: new Date().toISOString().slice(0, 10) }), null);
});
test('name, count and optional text enforce bounds', () => {
  for (const name of ['', '  ', 'a'.repeat(101)]) assert.equal(validateLitter({ ...valid, name }), 'litters.nameError');
  for (const count of [0, -1, 31, 1.5, NaN]) assert.equal(validateLitter({ ...valid, count }), 'litters.countError');
  assert.equal(validateLitter({ ...valid, notes: 'a'.repeat(2001) }), 'litters.lengthError');
  assert.equal(validateLitter({ ...valid, mother_name: 'a'.repeat(101) }), 'litters.lengthError');
});
test('date-only values keep their day in Swedish formatting', () => {
  assert.equal(formatDate('2024-02-29', 'sv'), '29 februari 2024');
});
