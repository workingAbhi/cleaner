import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { User } from '../../models';

import { AuthApi } from '../services/api';

import { isSupabaseConfigured } from '../config/appConfig';

import { getSupabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const login = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      try {
        if (!isSupabaseConfigured()) {
          return;
        }

        const restored = await AuthApi.restoreSession();
        if (mounted && restored) {
          setUser(restored);
        }
      } finally {
        if (mounted) {
          setIsRestoring(false);
        }
      }
    };

    restore();

    const supabase = getSupabase();
    const subscription = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const restored = await AuthApi.restoreSession();
            if (restored) {
              setUser(restored);
            }
          } catch {
            // keep existing user state
          }
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isRestoring,
      login,
      logout,
    }),
    [user, isRestoring, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
