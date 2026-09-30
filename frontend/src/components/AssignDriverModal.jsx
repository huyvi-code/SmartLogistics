import React, { useState, useEffect } from 'react';
import { ordersAPI, driversAPI, routesAPI, aiAPI } from '../api';
import { X, Truck, Check, Sparkles, Star, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { ROUTE_CATEGORIES } from './CreateOrderModal';

export const AssignDriverModal = ({ order, isOpen, onClose, onAssigned }) => {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Driver Recommendation State
  const [aiRec, setAiRec] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && order) {
      driversAPI.getAll().then(setDrivers).catch(console.error);
      routesAPI.getAll().then(setRoutes).catch(console.error);
      setSelectedDriver(order.tai_xe_id ? String(order.tai_xe_id) : '');
      setSelectedRoute(order.tuyen_giao_id ? String(order.tuyen_giao_id) : '');

      // Load AI Driver Suggestions
      setAiLoading(true);
      aiAPI.suggestDriver(order.id)
        .then((res) => {
          setAiRec(res);
          // Auto pre-select top driver if order doesn't have a driver yet
          if (!order.tai_xe_id && res.top_recommended_driver_id) {
            setSelectedDriver(String(res.top_recommended_driver_id));
          }
        })
        .catch((err) => console.error('Lỗi lấy gợi ý tài xế AI:', err))
        .finally(() => setAiLoading(false));
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      alert('Vui lòng chọn tài xế');
      return;
    }
    setLoading(true);
    try {
      await ordersAPI.assignDriver(
        order.id,
        parseInt(selectedDriver),
        selectedRoute ? parseInt(selectedRoute) : null
      );
      onAssigned();
      onClose();
    } catch (err) {
      alert('Lỗi phân công tài xế: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const topDriver = aiRec?.recommendations?.find(
    (r) => r.tai_xe_id === aiRec.top_recommended_driver_id
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer"
          title="Đóng (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Điều Phối & Phân Công Tài Xế</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20">
                AI Copilot
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đơn hàng: <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">{order.ma_van_don}</span> ({order.khoi_luong_kg} kg • {order.loai_hang_hoa})
            </p>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Gợi Ý Tài Xế Tối Ưu Nhất
            </span>
            {topDriver && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Độ phù hợp: {topDriver.match_score}%
              </span>
            )}
          </div>

          {aiLoading ? (
            <div className="py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-orange-500" /> AI đang tính toán cự ly, tải trọng thùng xe và ca giao...
            </div>
          ) : topDriver ? (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{topDriver.ho_ten}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {topDriver.bien_so_xe}
                    </span>
                    <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {topDriver.danh_gia}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Phương tiện: <strong>{topDriver.loai_xe}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-slate-400" /> Sức chứa còn: <strong className="text-emerald-600 dark:text-emerald-400">{topDriver.tai_trong_con_lai_kg} kg</strong>
                    </span>
                    <span>•</span>
                    <span>Đang giao: <strong className="text-indigo-600 dark:text-indigo-400">{topDriver.so_don_dang_giao} đơn</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDriver(String(topDriver.tai_xe_id))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                    selectedDriver === String(topDriver.tai_xe_id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {selectedDriver === String(topDriver.tai_xe_id) ? 'Đã Chọn Gợi Ý' : 'Áp Dụng Gợi Ý Này'}
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-orange-500/20">
                <span className="font-semibold text-orange-600 dark:text-orange-400">Phân tích thuật toán: </span>
                {topDriver.ly_do_de_xuat}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Chưa có thông tin phân tích tài xế.</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn tài xế phụ trách *
            </label>
            <div className="space-y-2">
              <select
                required
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn tài xế từ danh sách --</option>
                {drivers.map((d) => {
                  const recItem = aiRec?.recommendations?.find((r) => r.tai_xe_id === d.id);
                  return (
                    <option key={d.id} value={d.id}>
                      {d.ho_ten} - {d.bien_so_xe} ({d.loai_xe}) {recItem ? `[${recItem.match_score}% Phù hợp - Còn trống ${recItem.tai_trong_con_lai_kg}kg]` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Gán tuyến giao hàng (Tùy chọn)
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Giữ nguyên hoặc chọn tuyến --</option>
              {ROUTE_CATEGORIES.map((cat) => {
                const catRoutes = routes.filter((r) => r.khu_vuc === cat.key);
                if (catRoutes.length === 0) return null;
                return (
                  <optgroup key={cat.key} label={cat.title}>
                    {catRoutes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.ma_tuyen} - {r.ten_tuyen} ({r.cu_ly_km} km • ~{r.thoi_gian_uoc_tinh_gio}h)
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang phân công...' : 'Xác nhận phân công'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDriverModal;
