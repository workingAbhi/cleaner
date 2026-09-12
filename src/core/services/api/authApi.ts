import {
  AdminRegisterRequest,
  User,
  UserRegisterRequest,
  UserRole,
} from '../../../models';

import { UserStore } from '../../../data/auth/users.mock';

import {
  AppConfig,
  isSupabaseConfigured,
  normalizePhone,
  phoneToAuthEmail,
} from '../../config/appConfig';

import {
  getSupabase,
  invokeFunction,
} from '../supabaseClient';

type ProfileRow = {
  id: string;
  phone_number: string;
  name: string;
  role: string;
  ro_number: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

const profileToUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  phoneNumber: row.phone_number,
  role: row.role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER,
  roNumber: row.ro_number ?? undefined,
  active: row.active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const loadProfile = async (userId: string): Promise<User> => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Profile not found.');
  }

  return profileToUser(data as ProfileRow);
};

class AuthApi {
  async login(phoneNumber: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 500);
      });

      const found = UserStore.findByCredentials(phoneNumber, password);

      if (!found) {
        throw new Error('Invalid phone number or password');
      }

      const { password: _password, ...user } = found;
      return user as User;
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const email = phoneToAuthEmail(normalizePhone(phoneNumber));
    console.log('[AuthApi.login] Attempting login with email:', email);

    // Direct fetch test to debug exact response body and headers from GoTrue
    try {
      const directRes = await fetch(
        `${AppConfig.supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            apikey: AppConfig.supabaseAnonKey,
            Authorization: `Bearer ${AppConfig.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );
      const directJson = await directRes.json();
      console.log('[AuthApi.login] Direct GoTrue raw response:', {
        status: directRes.status,
        headers: Object.fromEntries(directRes.headers.entries()),
        body: directJson,
      });
    } catch (testErr) {
      console.log('[AuthApi.login] Direct fetch error:', testErr);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('[AuthApi.login] signInWithPassword error:', error);
      throw new Error(error?.message || 'Invalid phone number or password');
    }

    return loadProfile(data.user.id);
  }

  async registerUser(request: UserRegisterRequest): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 500);
      });

      const existing = UserStore.findByPhone(request.phoneNumber);

      if (existing) {
        throw new Error('Phone number already registered.');
      }

      UserStore.add({
        id: Date.now().toString(),
        phoneNumber: request.phoneNumber,
        password: request.password,
        roNumber: request.roNumber,
        role: UserRole.USER,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: '',
      });

      return;
    }

    await invokeFunction('register', {
      role: 'USER',
      phoneNumber: normalizePhone(request.phoneNumber),
      password: request.password,
      roNumber: request.roNumber,
      name: request.name ?? '',
    });
  }

  async registerAdmin(request: AdminRegisterRequest): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 500);
      });

      const existing = UserStore.findByPhone(request.phoneNumber);

      if (existing) {
        throw new Error('Phone number already registered.');
      }

      UserStore.add({
        id: Date.now().toString(),
        name: request.name,
        phoneNumber: request.phoneNumber,
        password: request.password,
        role: UserRole.ADMIN,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return;
    }

    await invokeFunction('register', {
      role: 'ADMIN',
      phoneNumber: normalizePhone(request.phoneNumber),
      password: request.password,
      name: request.name,
    });
  }

  async restoreSession(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = getSupabase();
    if (!supabase) {
      return null;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      return null;
    }

    return loadProfile(data.session.user.id);
  }

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }
}

export default new AuthApi();
