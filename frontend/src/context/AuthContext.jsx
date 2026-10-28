import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const getDefaultRouteForRole = (role) => {
  switch (role) {
    case 'QUAN_LY':
      return '/dispatcher/orders';
    case 'TAI_XE':
      return '/driver/deliveries';
    case 'KHACH_HANG':
      return '/customer/orders';
    default:
      return '/auth/login';
  }
};

export const isPathAllowedForRole = (pathname, role) => {
  if (!role) {
    return pathname === '/auth/login' || pathname === '/auth/register';
  }
  switch (role) {
    case 'QUAN_LY':
      return /^\/dispatcher\/(orders|fleet|routes|cod|incidents)\/?$/i.test(pathname);
    case 'TAI_XE':
      return /^\/driver\/deliveries\/?$/i.test(pathname);
    case 'KHACH_HANG':
      return /^\/customer\/orders\/?$/i.test(pathname);
    default:
      return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartlog_token'));
  const [loading, setLoading] = useState(true);
  const [showWelcomeTransition, setShowWelcomeTransition] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = localStorage.getItem('smartlog_token');
      if (savedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          if (!isPathAllowedForRole(window.location.pathname, userData.vai_tro)) {
            const targetUrl = getDefaultRouteForRole(userData.vai_tro);
            window.history.replaceState({ role: userData.vai_tro }, '', targetUrl);
          }
        } catch (err) {
          console.error('Lỗi lấy thông tin phiên:', err);
          logout();
        }
      } else {
        if (!isPathAllowedForRole(window.location.pathname, null)) {
          window.history.replaceState(null, '', '/auth/login');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('smartlog_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    const targetUrl = getDefaultRouteForRole(data.user?.vai_tro);
    window.history.replaceState({ role: data.user?.vai_tro }, '', targetUrl);
    setShowWelcomeTransition(true);
    return data.user;
  };

  const register = async (userData) => {
    await authAPI.register(userData);
    // Auto login after successful registration
    return await login(userData.email, userData.password);
  };

  const quickLoginAs = async (role) => {
    let email = 'admin@smartlog.vn';
    let pass = 'admin123';
    if (role === 'TAI_XE') {
      email = 'driver1@smartlog.vn';
      pass = 'driver123';
    } else if (role === 'KHACH_HANG') {
      email = 'customer@smartlog.vn';
      pass = 'customer123';
    }
    return await login(email, pass);
  };

  const logout = () => {
    localStorage.removeItem('smartlog_token');
    setToken(null);
    setUser(null);
    setShowWelcomeTransition(false);
    if (window.location.pathname !== '/auth/login') {
      window.history.replaceState(null, '', '/auth/login');
    }
  };

  const completeWelcomeTransition = () => {
    setShowWelcomeTransition(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        quickLoginAs,
        logout,
        showWelcomeTransition,
        completeWelcomeTransition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
