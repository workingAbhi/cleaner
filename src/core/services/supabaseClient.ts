import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';

import {
  AppConfig,
  isSupabaseConfigured,
} from '../config/appConfig';

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const baseUrl = AppConfig.supabaseUrl.replace(/\/$/, '');
  if (!/^https:\/\//i.test(baseUrl)) {
    console.error('Invalid SUPABASE_URL:', baseUrl);
    return null;
  }

  if (!client) {
    console.log('[SupabaseClient] Initializing client for URL:', baseUrl);
    console.log(
      '[SupabaseClient] Anon key preview:',
      AppConfig.supabaseAnonKey
        ? `${AppConfig.supabaseAnonKey.slice(0, 10)}...${AppConfig.supabaseAnonKey.slice(-10)} (len: ${AppConfig.supabaseAnonKey.length})`
        : 'EMPTY',
    );

    client = createClient(baseUrl, AppConfig.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          apikey: AppConfig.supabaseAnonKey,
        },
      },
      // RN does not need Realtime for this app; avoids fragile URL protocol mutation.
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    });
  }

  return client;
};

export const getAccessToken = async (): Promise<string | null> => {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export const getSession = async (): Promise<Session | null> => {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const invokeFunction = async <T = unknown>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(
    `${AppConfig.supabaseUrl.replace(/\/$/, '')}/functions/v1/${name}`,
    {
      method: 'POST',
      headers: {
        apikey: AppConfig.supabaseAnonKey,
        Authorization: `Bearer ${AppConfig.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { error?: string }).error ||
      `Function ${name} failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
};
