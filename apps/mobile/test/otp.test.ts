import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidOtp, normalizeOtp, otpLength } from '../src/lib/otp';

test('the email code input accepts exactly eight digits', () => {
  assert.equal(otpLength, 8);
  assert.equal(isValidOtp('12345678'), true);
  assert.equal(isValidOtp('123456'), false);
  assert.equal(isValidOtp('123456789'), false);
  assert.equal(isValidOtp('1234abcd'), false);
});

test('code input strips separators and caps pasted values at eight digits', () => {
  assert.equal(normalizeOtp('12 34-56 78'), '12345678');
  assert.equal(normalizeOtp('1234567890'), '12345678');
});
