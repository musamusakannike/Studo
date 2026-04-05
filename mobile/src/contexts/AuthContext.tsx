import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storageUtils } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';
import { notificationService } from '../services/notification.service';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const savedToken = storageUtils.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const savedUser = storageUtils.getObject<User>(STORAGE_KEYS.USER_DATA);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        
        try {
          const response = await authService.getProfile();
          if (response.success) {
            setUser(response.data);
            storageUtils.setObject(STORAGE_KEYS.USER_DATA, response.data);
          }
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    storageUtils.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    storageUtils.setObject(STORAGE_KEYS.USER_DATA, newUser);
  };

  const logout = async () => {
    await notificationService.removePushToken();
    setToken(null);
    setUser(null);
    storageUtils.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    storageUtils.removeItem(STORAGE_KEYS.USER_DATA);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storageUtils.setObject(STORAGE_KEYS.USER_DATA, updatedUser);
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
        updateUser,
      }}
    >
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
