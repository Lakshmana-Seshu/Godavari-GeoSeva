import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('geoseva_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('geoseva_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('geoseva_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          const authUser = res?.user || res?.data?.user;
          if (authUser) {
            setUser(authUser);
            localStorage.setItem('geoseva_user', JSON.stringify(authUser));
          } else {
            throw new Error('User not found in session');
          }
        } catch (err) {
          console.warn('Session verification failed, logging out locally');
          setUser(null);
          setToken(null);
          localStorage.removeItem('geoseva_token');
          localStorage.removeItem('geoseva_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: (email || '').trim().toLowerCase(),
        password: (password || '').trim()
      });
      const authUser = res?.user || res?.data?.user;
      const authToken = res?.token || res?.data?.token;

      if (!authUser || !authToken) {
        throw new Error(res?.message || 'Login failed. Missing authentication payload.');
      }

      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('geoseva_token', authToken);
      localStorage.setItem('geoseva_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials or ensure the server is running.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(userData);
      const authUser = res?.user || res?.data?.user;
      const authToken = res?.token || res?.data?.token;
      if (authUser && authToken) {
        setUser(authUser);
        setToken(authToken);
        localStorage.setItem('geoseva_token', authToken);
        localStorage.setItem('geoseva_user', JSON.stringify(authUser));
      }
      return { success: true, data: res };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('geoseva_token');
      localStorage.removeItem('geoseva_user');
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isVolunteer = user?.role === 'VOLUNTEER';
  const canManage = isAdmin || isVolunteer;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isVolunteer,
        canManage,
        isLoading,
        login,
        register,
        logout,
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
