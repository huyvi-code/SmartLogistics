import React, { useState, useEffect } from 'react';
import { ordersAPI, trackingAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Search, Plus, CheckCircle2, Truck, AlertTriangle,
  RefreshCw, Printer, Download
} from 'lucide-react';
import { CreateOrderModal } from '../CreateOrderModal';
import { OrderDetailModal } from '../OrderDetailModal';
import { PrintShippingLabelModal } from '../PrintShippingLabelModal';
import { PaginationBar } from '../PaginationBar';
import { exportOrdersToCSV } from '../../utils/exportUtils';

export const CustomerPortal = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);

  // Pagination state (10 - 20 - 50): 1 đơn = 1 mục
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick Tracking Search
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getAll();
      setMyOrders(data);
    } catch (err) {
      console.error('Lỗi lấy đơn khách hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const res = await trackingAPI.track(trackingCode.trim());
      setTrackingResult(res);
    } catch (err) {
      setTrackingError(err.response?.data?.detail || 'Không tìm thấy thông tin vận đơn này.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  const getStepIndex = (status) => {
    switch (status) {
      case 'MOI': return 1;
      case 'DA_LAY_HANG': return 2;
      case 'DANG_GIAO': return 3;
      case 'GIAO_THANH_CONG': return 4;
      default: return 1;
    }
  };

  const totalPages = Math.max(1, Math.ceil(myOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = myOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 dark:from-emerald-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5" /> Cổng Khách Hàng Gửi &amp; Tra Cứu Đơn
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Xin chào, {user.ho_ten}!</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi trạng thái giao hàng theo thời gian thực và đăng ký gửi kiện hàng mới nhanh chóng
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Đăng Ký Gửi Đơn Hàng Mới
        </button>
      </div>

      {/* Quick Tracking Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-500" /> Tra Cứu Hành Trình Vận Đơn (Track &amp; Trace)
        </h2>

        <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập chính xác mã vận đơn (Ví dụ: VN2026-8801, VN2026-8803...)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={trackingLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Tra Cứu Tiến Độ
          </button>
        </form>

        {trackingError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{trackingError}</span>
          </div>
        )}

        {/* Tracking Result Visualizer */}
        {trackingResult && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-emerald-500/30 space-y-5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Mã vận đơn:</span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{trackingResult.ma_van_don}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái hiện tại:</span>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {trackingResult.trang_thai === 'GIAO_THANH_CONG' && '✅ Giao Hàng Thành Công'}
                  {trackingResult.trang_thai === 'DANG_GIAO' && '🚚 Đang Trên Đường Giao Cho Người Nhận'}
                  {trackingResult.trang_thai === 'DA_LAY_HANG' && '📦 Đã Lấy Hàng Về Bưu Cục'}
                  {trackingResult.trang_thai === 'MOI' && '📝 Đã Tiếp Nhận Thông Tin'}
                  {trackingResult.trang_thai === 'THAT_BAI' && '⚠️ Sự Cố Vận Chuyển'}
                </div>
              </div>
            </div>

            {/* 4-Step Progress Flow */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
              {[
                { title: '1. Tiếp Nhận', desc: 'Đã tạo đơn' },
                { title: '2. Lấy Hàng', desc: 'Vào bưu cục' },
                { title: '3. Đang Giao', desc: 'Tài xế đang tới' },
                { title: '4. Thành Công', desc: 'Đã nhận hàng' },
              ].map((step, idx) => {
                const currentIdx = getStepIndex(trackingResult.trang_thai);
                const isPassed = currentIdx >= idx + 1;
                const isCurrent = currentIdx === idx + 1;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition ${
                      isPassed
                        ? 'bg-emerald-500 text-white font-extrabold shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                    } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div className={`font-semibold ${isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">{step.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Timeline Events snippet */}
            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nhật Ký Hành Trình:</div>
              {trackingResult.logs && trackingResult.logs.length > 0 ? (
                trackingResult.logs.slice(0, 3).map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{l.mo_ta_chi_tiet || l.trang_thai}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(l.thoi_gian).toLocaleString('vi-VN')}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Chưa có bản ghi sự kiện</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Shipments History (My Orders) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sổ Đơn Hàng Của Tôi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Các vận đơn gửi đi hoặc nhận về thuộc số điện thoại của bạn</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportOrdersToCSV(myOrders, 'So_Don_Hang_Cua_Toi.csv')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Tải về sổ đơn hàng dạng Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={fetchMyOrders}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Đang tải sổ đơn hàng...
          </div>
        ) : myOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bạn chưa có đơn vận chuyển nào</div>
            <p className="text-xs text-slate-500 mt-1">Hãy nhấn nút &ldquo;Đăng Ký Gửi Đơn Hàng Mới&rdquo; ở trên để gửi kiện hàng đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã Vận Đơn</th>
                    <th className="py-3.5 px-4">Người Nhận &amp; Địa Chỉ</th>
                    <th className="py-3.5 px-4">Khối Lượng</th>
                    <th className="py-3.5 px-4">Tiền Thu Hộ COD</th>
                    <th className="py-3.5 px-4">Cước Phí</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {o.ma_van_don}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {new Date(o.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{o.nguoi_nhan_ten}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">
                          {o.nguoi_nhan_dia_chi}, {o.nguoi_nhan_tinh_thanh}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {o.khoi_luong_kg} kg
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-600 dark:text-amber-400">
                        {formatVND(o.tien_thu_ho_cod)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {formatVND(o.cuoc_phi_van_chuyen)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.trang_thai === 'GIAO_THANH_CONG' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          o.trang_thai === 'DANG_GIAO' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          o.trang_thai === 'DA_LAY_HANG' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                          o.trang_thai === 'THAT_BAI' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        }`}>
                          {o.trang_thai === 'GIAO_THANH_CONG' ? 'Thành công' :
                           o.trang_thai === 'DANG_GIAO' ? 'Đang giao' :
                           o.trang_thai === 'DA_LAY_HANG' ? 'Đã lấy hàng' :
                           o.trang_thai === 'THAT_BAI' ? 'Thất bại' : 'Mới tiếp nhận'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintOrder(o)}
                            title="In phiếu gửi A6 (AWB)"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-500/10 text-slate-700 dark:text-slate-300 hover:text-orange-500 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsDetailOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            Xem hành trình
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar (10 - 20 - 50): Hiển thị 10 20 50 */}
            <PaginationBar
              totalItems={myOrders.length}
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={safePage}
              setCurrentPage={setCurrentPage}
              itemLabel="vận đơn"
              sizeSuffix=""
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={fetchMyOrders}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={() => {
          fetchMyOrders();
          if (selectedOrder) {
            ordersAPI.getById(selectedOrder.id).then(setSelectedOrder).catch(console.error);
          }
        }}
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
