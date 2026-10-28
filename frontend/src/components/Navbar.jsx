import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Truck, Shield, User, LogOut, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'QUAN_LY':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Điều phối / Quản lý
          </span>
        );
      case 'TAI_XE':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Tài xế giao nhận
          </span>
        );
      case 'KHACH_HANG':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Khách hàng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 transition-colors duration-200 shadow-xs">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Inline Command Center Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-md transition-colors duration-200 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-wide">
              SmartLogistics
            </span>
          </div>

          {user?.vai_tro === 'QUAN_LY' && (
            <h1 className="hidden lg:block text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
              Trung Tâm Chỉ Huy &amp; Điều Hành Vận Tải Toàn Quốc
            </h1>
          )}
        </div>

        {/* Right Actions: Theme Toggle + User Info + Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
            title={`Chuyển sang giao diện ${theme === 'dark' ? 'Sáng' : 'Tối'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.ho_ten}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
              </div>

              {getRoleBadge(user.vai_tro)}

              <button
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
