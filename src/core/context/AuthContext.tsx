import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import { User } from '../../models';

interface AuthContextType {
  user: User | null;

  isAuthenticated: boolean;

  login: (user: User) => void;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export const AuthProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [user, setUser] =
    useState<User | null>(null);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,

      isAuthenticated: !!user,

      login,

      logout,
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);