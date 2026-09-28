import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('predicverse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('predicverse_token');
      const savedUser = localStorage.getItem('predicverse_user');
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser(null);
          }
        }
        const serverUser = await api.me(savedToken);
        if (serverUser) {
          setUser(serverUser);
          localStorage.setItem('predicverse_user', JSON.stringify(serverUser));
        } else if (!savedUser) {
          // Token is invalid and no cached user, clear auth state
          setToken(null);
          localStorage.removeItem('predicverse_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('predicverse_token', data.token);
      localStorage.setItem('predicverse_user', JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const data = await api.register(name, email, pass);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('predicverse_token', data.token);
      localStorage.setItem('predicverse_user', JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      setAuthError(err?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    localStorage.removeItem('predicverse_token');
    localStorage.removeItem('predicverse_user');
    localStorage.removeItem('predicverse_wishlist');
    localStorage.removeItem('predicverse_passport');
    localStorage.removeItem('predicverse_trips');
    localStorage.removeItem('predicverse_quizzes');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
