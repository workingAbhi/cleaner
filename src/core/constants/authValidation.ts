/**
 * Single source of truth for Auth Validation Rules & Constants across the Cleaner platform.
 */

export const AuthValidationRules = {
  MIN_PHONE_DIGITS: 10,
  MAX_PHONE_DIGITS: 10,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 8,
} as const;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validatePhoneNumber = (phone: string): ValidationResult => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) {
    return { valid: false, error: 'Phone number is required.' };
  }
  if (
    digits.length < AuthValidationRules.MIN_PHONE_DIGITS ||
    digits.length > AuthValidationRules.MAX_PHONE_DIGITS
  ) {
    return {
      valid: false,
      error: `Phone number must be exactly ${AuthValidationRules.MIN_PHONE_DIGITS} digits.`,
    };
  }
  return { valid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  const str = String(password ?? '');
  if (!str) {
    return { valid: false, error: 'Password is required.' };
  }
  if (str.length < AuthValidationRules.MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${AuthValidationRules.MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (str.length > AuthValidationRules.MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password cannot exceed ${AuthValidationRules.MAX_PASSWORD_LENGTH} characters.`,
    };
  }
  return { valid: true };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return passwordResult;
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true };
};
