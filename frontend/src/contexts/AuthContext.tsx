'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiClient, clearStoredAuth, setStoredAuth } from '@/lib/api';

interface User {
  id: number;
  uuid: string;
  email: string;
  name: string;
  is_musician: boolean;
  is_client: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    const storedToken = localStorage.getItem('jwt');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const res = await apiClient('/api/v1/user', {
        headers: { Authorization: storedToken },
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedUser = data.user ?? data;
        setUser(fetchedUser);
        setStoredAuth(storedToken, fetchedUser);
      } else {
        logout();
      }
    } catch (_err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const login = (newToken: string, newUser: User) => {
    setStoredAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
