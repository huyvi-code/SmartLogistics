import React, { useState, useEffect } from 'react';
import { ordersAPI, incidentsAPI, aiAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Truck, CheckCircle2, Clock, AlertTriangle, Phone, MapPin,
  Package, DollarSign, RefreshCw, X, ChevronRight, Sparkles,
  Scale, Award, Printer, FileCheck
} from 'lucide-react';
import { OrderDetailModal } from '../OrderDetailModal';
import { PodSignatureModal } from '../PodSignatureModal';
import { PrintShippingLabelModal } from '../PrintShippingLabelModal';

export const DriverPortal = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // POD and Print state
  const [podOrder, setPodOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  // Incident Modal for Driver
  const [incidentOrder, setIncidentOrder] = useState(null);
  const [incidentType, setIncidentType] = useState('Khách hẹn lại ngày khác');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);

  // Driver AI Guidance
  const [driverAiGuidance, setDriverAiGuidance] = useState(null);
  const [loadingAiGuidance, setLoadingAiGuidance] = useState(false);


  const fetchDriverOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Lỗi lấy đơn tài xế:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverOrders();
  }, []);

  useEffect(() => {
    if (!incidentOrder) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIncidentOrder(null);
        setDriverAiGuidance(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [incidentOrder]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus, `Tài xế ${user.ho_ten} cập nhật trạng thái`);
      fetchDriverOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Không thể cập nhật trạng thái đơn');
    }
  };

  const handlePodConfirm = async (podDescription) => {
    if (!podOrder) return;
    try {
      await ordersAPI.updateStatus(podOrder.id, 'GIAO_THANH_CONG', podDescription, `Giao thành công tại ${podOrder.nguoi_nhan_tinh_thanh}`);
      setPodOrder(null);
      fetchDriverOrders();
    } catch (err) {
      alert('Lỗi cập nhật hoàn tất POD');
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!incidentOrder) return;
    setSubmittingIncident(true);
    try {
      await incidentsAPI.report({
        don_hang_id: incidentOrder.id,
        tai_xe_id: incidentOrder.tai_xe_id,
        loai_su_co: incidentType,
        mo_ta: incidentDesc,
      });
      setIncidentOrder(null);
      setIncidentDesc('');
      setDriverAiGuidance(null);
      fetchDriverOrders();
    } catch (err) {
      alert('Lỗi ghi nhận sự cố');
    } finally {
      setSubmittingIncident(false);
    }
  };

  const handleGetDriverAIGuidance = async () => {
    if (!incidentOrder) return;
    setLoadingAiGuidance(true);
    try {
      const solution = await aiAPI.suggestIncidentSolution(
        incidentOrder.id,
        incidentType,
        incidentDesc || 'Sự cố tại hiện trường giao hàng'
      );
      setDriverAiGuidance(solution);
    } catch (err) {
      console.error('Lỗi lấy hướng dẫn AI:', err);
    } finally {
      setLoadingAiGuidance(false);
    }
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';


  const totalOrders = orders.length;
  const needPickup = orders.filter((o) => o.trang_thai === 'DA_LAY_HANG').length;
  const inTransit = orders.filter((o) => o.trang_thai === 'DANG_GIAO').length;
  const completed = orders.filter((o) => o.trang_thai === 'GIAO_THANH_CONG').length;
  const activeOrders = needPickup + inTransit;
  const totalCODToHandover = orders
    .filter((o) => o.trang_thai === 'GIAO_THANH_CONG')
    .reduce((sum, o) => sum + (o.tien_thu_ho_cod || 0), 0);

  // Sức chứa & tải trọng xe
  const maxPayloadKg = 1250.0; // Định mức xe tải 1.25 tấn
  const currentWeightOnTruck = orders
    .filter((o) => ['DA_LAY_HANG', 'DANG_GIAO'].includes(o.trang_thai))
    .reduce((sum, o) => sum + (o.khoi_luong_kg || 0), 0);
  const remainingWeightKg = Math.max(0, maxPayloadKg - currentWeightOnTruck);
  const loadPercentage = Math.min(100, Math.round((currentWeightOnTruck / maxPayloadKg) * 100));

  // Tỷ lệ hoàn thành ca giao
  const shiftCompletionRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 0;
  const isShiftComplete = totalOrders > 0 && activeOrders === 0;

  return (
    <div className="space-y-6">
      {/* Driver Header Profile Card */}
      <div className="bg-gradient-to-r from-blue-500/10 dark:from-blue-900/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-bold text-2xl">
              {user.ho_ten[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.ho_ten}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Tài xế giao nhận
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Số điện thoại: <strong className="text-slate-700 dark:text-slate-200">{user.so_dien_thoai}</strong></span>
                <span>•</span>
                <span>Phương tiện: <strong className="text-slate-700 dark:text-slate-200">Xe tải chuyên dụng (Tải định mức: {maxPayloadKg} kg)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={fetchDriverOrders}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 self-start md:self-auto transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới danh sách
          </button>
        </div>

        {/* 4 Driver KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Cần lấy / Nhận hàng
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{needPickup} đơn</div>
          </div>

          <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" /> Đang trên đường giao
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{inTransit} đơn</div>
          </div>

          <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đã giao thành công
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completed} đơn</div>
          </div>

          <div className="bg-white dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-orange-500" /> Tiền COD giữ trong ca
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">{formatVND(totalCODToHandover)}</div>
          </div>
        </div>

        {/* Chỉ Số Vận Chuyển Đủ: Tải Trọng Thùng Xe & Đạt Chỉ Tiêu Ca Giao */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          {/* Card 1: Trạng thái Tải Trọng Thùng Xe (Payload Capacity) */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-500" /> Sức Chứa Thùng Xe & Tải Trọng
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                loadPercentage >= 90
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : loadPercentage >= 70
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {loadPercentage >= 90 ? '⚠️ Đã Đủ Tải Tối Đa' : loadPercentage >= 70 ? '⚡ Tải Trọng Tối Ưu' : '✅ Còn Rộng Chỗ'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Đang chở trên xe:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentWeightOnTruck} kg <span className="text-xs font-normal text-slate-400">/ {maxPayloadKg} kg</span> ({loadPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    loadPercentage >= 90 ? 'bg-red-500' : loadPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {loadPercentage >= 90
                ? 'Thùng xe đã đạt đủ tải trọng định mức an toàn (không nên nhận thêm kiện hàng nặng để tránh quá tải).'
                : `Thùng xe còn có thể nhận thêm tối đa ${remainingWeightKg} kg hàng hóa từ điều phối viên.`}
            </p>
          </div>

          {/* Card 2: Tiến Độ Ca Giao Hàng & Đánh Giá Vận Chuyển Đủ */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-500" /> Tiến Độ Hoàn Thành Ca Giao
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isShiftComplete
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}>
                {isShiftComplete ? '🎉 ĐÃ VẬN CHUYỂN ĐỦ CA' : `Đang chạy: ${shiftCompletionRate}%`}
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Đã phát thành công:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {completed} <span className="text-xs font-normal text-slate-400">/ {totalOrders} đơn</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${shiftCompletionRate}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isShiftComplete
                ? 'Chúc mừng! Bạn đã hoàn thành vận chuyển đủ 100% tất cả đơn hàng trong ca. Có thể bàn giao tiền COD và kết thúc ca.'
                : totalOrders === 0
                ? 'Hiện chưa có đơn nào được gán cho ca này.'
                : `Còn lại ${activeOrders} đơn hàng đang chờ lấy hoặc đang trên đường giao để đạt đủ chỉ tiêu ca.`}
            </p>
          </div>
        </div>
      </div>

      {/* Driver Assigned Deliveries List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nhiệm Vụ Giao Hàng Của Tôi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Danh sách các vận đơn được phân công trực tiếp cho bạn</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {orders.length} đơn được gán
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Đang tải dữ liệu chuyến xe...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hiện tại bạn chưa có đơn hàng nào được phân công</div>
            <p className="text-xs text-slate-500 mt-1">Vui lòng chờ điều phối viên gán đơn hoặc liên hệ tổng đài nội bộ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-base text-orange-600 dark:text-orange-400">
                      {o.ma_van_don}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      o.trang_thai === 'GIAO_THANH_CONG' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      o.trang_thai === 'DANG_GIAO' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      o.trang_thai === 'DA_LAY_HANG' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                      o.trang_thai === 'THAT_BAI' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                      'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    }`}>
                      {o.trang_thai === 'GIAO_THANH_CONG' ? 'Thành công' :
                       o.trang_thai === 'DANG_GIAO' ? 'Đang giao' :
                       o.trang_thai === 'DA_LAY_HANG' ? 'Đã lấy hàng' :
                       o.trang_thai === 'THAT_BAI' ? 'Thất bại' : 'Mới'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Địa chỉ giao:</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{o.nguoi_nhan_dia_chi}, {o.nguoi_nhan_tinh_thanh}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Người nhận: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{o.nguoi_nhan_ten}</span>
                      </div>
                      <a
                        href={`tel:${o.nguoi_nhan_sdt}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3" /> {o.nguoi_nhan_sdt}
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs px-1">
                    <div className="text-slate-500 dark:text-slate-400">
                      Hàng: <strong className="text-slate-800 dark:text-slate-200">{o.loai_hang_hoa} ({o.khoi_luong_kg}kg)</strong>
                    </div>
                    <div>
                      Tiền thu hộ COD: <strong className="text-amber-600 dark:text-amber-400 text-sm">{formatVND(o.tien_thu_ho_cod)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setIsDetailOpen(true);
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    Xem lịch trình <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Nút xem/in tem A6 */}
                    <button
                      onClick={() => setPrintOrder(o)}
                      title="Xem & In phiếu gửi A6"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {o.trang_thai === 'DA_LAY_HANG' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'DANG_GIAO')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" /> Bắt đầu đi giao
                      </button>
                    )}

                    {o.trang_thai === 'DANG_GIAO' && (
                      <>
                        <button
                          onClick={() => setIncidentOrder(o)}
                          className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Báo sự cố
                        </button>
                        <button
                          onClick={() => setPodOrder(o)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Ký nhận & Hoàn tất
                        </button>
                      </>
                    )}

                    {o.trang_thai === 'GIAO_THANH_CONG' && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                      </span>
                    )}

                    {o.trang_thai === 'THAT_BAI' && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Đang ghi nhận sự cố
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Modal */}
      {incidentOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIncidentOrder(null);
              setDriverAiGuidance(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIncidentOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Báo Cáo Sự Cố Giao Hàng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Đơn hàng: <strong className="text-orange-500 font-mono">{incidentOrder.ma_van_don}</strong></p>
              </div>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loại sự cố</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Khách hẹn lại ngày khác">Khách hẹn lại ngày khác</option>
                  <option value="Không liên lạc được người nhận">Không liên lạc được người nhận</option>
                  <option value="Sai số điện thoại hoặc sai địa chỉ">Sai số điện thoại hoặc sai địa chỉ</option>
                  <option value="Hàng hóa bị móp méo / khách từ chối nhận">Hàng hóa bị móp méo / khách từ chối nhận</option>
                  <option value="Xe gặp sự cố kỹ thuật / tắc đường">Xe gặp sự cố kỹ thuật / tắc đường</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả cụ thể để điều phối nắm bắt *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ghi rõ tình huống: Khách hẹn mấy giờ, lý do từ chối..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* AI Guidance Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={loadingAiGuidance}
                  onClick={handleGetDriverAIGuidance}
                  className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {loadingAiGuidance ? 'AI đang gợi ý...' : 'AI Hướng Dẫn Xử Lý Hiện Trường'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIncidentOrder(null);
                      setDriverAiGuidance(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingIncident}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    {submittingIncident ? 'Đang gửi...' : 'Xác Nhận Sự Cố'}
                  </button>
                </div>
              </div>

              {/* Driver AI Guidance Display */}
              {driverAiGuidance && (
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2 text-xs animate-in fade-in">
                  <div className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Hướng Dẫn Hành Động Của AI Cho Tài Xế:
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/80 p-2.5 rounded-lg border border-orange-500/20">
                    {driverAiGuidance.bien_phap_khac_phuc_goi_y}
                  </div>
                  {driverAiGuidance.hanh_dong_tiep_theo && (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {driverAiGuidance.hanh_dong_tiep_theo.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}


      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={() => {
          fetchDriverOrders();
          if (selectedOrder) {
            ordersAPI.getById(selectedOrder.id).then(setSelectedOrder).catch(console.error);
          }
        }}
      />

      {/* Proof of Delivery (POD) Modal */}
      <PodSignatureModal
        isOpen={Boolean(podOrder)}
        onClose={() => setPodOrder(null)}
        order={podOrder}
        onConfirmSuccess={handlePodConfirm}
      />

      {/* Print Shipping Label A6 Modal */}
      <PrintShippingLabelModal
        isOpen={Boolean(printOrder)}
        onClose={() => setPrintOrder(null)}
        orders={printOrder ? [printOrder] : []}
      />
    </div>
  );
};
