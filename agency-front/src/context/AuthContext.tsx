import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/api';
import { api } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agency_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('agency_access_token');
    // Discard any leftover demo tokens from previous sessions
    if (t && t.startsWith('demo_')) {
      localStorage.removeItem('agency_access_token');
      localStorage.removeItem('agency_user');
      return null;
    }
    return t || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      initSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('agency_user', JSON.stringify(res.user));
      localStorage.setItem('agency_access_token', res.accessToken);
      localStorage.setItem('agency_refresh_token', res.refreshToken);
    } finally {
      setLoading(false);
    }
  };

  const loginWithTokens = (accessToken: string, refreshToken: string, user: User) => {
    setUser(user);
    setToken(accessToken);
    localStorage.setItem('agency_user', JSON.stringify(user));
    localStorage.setItem('agency_access_token', accessToken);
    localStorage.setItem('agency_refresh_token', refreshToken);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('agency_refresh_token');
    if (refreshToken && !refreshToken.startsWith('demo_')) {
      api.login.prototype ? null : null; // noop safety
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://markting-platform.vercel.app'}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('agency_user');
    localStorage.removeItem('agency_access_token');
    localStorage.removeItem('agency_refresh_token');
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, login, loginWithTokens, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
