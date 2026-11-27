import assert from 'node:assert/strict';
import test from 'node:test';
import { validateWeightMeasurements, weightMeasurementEntries } from '../src/lib/weights';

const drafts = [
  { pet_id: 'pet-1', value: '125' },
  { pet_id: 'pet-2', value: '' },
  { pet_id: 'pet-3', value: ' 130 ' },
];

test('weight batches omit blank offspring and trim supplied whole grams', () => {
  assert.equal(validateWeightMeasurements('2024-03-02', drafts), null);
  assert.deepEqual(weightMeasurementEntries(drafts), [
    { pet_id: 'pet-1', weight_grams: 125 },
    { pet_id: 'pet-3', weight_grams: 130 },
  ]);
});

test('weight batches require at least one supplied measurement', () => {
  assert.equal(validateWeightMeasurements('2024-03-02', [{ pet_id: 'pet-1', value: '  ' }]), 'weights.emptyError');
});

test('weights must be positive safe whole numbers', () => {
  for (const value of ['0', '-1', '1.5', '1e2', '2147483648']) {
    assert.equal(validateWeightMeasurements('2024-03-02', [{ pet_id: 'pet-1', value }]), 'weights.valueError', value);
  }
});

test('shared weight date must be a real date no later than today', () => {
  for (const measuredOn of ['2024-02-30', '0000-01-01', '2024-3-02', '9999-12-31']) {
    assert.equal(validateWeightMeasurements(measuredOn, drafts), 'weights.dateError', measuredOn);
  }
});
