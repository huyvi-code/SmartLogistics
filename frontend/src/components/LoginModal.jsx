import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Truck, User, X, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role) => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs(role);
      onClose();
    } catch (err) {
      setError('Đăng nhập nhanh thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-500 mb-2 border border-orange-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Đăng Nhập Hệ Thống</h2>
          <p className="text-xs text-slate-400 mt-1">Hệ thống Quản lý Vận tải Giao hàng SmartLogistics</p>
        </div>

        {/* Quick Demo Logins */}
        <div className="mb-6 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Đăng nhập nhanh bằng 1-Click (Demo 3 vai trò):
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('QUAN_LY')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-orange-500/20 border border-slate-700 hover:border-orange-500/40 text-left transition group"
            >
              <Shield className="w-4 h-4 text-orange-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200 group-hover:text-orange-300">Quản Lý</div>
              <div className="text-[10px] text-slate-500 truncate">admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('TAI_XE')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 border border-slate-700 hover:border-blue-500/40 text-left transition group"
            >
              <Truck className="w-4 h-4 text-blue-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">Tài Xế</div>
              <div className="text-[10px] text-slate-500 truncate">driver123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('KHACH_HANG')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-left transition group"
            >
              <User className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">Khách Hàng</div>
              <div className="text-[10px] text-slate-500 truncate">customer123</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@smartlog.vn"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};
