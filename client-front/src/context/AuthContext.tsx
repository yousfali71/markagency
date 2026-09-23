import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/api';
import { clientApi } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; companyName: string; contactPhone?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('client_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('client_access_token');
    // Discard any leftover demo tokens from previous sessions
    if (t && t.startsWith('demo_')) {
      localStorage.removeItem('client_access_token');
      localStorage.removeItem('client_user');
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
      const res = await clientApi.login(email, password);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('client_user', JSON.stringify(res.user));
      localStorage.setItem('client_access_token', res.accessToken);
      localStorage.setItem('client_refresh_token', res.refreshToken);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; companyName: string; contactPhone?: string }) => {
    setLoading(true);
    try {
      const res = await clientApi.registerClient(data);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('client_user', JSON.stringify(res.user));
      localStorage.setItem('client_access_token', res.accessToken);
      localStorage.setItem('client_refresh_token', res.refreshToken);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('client_refresh_token');
    if (refreshToken && !refreshToken.startsWith('demo_')) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://markting-platform.vercel.app'}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('client_user');
    localStorage.removeItem('client_access_token');
    localStorage.removeItem('client_refresh_token');
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, login, register, logout, loading }}>
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
