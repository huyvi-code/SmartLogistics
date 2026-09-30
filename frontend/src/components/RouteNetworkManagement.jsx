import React, { useState, useEffect } from 'react';
import { routesAPI, ordersAPI } from '../api';
import {
  MapPin, Navigation, Clock, DollarSign, RefreshCw, Search,
  Compass, ArrowRight, ShieldCheck, CheckCircle2, Calculator
} from 'lucide-react';

export const RouteNetworkManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Route Test Simulator
  const [simWeight, setSimWeight] = useState(2.5);
  const [simCod, setSimCod] = useState(500000);
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await routesAPI.getAll();
      setRoutes(data);
    } catch (err) {
      console.error('Lỗi lấy tuyến đường:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  const regionNames = {
    'NOI_THANH_HN': 'Hà Nội & Nội Thành',
    'MIEN_BAC': 'Liên Tỉnh Miền Bắc',
    'BAC_NAM': 'Trục Bắc – Nam Xuyên Việt',
    'MIEN_NAM': 'TP. Hồ Chí Minh & Miền Nam',
    'MIEN_TRUNG': 'Liên Tỉnh Miền Trung'
  };

  const filteredRoutes = routes.filter((r) => {
    const matchSearch =
      r.ten_tuyen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ma_tuyen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diem_dau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diem_cuoi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = selectedRegion === 'ALL' || r.khu_vuc === selectedRegion;
    return matchSearch && matchRegion;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Mạng Lưới Tuyến Vận Chuyển & Biểu Cước Quốc Gia
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
              {routes.length} trục tuyến tiêu chuẩn
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quy định cự ly km, thời gian cam kết giao hàng (SLA) và đơn giá cước cơ sở phân định theo 5 nhóm vùng miền
          </p>
        </div>

        <button
          onClick={fetchRoutes}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filter and Region Tabs */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full lg:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã tuyến, điểm đầu, điểm cuối..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 text-xs">
          {['ALL', 'NOI_THANH_HN', 'MIEN_BAC', 'BAC_NAM', 'MIEN_TRUNG', 'MIEN_NAM'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-orange-500 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {reg === 'ALL' ? 'Toàn bộ 5 Miền' : regionNames[reg] || reg}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5 hover:border-orange-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {route.ma_tuyen}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {regionNames[route.khu_vuc] || route.khu_vuc}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-2.5">
                {route.ten_tuyen}
              </h3>

              {/* Waypoints */}
              <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.diem_dau}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-orange-500 shrink-0 mx-2" />
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>{route.diem_cuoi}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Cự ly</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{route.cu_ly_km} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">SLA Cam kết</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{route.thoi_gian_uoc_tinh_gio}h</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Cước cơ sở</span>
                <span className="font-black text-orange-600 dark:text-orange-400">{formatVND(route.gia_cuoc_co_ban)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
