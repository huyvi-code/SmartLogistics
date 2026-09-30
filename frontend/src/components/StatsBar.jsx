import React, { useEffect, useState } from 'react';
import { statsAPI } from '../api';
import { Package, CheckCircle2, TrendingUp, Clock, AlertTriangle, Truck } from 'lucide-react';

export const StatsBar = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getOverview();
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Tổng đơn */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Đơn Hàng</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {loading ? '...' : stats?.tong_so_don || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Toàn bộ hệ thống</div>
      </div>

      {/* 2. Tỷ lệ thành công */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tỷ Lệ Thành Công</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
          {loading ? '...' : `${stats?.ty_le_giao_thanh_cong || 0}%`}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {stats?.don_giao_thanh_cong || 0} đơn thành công
        </div>
      </div>

      {/* 3. Doanh thu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Cước Vận Chuyển</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold text-amber-600 dark:text-amber-300 mt-2 truncate">
          {loading ? '...' : formatVND(stats?.tong_doanh_thu)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Doanh thu cước</div>
      </div>

      {/* 4. Đơn mới / Chờ giao */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chờ Lấy / Điều Phối</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
          {loading ? '...' : stats?.don_moi_cho_giao || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cần gán tài xế</div>
      </div>

      {/* 5. Đang giao */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang Vận Chuyển</span>
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
          {loading ? '...' : stats?.don_dang_giao || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Đang trên đường</div>
      </div>

      {/* 6. Thất bại / Sự cố */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sự Cố Cần Xử Lý</span>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
          {loading ? '...' : stats?.su_co_chua_xu_ly || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {stats?.don_that_bai || 0} đơn gặp sự cố
        </div>
      </div>
    </div>
  );
};
