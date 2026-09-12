import Config from 'react-native-config';

const read = (key: string, fallback = ''): string => {
  const value = Config[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

export const AppConfig = {
  imageEditWindowHours: Number(read('IMAGE_EDIT_WINDOW_HOURS', '2')) || 2,

  /**
   * Leave both empty in .env to keep using AsyncStorage + mock auth.
   * See supabase/SETUP.md
   */
  supabaseUrl: read('SUPABASE_URL'),

  supabaseAnonKey: read('SUPABASE_ANON_KEY'),

  /** Display / sync only — source of truth is Supabase app_settings after push-config. */
  masterOwnerPhone: read('MASTER_OWNER_PHONE', '9999999999'),
};

export const isSupabaseConfigured = () =>
  AppConfig.supabaseUrl.trim().length > 0 &&
  AppConfig.supabaseAnonKey.trim().length > 0;

export const phoneToAuthEmail = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  return `${digits}@phone.cleaner.app`;
};

export const normalizePhone = (phoneNumber: string): string =>
  phoneNumber.replace(/\D/g, '');
