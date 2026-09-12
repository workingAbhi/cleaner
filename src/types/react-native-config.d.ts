declare module 'react-native-config' {
  export interface NativeConfig {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    IMAGE_EDIT_WINDOW_HOURS?: string;
    MASTER_OWNER_PHONE?: string;
    [key: string]: string | undefined;
  }

  export const Config: NativeConfig;
  export default Config;
}
