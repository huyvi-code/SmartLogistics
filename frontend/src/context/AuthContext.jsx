import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartlog_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = localStorage.getItem('smartlog_token');
      if (savedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Lỗi lấy thông tin phiên:', err);
          logout();
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
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, quickLoginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
