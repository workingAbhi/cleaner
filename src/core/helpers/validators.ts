export const Validators = {
  required(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  },

  email(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  phone(phone: string): boolean {
    return /^[0-9]{10}$/.test(phone);
  },

  password(password: string): boolean {
    return password.length >= 8;
  },
};