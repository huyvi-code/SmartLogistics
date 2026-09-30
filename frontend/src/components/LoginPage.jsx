import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { trackingAPI, systemAPI } from '../api';
import {
  Truck, Shield, User, Lock, Mail, AlertCircle, ArrowRight,
  Sun, Moon, Search, Package, CheckCircle2, Clock, Sparkles,
  Building2, Globe, Check, Eye, EyeOff, ShieldCheck, ChevronDown, ChevronUp,
  RefreshCw, Zap, MapPin, Phone, UserPlus
} from 'lucide-react';
import { AIChatWidget } from './AIChatWidget';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Auth Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

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

  // Public Tracking State
  const [showTracking, setShowTracking] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

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

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const data = await trackingAPI.track(trackingCode.trim());
      setTrackingResult(data);
    } catch (err) {
      setTrackingError(err.response?.data?.detail || 'Không tìm thấy thông tin vận đơn này.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar: Brand & Theme Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">SmartLogistics</span>
              <span className="text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-orange-500 text-slate-950">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hệ thống Quản trị & Điều hành Vận tải Bưu chính Cloud</p>
          </div>
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

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto my-auto py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Enterprise Value Proposition & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                <Globe className="w-3.5 h-3.5" /> Mạng lưới vận tải toàn quốc 24/7
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Giải Pháp Số Hóa Vận Hành Bưu Chính & Logistics
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tối ưu hóa toàn diện chu trình vận tải: từ khởi tạo đơn hàng, tự động nhận diện tuyến trục, điều phối tải trọng đội xe thông minh đến đối soát tài chính COD tự động.
              </p>
            </div>

            {/* Enterprise Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2.5 font-bold">
                  16
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Trục Tuyến Quốc Gia</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Phủ sóng 5 vùng miền, tự động đề xuất lộ trình tối ưu (Auto-Match).
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 font-bold">
                  SLA
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Cam Kết Giao Đúng Hạn</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Định mức thời gian SLA từng chặng, giám sát timeline thời gian thực.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 font-bold">
                  AI
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Trí Tuệ Nhân Tạo Copilot</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Chấm điểm phân công tài xế và ứng cứu xử lý sự cố hiện trường tức thì.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 font-bold">
                  POD
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Ký Nhận & In Tem A6</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Bằng chứng giao hàng điện tử và in nhãn nhiệt A6 có mã vạch barcode.
                </div>
              </div>
            </div>

            {/* Public Tracking Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTracking(!showTracking)}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                {showTracking ? 'Ẩn khung tra cứu công khai' : 'Bạn là người nhận hàng? Tra cứu hành trình bưu phẩm không cần đăng nhập'}
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Login vs Register Customer) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-8 rounded-3xl shadow-xl space-y-6">
              {/* Header with Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {authMode === 'login' ? 'Đăng Nhập Cổng Vận Hành' : 'Đăng Ký Tài Khoản Gửi Hàng'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {authMode === 'login'
                      ? 'Truy cập không gian làm việc chuyên biệt theo vai trò'
                      : 'Tạo tài khoản đối tác để bắt đầu tạo đơn bưu phẩm và quản lý tiền COD'}
                  </p>
                </div>
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

              {/* Security Badge */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Bảo mật kết nối SSL 256-bit • Chứng chỉ an toàn ISO/IEC 27001</span>
              </div>
            </div>

            {/* Quick Access / Demo Accounts Card (Always Accessible) */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  Đăng Nhập Nhanh 1-Chạm (Tài Khoản Mẫu)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 Phân quyền</span>
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    email === 'admin@smartlog.vn' && authMode === 'login'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-orange-500" /> Điều Phối / Quản Lý
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                    {quickLoadingRole === 'admin' ? 'Đang vào...' : '⚡ Vào ngay'}
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    email === 'driver1@smartlog.vn' && authMode === 'login'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-500" /> Tài Xế Giao Nhận
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">driver1@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    {quickLoadingRole === 'driver' ? 'Đang vào...' : '⚡ Vào ngay'}
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    email === 'customer@smartlog.vn' && authMode === 'login'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" /> Khách Hàng
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">customer@smartlog.vn</div>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    {quickLoadingRole === 'customer' ? 'Đang vào...' : '⚡ Vào ngay'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Public Tracking Section (Toggled) */}
        {showTracking && (
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-500" /> Tra Cứu Hành Trình Bưu Phẩm Quốc Gia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nhập mã vận đơn dạng VN2026-xxxx hoặc 4 chữ số cuối để kiểm tra thời gian thực
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                placeholder="VD: VN2026-4821 hoặc 4821"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {trackingLoading ? 'Đang tìm...' : 'Tra Cứu'}
              </button>
            </form>

            {trackingError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs">
                {trackingError}
              </div>
            )}

            {trackingResult && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">
                    {trackingResult.ma_van_don}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    {trackingResult.trang_thai}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Điểm nhận:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {trackingResult.nguoi_nhan_tinh_thanh}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tài xế giao:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {trackingResult.tai_xe?.ho_ten || 'Đang điều phối'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
