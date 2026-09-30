import React, { useState } from 'react';
import { trackingAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Truck, Shield, User, Search, Package, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, Lock, KeyRound
} from 'lucide-react';

export const GuestPortal = ({ onOpenLogin }) => {
  const { quickLoginAs } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      const data = await trackingAPI.track(trackingCode.trim());
      setTrackingResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không tìm thấy thông tin vận đơn này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Truck className="w-4 h-4" /> Hệ thống Vận tải Giao hàng Thông minh (SmartLogistics TMS)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hệ Thống Phân Quyền Vận Tải 3 Vai Trò
        </h1>
        <p className="text-sm text-slate-400">
          Dữ liệu và quyền thao tác được tách biệt nghiêm ngặt theo đúng vai trò thực tế: Quản lý / Điều phối, Tài xế giao nhận và Khách hàng.
        </p>
      </div>

      {/* Role Selection Cards to Login */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {/* Role 1: Quản lý */}
        <div className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 p-6 rounded-3xl space-y-4 transition flex flex-col justify-between group shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Quản Lý / Điều Phối</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Toàn quyền giám sát toàn bộ đơn hàng trong hệ thống, chỉ định tài xế, tuyến đường, theo dõi doanh thu và xử lý sự cố.
            </p>
            <div className="mt-4 p-2.5 rounded-xl bg-slate-800/60 text-[11px] font-mono text-slate-300">
              admin@smartlog.vn / admin123
            </div>
          </div>
          <button
            onClick={() => quickLoginAs('QUAN_LY')}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            Đăng nhập Quản Lý <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Role 2: Tài xế */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-6 rounded-3xl space-y-4 transition flex flex-col justify-between group shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Tài Xế Giao Nhận</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Chỉ xem và thao tác các đơn hàng được gán cho chính mình. Cập nhật trạng thái: Đã lấy hàng, Đang giao, Thành công hoặc Báo sự cố.
            </p>
            <div className="mt-4 p-2.5 rounded-xl bg-slate-800/60 text-[11px] font-mono text-slate-300">
              driver1@smartlog.vn / driver123
            </div>
          </div>
          <button
            onClick={() => quickLoginAs('TAI_XE')}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            Đăng nhập Tài Xế <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Role 3: Khách hàng */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-3xl space-y-4 transition flex flex-col justify-between group shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Khách Hàng Gửi Hàng</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tạo đơn giao hàng mới (tính cước tự động), quản lý các đơn hàng của riêng mình và tra cứu hành trình vận đơn.
            </p>
            <div className="mt-4 p-2.5 rounded-xl bg-slate-800/60 text-[11px] font-mono text-slate-300">
              customer@smartlog.vn / customer123
            </div>
          </div>
          <button
            onClick={() => quickLoginAs('KHACH_HANG')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            Đăng nhập Khách Hàng <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Public Tracking Box for Guests */}
      <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-orange-400" /> Tra Cứu Vận Đơn Nhanh Không Cần Đăng Nhập
        </h3>
        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã vận đơn (VD: VN2026-8801, VN2026-8804)..."
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>

        {error && <div className="text-xs text-red-400">{error}</div>}

        {trackingResult && (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-orange-400">{trackingResult.ma_van_don}</span>
              <span className="text-emerald-400">{trackingResult.trang_thai}</span>
            </div>
            <div className="text-slate-300">
              Giao đến: {trackingResult.nguoi_nhan_dia_chi}, {trackingResult.nguoi_nhan_tinh_thanh}
            </div>
            <div className="text-slate-400">
              Người nhận: {trackingResult.nguoi_nhan_ten} - SĐT: {trackingResult.nguoi_nhan_sdt}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
