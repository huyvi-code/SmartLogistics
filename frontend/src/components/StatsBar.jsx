import React, { useEffect, useState } from 'react';
import { ordersAPI, driversAPI, routesAPI, incidentsAPI } from '../api';
import {
  Package, CheckCircle2, TrendingUp, Clock, AlertTriangle,
  Truck, MapPin, DollarSign, UserCheck, PauseCircle
} from 'lucide-react';

export const StatsBar = ({ activeTab = 'orders', refreshTrigger }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [orderData, driverData, routeData, incidentData] = await Promise.all([
        ordersAPI.getAll().catch(() => []),
        driversAPI.getAll().catch(() => []),
        routesAPI.getAll().catch(() => []),
        incidentsAPI.getAll().catch(() => []),
      ]);
      setOrders(orderData || []);
      setDrivers(driverData || []);
      setRoutes(routeData || []);
      setIncidents(incidentData || []);
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, [refreshTrigger, activeTab]);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // 1. Thống kê cho mục QUẢN LÝ VẬN ĐƠN (theo 6 bộ lọc: Tất cả, Mới, Đã lấy, Đang giao, Thành công, Sự cố)
  if (activeTab === 'orders') {
    const total = orders.length;
    const moiCount = orders.filter((o) => o.trang_thai === 'MOI').length;
    const daLayCount = orders.filter((o) => o.trang_thai === 'DA_LAY_HANG').length;
    const dangGiaoCount = orders.filter((o) => o.trang_thai === 'DANG_GIAO').length;
    const thanhCongCount = orders.filter((o) => o.trang_thai === 'GIAO_THANH_CONG').length;
    const suCoCount = orders.filter((o) => o.trang_thai === 'THAT_BAI').length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tất Cả Vận Đơn</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : total}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mới Tiếp Nhận</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
            {loading ? '...' : moiCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã Lấy Hàng</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {loading ? '...' : daLayCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang Giao Hàng</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {loading ? '...' : dangGiaoCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Giao Thành Công</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : thanhCongCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sự Cố / Thất Bại</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {loading ? '...' : suCoCount}
          </div>
        </div>
      </div>
    );
  }

  // 2. Thống kê cho mục GIÁM SÁT ĐỘI XE (theo 4 bộ lọc: Tất cả, Sẵn sàng, Đang giao, Nghỉ ca)
  if (activeTab === 'fleet') {
    const totalDrivers = drivers.length;
    const readyCount = drivers.filter((d) => d.trang_thai_hoat_dong === 'SAN_SANG').length;
    const deliveringCount = drivers.filter((d) => d.trang_thai_hoat_dong === 'DANG_GIAO').length;
    const offDutyCount = drivers.filter((d) => d.trang_thai_hoat_dong === 'NGHI').length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tất Cả Tài Xế &amp; Xe</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : totalDrivers}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sẵn Sàng</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : readyCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang Giao</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {loading ? '...' : deliveringCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nghỉ Ca</span>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-500 dark:text-slate-400">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-2">
            {loading ? '...' : offDutyCount}
          </div>
        </div>
      </div>
    );
  }

  // 3. Thống kê cho mục TUYẾN & BIỂU CƯỚC (theo 6 bộ lọc vùng miền)
  if (activeTab === 'routes') {
    const totalRoutes = routes.length;
    const hnCount = routes.filter((r) => r.khu_vuc === 'NOI_THANH_HN').length;
    const mbCount = routes.filter((r) => r.khu_vuc === 'MIEN_BAC').length;
    const bnCount = routes.filter((r) => r.khu_vuc === 'BAC_NAM').length;
    const mtCount = routes.filter((r) => r.khu_vuc === 'MIEN_TRUNG').length;
    const mnCount = routes.filter((r) => r.khu_vuc === 'MIEN_NAM').length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toàn Bộ 5 Miền</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : totalRoutes}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hà Nội &amp; Nội Thành</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
            {loading ? '...' : hnCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Liên Tỉnh Miền Bắc</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {loading ? '...' : mbCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trục Bắc – Nam</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {loading ? '...' : bnCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Liên Tỉnh Miền Trung</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {loading ? '...' : mtCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">TP.HCM &amp; Miền Nam</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : mnCount}
          </div>
        </div>
      </div>
    );
  }

  // 4. Thống kê cho mục ĐỐI SOÁT COD (theo bộ lọc: Tất cả, Chờ đối soát, Đã quyết toán + Doanh thu cước)
  if (activeTab === 'cod') {
    const codOrders = orders.filter((o) => o.tien_thu_ho_cod > 0 || o.thanh_toan);
    const totalCodCount = codOrders.length;
    const paidOrders = codOrders.filter((o) => o.thanh_toan?.trang_thai === 'DA_THANH_TOAN');
    const pendingOrders = codOrders.filter((o) => o.thanh_toan?.trang_thai !== 'DA_THANH_TOAN');
    const totalShippingFee = orders.reduce((acc, o) => acc + (o.cuoc_phi_van_chuyen || 0), 0);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tất Cả Đơn Đối Soát</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : `${totalCodCount} đơn`}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chờ Đối Soát</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {loading ? '...' : `${pendingOrders.length} đơn`}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã Quyết Toán</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : `${paidOrders.length} đơn`}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Doanh Thu Cước</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 truncate">
            {loading ? '...' : formatVND(totalShippingFee)}
          </div>
        </div>
      </div>
    );
  }

  // 5. Thống kê cho mục TRUNG TÂM SỰ CỐ (theo 3 bộ lọc: Tất cả, Cần xử lý ngay, Đã giải quyết)
  if (activeTab === 'incidents') {
    const totalInc = incidents.length;
    const pendingInc = incidents.filter((i) => i.trang_thai === 'CHUA_XU_LY').length;
    const resolvedInc = incidents.filter((i) => i.trang_thai === 'DA_XU_LY').length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tất Cả Sự Cố</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {loading ? '...' : totalInc}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cần Xử Lý Ngay</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {loading ? '...' : pendingInc}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã Giải Quyết</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {loading ? '...' : resolvedInc}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
