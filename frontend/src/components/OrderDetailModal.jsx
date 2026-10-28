import React, { useState, useEffect } from 'react';
import { ordersAPI, incidentsAPI, aiAPI } from '../api';
import {
  X, Package, MapPin, Truck, Clock, AlertTriangle, CheckCircle2, PenTool, Camera,
  ChevronRight, User, Phone, DollarSign, Sparkles, ShieldCheck, RefreshCw, Navigation, Printer
} from 'lucide-react';
import { PrintShippingLabelModal } from './PrintShippingLabelModal';
import { PodSignatureModal } from './PodSignatureModal';

export const OrderDetailModal = ({ order, isOpen, onClose, onRefresh }) => {
  const [updating, setUpdating] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [podData, setPodData] = useState(null);
  const [loadingPod, setLoadingPod] = useState(false);

  const fetchPodData = async (orderId) => {
    if (!orderId) return;
    setLoadingPod(true);
    try {
      const data = await ordersAPI.getPod(orderId);
      setPodData(data);
    } catch (err) {
      setPodData(null);
    } finally {
      setLoadingPod(false);
    }
  };

  useEffect(() => {
    if (isOpen && order && order.trang_thai === 'GIAO_THANH_CONG') {
      fetchPodData(order.id);
    } else {
      setPodData(null);
    }
  }, [isOpen, order?.id, order?.trang_thai]);

  const handlePodConfirm = async (podPayload) => {
    try {
      setUpdating(true);
      await ordersAPI.submitPod(order.id, podPayload);
      setIsPodOpen(false);
      if (onRefresh) onRefresh();
      fetchPodData(order.id);
    } catch (err) {
      alert(err.response?.data?.detail || 'Lỗi cập nhật hoàn tất chứng từ POD');
    } finally {
      setUpdating(false);
    }
  };
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentType, setIncidentType] = useState('Khách hẹn lại ngày khác');
  const [incidentDesc, setIncidentDesc] = useState('');

  // AI Incident Diagnosis State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSolution, setAiSolution] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [customResolution, setCustomResolution] = useState('');

  // Close modal on Escape key press
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

  if (!isOpen || !order) return null;

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(order.id, newStatus, `Cập nhật trạng thái sang ${newStatus}`);
      onRefresh();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn');
    } finally {
      setUpdating(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await incidentsAPI.report({
        don_hang_id: order.id,
        tai_xe_id: order.tai_xe_id,
        loai_su_co: incidentType,
        mo_ta: incidentDesc,
      });
      setShowIncidentForm(false);
      setIncidentDesc('');
      setAiSolution(null);
      onRefresh();
    } catch (err) {
      alert('Lỗi ghi nhận sự cố');
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestAISolution = async (typeToUse, descToUse) => {
    setAiLoading(true);
    try {
      const solution = await aiAPI.suggestIncidentSolution(
        order.id,
        typeToUse || incidentType,
        descToUse || incidentDesc || 'Sự cố giao hàng cần giải quyết'
      );
      setAiSolution(solution);
    } catch (err) {
      alert('Không thể lấy gợi ý AI lúc này');
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolveIncident = async (incidentId, resolution) => {
    setUpdating(true);
    try {
      await incidentsAPI.resolve(incidentId, resolution);
      setAiSolution(null);
      setResolvingId(null);
      setCustomResolution('');
      onRefresh();
    } catch (err) {
      alert('Lỗi khi giải quyết sự cố');
    } finally {
      setUpdating(false);
    }
  };


  const getStatusBadge = (st) => {
    switch (st) {
      case 'MOI':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">Mới Tiếp Nhận</span>;
      case 'DA_LAY_HANG':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">Đã Lấy Hàng / Nhập Kho</span>;
      case 'DANG_GIAO':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">Đang Vận Chuyển</span>;
      case 'GIAO_THANH_CONG':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Giao Thành Công</span>;
      case 'THAT_BAI':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">Giao Thất Bại / Sự Cố</span>;
      default:
        return <span>{st}</span>;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative transition-colors duration-200 animate-in fade-in">
        {/* Sticky Header with prominent close button */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{order.ma_van_don}</h2>
                {getStatusBadge(order.trang_thai)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Khởi tạo: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Quick status transitions & Close Button */}
          <div className="flex items-center gap-2">
            {order.trang_thai === 'MOI' && (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('DA_LAY_HANG')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Xác nhận đã lấy hàng
              </button>
            )}
            {order.trang_thai === 'DA_LAY_HANG' && (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('DANG_GIAO')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                Bắt đầu giao
              </button>
            )}
            {order.trang_thai === 'DANG_GIAO' && (
              <>
                <button
                  disabled={updating}
                  onClick={() => setIsPodOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công (Ký POD)
                </button>
                <button
                  onClick={() => setShowIncidentForm(!showIncidentForm)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Báo sự cố
                </button>
              </>
            )}

            {/* Nút In Vận Đơn A6 */}
            <button
              type="button"
              onClick={() => setIsPrintOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="In phiếu gửi bưu chính A6 có mã vạch"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In Tem A6</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-xs"
              title="Đóng cửa sổ (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Đóng</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">


        {/* Incident Reporting Drawer */}
        {showIncidentForm && (
          <form onSubmit={handleReportIncident} className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Báo Cáo Sự Cố Vận Chuyển
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loại sự cố</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Khách hẹn lại ngày khác">Khách hẹn lại ngày khác</option>
                  <option value="Không liên lạc được người nhận">Không liên lạc được người nhận</option>
                  <option value="Sai số điện thoại / địa chỉ">Sai số điện thoại / địa chỉ</option>
                  <option value="Hàng hóa bị móp méo / hư hại">Hàng hóa bị móp méo / hư hại</option>
                  <option value="Tắc nghẽn giao thông / sự cố xe">Tắc nghẽn giao thông / sự cố xe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả chi tiết</label>
                <input
                  type="text"
                  required
                  placeholder="Ghi rõ lý do và tình huống cụ thể..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* AI Assistant Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-red-500/20">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleRequestAISolution(incidentType, incidentDesc)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                {aiLoading ? 'AI đang phân tích sự cố...' : 'AI Phân Tích & Gợi Ý Khắc Phục'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIncidentForm(false);
                    setAiSolution(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Lưu sự cố & Đánh dấu thất bại
                </button>
              </div>
            </div>

            {/* AI Solution Box */}
            {aiSolution && (
              <div className="mt-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-orange-500/40 shadow-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Khuyến Nghị Từ AI Copilot:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    aiSolution.muc_do_nghiem_trong === 'KHAN_CAP' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    aiSolution.muc_do_nghiem_trong === 'CAO' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                  }`}>
                    Mức độ: {aiSolution.muc_do_nghiem_trong}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-orange-500/5 p-2.5 rounded-lg border border-orange-500/20">
                  {aiSolution.bien_phap_khac_phuc_goi_y}
                </div>

                {aiSolution.hanh_dong_tiep_theo && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Các bước xử lý khuyến nghị:</div>
                    {aiSolution.hanh_dong_tiep_theo.map((step, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        )}


        {/* 2-column info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Người Gửi</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> {order.nguoi_gui_ten}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.nguoi_gui_sdt}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {order.nguoi_gui_dia_chi}, {order.nguoi_gui_tinh_thanh}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Người Nhận</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> {order.nguoi_nhan_ten}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.nguoi_nhan_sdt}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" /> {order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh}
            </div>
          </div>
        </div>

        {/* Finance & Driver card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Kiện hàng & Cân nặng:</span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{order.loai_hang_hoa} ({order.khoi_luong_kg} kg)</div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Cước VC / Thu hộ COD:</span>
            <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {formatVND(order.cuoc_phi_van_chuyen)} / COD: {formatVND(order.tien_thu_ho_cod)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Tài xế phụ trách:</span>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {order.tai_xe ? `${order.tai_xe.ho_ten} (${order.tai_xe.bien_so_xe})` : 'Chưa phân công'}
            </div>
          </div>
        </div>

        {/* Tuyến vận chuyển được chỉ định */}
        {order.tuyen_giao && (
          <div className="mb-6 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Tuyến: {order.tuyen_giao.ma_tuyen} - {order.tuyen_giao.ten_tuyen}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lộ trình: {order.tuyen_giao.diem_dau} ➜ {order.tuyen_giao.diem_cuoi} • Cự ly: {order.tuyen_giao.cu_ly_km} km • Thời gian dự kiến: ~{order.tuyen_giao.thoi_gian_uoc_tinh_gio}h
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-700 dark:text-sky-300">
              {order.tuyen_giao.khu_vuc === 'NOI_THANH_HN' ? 'Hà Nội' : order.tuyen_giao.khu_vuc === 'MIEN_BAC' ? 'Miền Bắc' : order.tuyen_giao.khu_vuc === 'BAC_NAM' ? 'Trục Bắc - Nam' : order.tuyen_giao.khu_vuc === 'MIEN_NAM' ? 'Miền Nam' : 'Miền Trung'}
            </span>
          </div>
        )}

        {/* Sự Cố Vận Chuyển Đã Ghi Nhận (kèm AI Assistant) */}
        {order.su_co && order.su_co.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Sự Cố Vận Chuyển Cần Xử Lý ({order.su_co.length})
              </h3>
            </div>

            <div className="space-y-3">
              {order.su_co.map((sc) => (
                <div key={sc.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{sc.loai_su_co}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sc.trang_thai === 'DA_XU_LY'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {sc.trang_thai === 'DA_XU_LY' ? 'Đã xử lý' : 'Chưa xử lý'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {sc.mo_ta}
                  </div>

                  {sc.bien_phap_khac_phuc && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Biện pháp đã áp dụng: <strong>{sc.bien_phap_khac_phuc}</strong></span>
                    </div>
                  )}

                  {sc.trang_thai !== 'DA_XU_LY' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => {
                          setResolvingId(sc.id);
                          handleRequestAISolution(sc.loai_su_co, sc.mo_ta);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        {aiLoading && resolvingId === sc.id ? 'AI đang chẩn đoán...' : 'AI Phân Tích & Gợi Ý Giải Quyết'}
                      </button>

                      {resolvingId === sc.id && aiSolution && (
                        <div className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-orange-500/30 space-y-2">
                          <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Đề xuất xử lý từ AI Copilot (Mức độ: {aiSolution.muc_do_nghiem_trong}):
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                            {aiSolution.bien_phap_khac_phuc_goi_y}
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() => handleResolveIncident(sc.id, aiSolution.bien_phap_khac_phuc_goi_y)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Áp dụng giải pháp AI & Đóng sự cố
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chứng từ Ký nhận Giao hàng Điện tử (e-POD) nếu đơn đã giao thành công */}
        {order.trang_thai === 'GIAO_THANH_CONG' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chứng Từ Giao Hàng & Ký Nhận Điện Tử (e-POD)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã Giao Thành Công
              </span>
            </div>

            {(() => {
              const podLog = order.logs?.find((lg) => lg.mo_ta_chi_tiet?.includes('[POD') || lg.trang_thai === 'GIAO_THANH_CONG');
              return (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {podLog?.mo_ta_chi_tiet || `Đơn hàng đã được phát thành công tới người nhận ${order.nguoi_nhan_ten}.`}
                  </div>
                  {podLog?.vi_tri_hien_tai && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Điểm phát: {podLog.vi_tri_hien_tai}
                    </div>
                  )}
                  {podLog?.thoi_gian && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Xác nhận lúc: {new Date(podLog.thoi_gian).toLocaleTimeString('vi-VN')} {new Date(podLog.thoi_gian).toLocaleDateString('vi-VN')}
                    </div>
                  )}

                  {/* Hiển thị Chữ Ký Điện Tử Thực Tế Của Người Nhận */}
                  {podData?.has_signature && podData?.signature_url ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Chữ ký điện tử của người nhận:
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
                        <img
                          src={podData.signature_url}
                          alt="Chữ ký điện tử của người nhận"
                          className="h-20 w-auto max-w-[280px] object-contain block"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>Chưa lưu hình chữ ký (Đơn hàng ký giấy xác nhận hoặc đơn cũ chưa đính kèm chữ ký)</span>
                      </div>
                    </div>
                  )}

                  {/* Hiển thị Ảnh Chụp Hiện Trường Kiện Hàng (nếu có) */}
                  {podData?.has_evidence && podData?.evidence_url && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Ảnh chụp kiện hàng hiện trường:
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-xs shadow-xs">
                        <img
                          src={podData.evidence_url}
                          alt="Ảnh hiện trường kiện hàng"
                          className="max-h-40 w-full object-cover cursor-pointer hover:opacity-95 transition"
                          onClick={() => window.open(podData.evidence_url, '_blank')}
                          title="Bấm để mở xem ảnh gốc"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Timeline Log Hành Trình */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">

            <Clock className="w-4 h-4 text-orange-500" /> Lịch Sử Hành Trình Vận Đơn (Tracking Timeline)
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4 max-h-60 overflow-y-auto">
            {order.logs && order.logs.length > 0 ? (
              order.logs.map((lg, idx) => (
                <div key={lg.id || idx} className="flex items-start gap-3 relative">
                  <div className="p-1.5 rounded-full bg-orange-500/10 text-orange-500 mt-0.5 border border-orange-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{lg.mo_ta_chi_tiet || lg.trang_thai}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(lg.thoi_gian).toLocaleTimeString('vi-VN')} {new Date(lg.thoi_gian).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {lg.vi_tri_hien_tai && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {lg.vi_tri_hien_tai}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-2">Chưa có nhật ký ghi nhận</div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Print Shipping Label A6 Modal */}
    <PrintShippingLabelModal
      isOpen={isPrintOpen}
      onClose={() => setIsPrintOpen(false)}
      orders={order ? [order] : []}
    />

    {/* Proof of Delivery (POD) Modal */}
    <PodSignatureModal
      isOpen={isPodOpen}
      onClose={() => setIsPodOpen(false)}
      order={order}
      onConfirmSuccess={handlePodConfirm}
    />
  </div>
  );
};

