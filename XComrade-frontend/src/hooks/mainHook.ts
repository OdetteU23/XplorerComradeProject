import { useState } from 'react';
import type { loginInfo, registeringInfo } from '@xcomrade/types-server';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';

/**
 * Authentication hook for login and registration
 * Uses the user context for state management
 */
export const useAuthentication = () => {
  const { login: contextLogin, logout: contextLogout } = useKäyttäjä();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: loginInfo) => {
    setIsLoading(true);
    setError(null);

    try {
      await contextLogin(credentials);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: registeringInfo) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.auth.register(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await contextLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

export default useAuthentication;
