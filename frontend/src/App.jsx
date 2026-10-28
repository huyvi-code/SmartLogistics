import React, { useEffect } from 'react';
import {
  AuthProvider,
  useAuth,
  getDefaultRouteForRole,
  isPathAllowedForRole,
} from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { LoginWelcomeTransition } from './components/LoginWelcomeTransition';
import { DispatcherPortal } from './components/portals/DispatcherPortal';
import { DriverPortal } from './components/portals/DriverPortal';
import { CustomerPortal } from './components/portals/CustomerPortal';
import { AIChatWidget } from './components/AIChatWidget';


const MainAppContent = () => {
  const { user, loading, showWelcomeTransition, completeWelcomeTransition } = useAuth();

  // Bảo vệ URL & Phân quyền tuyến đường (Route Guard) theo thời gian thực
  useEffect(() => {
    if (loading) return;

    const enforceRouteGuard = () => {
      const currentPath = window.location.pathname;
      const role = user?.vai_tro || null;
      if (!isPathAllowedForRole(currentPath, role)) {
        const redirectUrl = getDefaultRouteForRole(role);
        window.history.replaceState({ role }, '', redirectUrl);
      }
    };

    enforceRouteGuard();
    window.addEventListener('popstate', enforceRouteGuard);
    return () => window.removeEventListener('popstate', enforceRouteGuard);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Đang tải phiên làm việc...</p>
        </div>
      </div>
    );
  }

  // 1. Nếu chưa đăng nhập: Hiển thị trang đăng nhập độc lập (LoginPage) tại /auth/login hoặc /auth/register
  if (!user) {
    return <LoginPage />;
  }

  // 2. Nếu đã đăng nhập: Hiển thị không gian làm việc chuyên biệt theo đúng vai trò & URL tương ứng
  const renderPortal = () => {
    switch (user.vai_tro) {
      case 'QUAN_LY':
        return <DispatcherPortal />;
      case 'TAI_XE':
        return (
          <div className="max-w-7xl w-full mx-auto">
            <DriverPortal />
          </div>
        );
      case 'KHACH_HANG':
        return (
          <div className="max-w-7xl w-full mx-auto">
            <CustomerPortal />
          </div>
        );
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Hiệu ứng chuyển cảnh chiếc xe 3D chạy từ trái qua phải & Chào mừng người dùng khi vừa đăng nhập */}
      {showWelcomeTransition && (
        <LoginWelcomeTransition
          user={user}
          onComplete={completeWelcomeTransition}
        />
      )}

      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 py-6">
        {renderPortal()}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500 transition-colors duration-200">
        © 2026 SmartLogistics TMS • Hệ thống Quản lý Vận tải Giao hàng
      </footer>

      <AIChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
