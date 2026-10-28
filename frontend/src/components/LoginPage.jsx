import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { systemAPI } from '../api';
import {
  Truck, User, Lock, Mail, AlertCircle, ArrowRight,
  Sun, Moon, CheckCircle2, Eye, EyeOff,
  RefreshCw, MapPin, Phone, UserPlus
} from 'lucide-react';
import { AIChatWidget } from './AIChatWidget';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Auth Mode: 'login' | 'register' (đồng bộ với URL /auth/login và /auth/register)
  const [authMode, setAuthMode] = useState(() =>
    window.location.pathname === '/auth/register' ? 'register' : 'login'
  );

  useEffect(() => {
    const targetPath = authMode === 'register' ? '/auth/register' : '/auth/login';
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [authMode]);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoadingRole, setQuickLoadingRole] = useState(null);

  // Register form states (for Customers/Shippers)
  const [regHoTen, setRegHoTen] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProvince, setRegProvince] = useState('Hà Nội');
  const [regAddress, setRegAddress] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState(null); // null: checking, true: ok, false: offline

  // Check backend health
  const checkHealth = async () => {
    try {
      await systemAPI.checkHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleLoginError = (err) => {
    console.error('Lỗi xác thực:', err);
    if (!err.response || err.code === 'ERR_NETWORK') {
      setBackendOnline(false);
      setError('Không thể kết nối đến máy chủ Backend (http://localhost:8000).');
      setErrorDetail('Vui lòng kiểm tra xem bạn đã khởi động Backend FastAPI chưa (cd backend -> uvicorn main:app --reload --port 8000).');
    } else if (err.response?.status === 401) {
      setError(err.response?.data?.detail || 'Email hoặc mật khẩu không chính xác.');
      setErrorDetail('Vui lòng kiểm tra lại thông tin hoặc sử dụng tài khoản mẫu bên dưới.');
    } else {
      setError(err.response?.data?.detail || 'Thao tác không thành công. Vui lòng thử lại.');
      setErrorDetail('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetail('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetail('');
    setRegSuccess('');

    if (!regHoTen.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim() || !regAddress.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setRegLoading(true);
    try {
      await register({
        ho_ten: regHoTen.trim(),
        so_dien_thoai: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        dia_chi: regAddress.trim(),
        tinh_thanh: regProvince,
        vai_tro: 'KHACH_HANG',
      });
      setRegSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng vào Cổng Khách Hàng...');
    } catch (err) {
      handleLoginError(err);
    } finally {
      setRegLoading(false);
    }
  };

  // 1-Click login helper
  const handleQuickLogin = async (accEmail, accPass, roleKey) => {
    setError('');
    setErrorDetail('');
    setEmail(accEmail);
    setPassword(accPass);
    setQuickLoadingRole(roleKey);
    try {
      await login(accEmail, accPass);
    } catch (err) {
      handleLoginError(err);
    } finally {
      setQuickLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar: Brand & Theme Switcher */}
      <header className="w-full flex items-center justify-between py-2">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-md transition-colors duration-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-wide">
            SmartLogistics
          </span>
        </div>

        {/* Status & Theme Toggle Button */}
        <div className="flex items-center gap-2">
          {backendOnline === false && (
            <button
              onClick={checkHealth}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer animate-pulse"
              title="Bấm để kiểm tra lại kết nối Backend"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Backend Offline</span>
              <RefreshCw className="w-3 h-3 ml-0.5" />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 shadow-sm transition flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title={`Chuyển sang giao diện ${theme === 'dark' ? 'Sáng' : 'Tối'}`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Chế độ Sáng</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Chế độ Tối</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center py-6">
        {/* Backend Connection Warning if Offline */}
        {backendOnline === false && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/40 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">Chưa phát hiện máy chủ Backend FastAPI đang chạy!</div>
              <p>
                Nếu bạn không thể đăng nhập hoặc đăng ký, hãy chắc chắn rằng Backend đang chạy trên cổng <strong>8000</strong>. Chạy lệnh sau trong terminal:
              </p>
              <code className="inline-block bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg font-mono text-[11px] mt-1">
                cd backend &amp;&amp; uvicorn main:app --reload --port 8000
              </code>
            </div>
          </div>
        )}

        {/* Centered Dynamic Form (Login vs Register Customer) */}
        <div className="w-full space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-8 rounded-3xl shadow-xl space-y-6">
            {/* Header with Switcher Tabs */}
              <div className="flex items-center justify-center border-b border-slate-100 dark:border-slate-800 pb-3 text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản Gửi Hàng'}
                </h2>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {errorDetail && (
                    <p className="text-[11px] text-red-500 dark:text-red-300 pl-6 leading-relaxed">
                      {errorDetail}
                    </p>
                  )}
                </div>
              )}

              {regSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* 1. LOGIN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Công Vụ / Tài Khoản Hệ Thống
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="admin@smartlog.vn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Mật Khẩu Truy Cập
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Demo: <code className="font-mono text-orange-600 dark:text-orange-400">admin123</code>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400">Ghi nhớ đăng nhập trên thiết bị này</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || quickLoadingRole !== null}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      'Đang xác thực thông tin...'
                    ) : (
                      <>
                        <span>Đăng Nhập Cổng Vận Hành</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Register */}
                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chưa có tài khoản gửi hàng?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setError('');
                          setErrorDetail('');
                        }}
                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                      >
                        Đăng ký tài khoản doanh nghiệp ngay →
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* 2. REGISTER CUSTOMER FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên Doanh Nghiệp / Chủ Hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="VD: Công ty TNHH May Mặc An Phú"
                        value={regHoTen}
                        onChange={(e) => setRegHoTen(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Số Điện Thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="0912345678"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Đăng Nhập <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="shop@domain.vn"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mật Khẩu Khởi Tạo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tỉnh / Thành Phố Kho Gửi
                      </label>
                      <select
                        value={regProvince}
                        onChange={(e) => setRegProvince(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Bắc Ninh">Bắc Ninh</option>
                        <option value="Bình Dương">Bình Dương</option>
                        <option value="Đồng Nai">Đồng Nai</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Địa Chỉ Kho Lấy Hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, phố, quận/huyện"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {regLoading ? (
                      'Đang tạo tài khoản...'
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Đăng Ký &amp; Bắt Đầu Gửi Hàng</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Login */}
                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Đã có tài khoản doanh nghiệp?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setError('');
                          setErrorDetail('');
                        }}
                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                      >
                        ← Quay lại Đăng nhập
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Access / Demo Accounts Card (Always Accessible) */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Đăng nhập nhanh 1 chạm - Demo
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Admin */}
                <button
                  type="button"
                  disabled={quickLoadingRole !== null || loading}
                  onClick={() => {
                    setAuthMode('login');
                    handleQuickLogin('admin@smartlog.vn', 'admin123', 'admin');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${email === 'admin@smartlog.vn' && authMode === 'login'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400'
                    }`}
                >
                  <div>
                    <div className="font-semibold">Điều Phối / Quản Lý</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                    {quickLoadingRole === 'admin' ? 'Đang vào...' : 'Vào ngay'}
                  </div>
                </button>

                {/* 2. Driver */}
                <button
                  type="button"
                  disabled={quickLoadingRole !== null || loading}
                  onClick={() => {
                    setAuthMode('login');
                    handleQuickLogin('driver1@smartlog.vn', 'driver123', 'driver');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${email === 'driver1@smartlog.vn' && authMode === 'login'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                    }`}
                >
                  <div>
                    <div className="font-semibold">Tài Xế Giao Nhận</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">driver1@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    {quickLoadingRole === 'driver' ? 'Đang vào...' : 'Vào ngay'}
                  </div>
                </button>

                {/* 3. Customer */}
                <button
                  type="button"
                  disabled={quickLoadingRole !== null || loading}
                  onClick={() => {
                    setAuthMode('login');
                    handleQuickLogin('customer@smartlog.vn', 'customer123', 'customer');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${email === 'customer@smartlog.vn' && authMode === 'login'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                    }`}
                >
                  <div>
                    <div className="font-semibold">Khách Hàng</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">customer@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {quickLoadingRole === 'customer' ? 'Đang vào...' : 'Vào ngay'}
                  </div>
                </button>
              </div>
            </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        © 2026 SmartLogistics Enterprise TMS • Nền tảng Quản trị Vận tải &amp; Bưu chính Thế hệ Mới
      </footer>

      {/* AI Assistant Chat Widget */}
      <AIChatWidget />
    </div>
  );
};
