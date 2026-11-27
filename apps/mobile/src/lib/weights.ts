export type WeightDraft = { pet_id: string; value: string };
export type WeightMeasurementInput = { pet_id: string; weight_grams: number };

export function validateWeightMeasurements(measuredOn: string, drafts: WeightDraft[]): string | null {
  const date = new Date(`${measuredOn}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(measuredOn) || measuredOn.startsWith('0000') || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== measuredOn || measuredOn > new Date().toISOString().slice(0, 10)) {
    return 'weights.dateError';
  }
  const supplied = drafts.filter(({ value }) => value.trim() !== '');
  if (supplied.length === 0) return 'weights.emptyError';
  if (supplied.some(({ value }) => !/^\d+$/.test(value.trim()) || Number(value.trim()) <= 0 || Number(value.trim()) > 2147483647)) {
    return 'weights.valueError';
  }
  return null;
}

export function weightMeasurementEntries(drafts: WeightDraft[]): WeightMeasurementInput[] {
  return drafts.flatMap(({ pet_id, value }) => value.trim() === ''
    ? []
    : [{ pet_id, weight_grams: Number(value.trim()) }]);
}
