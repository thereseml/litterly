export const otpLength = 8;

export function normalizeOtp(value: string) {
  return value.replace(/\D/g, '').slice(0, otpLength);
}

export function isValidOtp(value: string) {
  return new RegExp(`^\\d{${otpLength}}$`).test(value);
}
