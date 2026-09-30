import React, { useState, useEffect } from 'react';
import { driversAPI, ordersAPI } from '../api';
import {
  Truck, ShieldCheck, Phone, CheckCircle2, Clock, AlertCircle,
  RefreshCw, Scale, Star, UserCheck, Search, Filter, Plus
} from 'lucide-react';
import { CreateDriverModal } from './CreateDriverModal';

export const FleetManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driverList, orderList] = await Promise.all([
        driversAPI.getAll(),
        ordersAPI.getAll()
      ]);
      setDrivers(driverList);
      setOrders(orderList);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu đội xe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (driverId, newStatus) => {
    try {
      await driversAPI.updateStatus(driverId, newStatus);
      fetchData();
    } catch (err) {
      alert('Không thể cập nhật trạng thái tài xế');
    }
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  // Tính toán chỉ số của từng tài xế
  const getDriverStats = (driverId, maxPayload) => {
    const driverOrders = orders.filter((o) => o.tai_xe_id === driverId);
    const activeOrders = driverOrders.filter((o) => ['DA_LAY_HANG', 'DANG_GIAO'].includes(o.trang_thai));
    const completedOrders = driverOrders.filter((o) => o.trang_thai === 'GIAO_THANH_CONG');
    
    const currentWeight = activeOrders.reduce((sum, o) => sum + (o.khoi_luong_kg || 0), 0);
    const currentCod = activeOrders.reduce((sum, o) => sum + (o.tien_thu_ho_cod || 0), 0);
    const completedCod = completedOrders.reduce((sum, o) => sum + (o.tien_thu_ho_cod || 0), 0);
    const loadPercent = Math.min(100, Math.round((currentWeight / (maxPayload || 1250)) * 100));

    return {
      activeCount: activeOrders.length,
      completedCount: completedOrders.length,
      currentWeight,
      currentCod,
      completedCod,
      loadPercent
    };
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.bien_so_xe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.so_dien_thoai.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || d.trang_thai_hoat_dong === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Quản Lý & Giám Sát Đội Xe Vận Tải
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
              {drivers.length} phương tiện & tài xế
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi vị trí hoạt động, tải trọng xe thực tế, công suất ca giao và tiền COD tài xế đang giữ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateDriverOpen(true)}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Thêm Tài Xế Mới
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên tài xế, biển số, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'SAN_SANG', 'DANG_GIAO', 'NGHI'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'SAN_SANG' ? 'Sẵn sàng' : st === 'DANG_GIAO' ? 'Đang giao' : 'Nghỉ ca'}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map((driver) => {
          const stats = getDriverStats(driver.id, driver.tai_trong_kg);
          return (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-blue-500/40 transition"
            >
              {/* Driver info header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                    {driver.ho_ten[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{driver.ho_ten}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{driver.bien_so_xe}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-500" /> {driver.danh_gia || 5.0}
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Loại phương tiện:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{driver.loai_xe}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Định mức tải trọng:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{driver.tai_trong_kg} kg</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Số GPLX:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{driver.so_gplx}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Số điện thoại:</span>
                  <a href={`tel:${driver.so_dien_thoai}`} className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                    <Phone className="w-3 h-3" /> {driver.so_dien_thoai}
                  </a>
                </div>
              </div>

              {/* Payload Gauge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-blue-500" /> Tải trọng đang chở:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.currentWeight} / {driver.tai_trong_kg} kg ({stats.loadPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stats.loadPercent > 90 ? 'bg-red-500' : stats.loadPercent > 60 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${stats.loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Financial & Order Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Đang giao / Đã giao</div>
                  <div className="font-black text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                    {stats.activeCount} đang giao • {stats.completedCount} xong
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">COD đang giữ</div>
                  <div className="font-black text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatVND(stats.currentCod)}
                  </div>
                </div>
              </div>

              {/* Status Switcher Footer */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">Trạng thái ca:</span>
                <select
                  value={driver.trang_thai_hoat_dong}
                  onChange={(e) => handleToggleStatus(driver.id, e.target.value)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border transition focus:outline-none cursor-pointer ${
                    driver.trang_thai_hoat_dong === 'SAN_SANG'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : driver.trang_thai_hoat_dong === 'DANG_GIAO'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <option value="SAN_SANG">🟢 Sẵn sàng nhận đơn</option>
                  <option value="DANG_GIAO">🟡 Đang đi giao hàng</option>
                  <option value="NGHI">⚪ Đang nghỉ ca / Bảo dưỡng</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Tài Xế Mới */}
      <CreateDriverModal
        isOpen={isCreateDriverOpen}
        onClose={() => setIsCreateDriverOpen(false)}
        onDriverCreated={fetchData}
      />
    </div>
  );
};
