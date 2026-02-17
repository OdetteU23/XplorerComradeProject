import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { loginInfo, registeringInfo, userProfile } from '@xcomrade/types-server';
import type { UserContextType } from '../../utilHelpers/types/localTypes';
import { api } from '../../utilHelpers/FetchingData';

const KäyttäjänKontentti = createContext<UserContextType | null>(null);

export const useKäyttäjä = () => {
  const context = useContext(KäyttäjänKontentti);
  if (!context) {
    throw new Error('useKäyttäjä must be used within PääKäyttäjäProvider');
  }
  return context;
};

interface PääKäyttäjäProviderProps {
  children: ReactNode;
}

export const PääKäyttäjäProvider = ({ children }: PääKäyttäjäProviderProps) => {
  const [user, setUser] = useState<userProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Try to get current user with stored token
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Token invalid or expired, clear it
        console.error('Auth check failed:', err);
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: loginInfo) => {
    try {
      const response = await api.auth.login(credentials);
      // Token is automatically stored by the API client
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login failed:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  const register = async (data: registeringInfo) => {
    try {
      await api.auth.register(data);
      // After registration, user needs to log in
      // Or you can auto-login here
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updates: Partial<userProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <KäyttäjänKontentti.Provider value={value}>
      {children}
    </KäyttäjänKontentti.Provider>
  );
};

export default KäyttäjänKontentti;
