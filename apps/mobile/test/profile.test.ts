import assert from 'node:assert/strict';
import test from 'node:test';
import { profileInput } from '../src/lib/profile';

test('kennel name is trimmed and blank optional value is cleared', () => {
  assert.deepEqual(profileInput('  Solsken  '), { kennel_name: 'Solsken' });
  assert.deepEqual(profileInput(''), { kennel_name: null });
});

test('kennel name accepts 100 characters and rejects longer values', () => {
  assert.equal(profileInput('a'.repeat(100))?.kennel_name, 'a'.repeat(100));
  assert.equal(profileInput('a'.repeat(101)), null);
});
