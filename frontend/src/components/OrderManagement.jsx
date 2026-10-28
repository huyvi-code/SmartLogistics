import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { exportOrdersToCSV } from '../utils/exportUtils';
import {
  Package, Plus, Search, RefreshCw, Eye, UserCheck, MapPin,
  Clock, CheckCircle2, AlertTriangle, Truck, Printer, Download,
  CheckSquare, Square, Calendar
} from 'lucide-react';
import { CreateOrderModal } from './CreateOrderModal';
import { OrderDetailModal } from './OrderDetailModal';
import { AssignDriverModal } from './AssignDriverModal';
import { PrintShippingLabelModal } from './PrintShippingLabelModal';
import { PaginationBar } from './PaginationBar';

export const OrderManagement = ({ onOrdersChanged }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  // Pagination state (10 - 20 - 50)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Checkbox selection for batch operations
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Print Modal state
  const [printOrders, setPrintOrders] = useState([]);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getAll({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        q: searchTerm || undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  // Lọc theo khoảng thời gian
  const filteredOrders = orders.filter((o) => {
    if (dateRangeFilter === 'ALL') return true;
    const orderDate = new Date(o.created_at);
    const now = new Date();
    if (dateRangeFilter === 'TODAY') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateRangeFilter === '7DAYS') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Batch selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // In đơn lẻ
  const handlePrintSingle = (order) => {
    setPrintOrders([order]);
    setIsPrintOpen(true);
  };

  // In hàng loạt
  const handlePrintBatch = () => {
    const ordersToPrint = filteredOrders.filter((o) => selectedOrderIds.includes(o.id));
    if (ordersToPrint.length === 0) return;
    setPrintOrders(ordersToPrint);
    setIsPrintOpen(true);
  };

  // Xuất file CSV
  const handleExportCSV = () => {
    const dataToExport = selectedOrderIds.length > 0
      ? filteredOrders.filter((o) => selectedOrderIds.includes(o.id))
      : filteredOrders;
    exportOrdersToCSV(dataToExport);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'MOI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Mới tiếp nhận
          </span>
        );
      case 'DA_LAY_HANG':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Đã lấy hàng
          </span>
        );
      case 'DANG_GIAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Truck className="w-3.5 h-3.5 animate-bounce" />
            Đang giao
          </span>
        );
      case 'GIAO_THANH_CONG':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Thành công
          </span>
        );
      case 'THAT_BAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Thất bại / Sự cố
          </span>
        );
      default:
        return <span>{st}</span>;
    }
  };

  const getPriorityBadge = (pr) => {
    switch (pr) {
      case 'HOA_TOC':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">Hỏa tốc</span>;
      case 'CAO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">Ưu tiên</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Chuẩn</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Danh Sách &amp; Điều Phối Vận Đơn</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Điều phối phương tiện, in tem nhãn nhiệt A6, gán tuyến bưu chính và theo dõi hành trình thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              fetchOrders();
              onOrdersChanged?.();
            }}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Xuất danh sách đơn hàng sang file CSV / Excel"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Xuất Excel/CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo Đơn Giao Mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'MOI', label: 'Mới' },
            { id: 'DA_LAY_HANG', label: 'Đã lấy' },
            { id: 'DANG_GIAO', label: 'Đang giao' },
            { id: 'GIAO_THANH_CONG', label: 'Thành công' },
            { id: 'THAT_BAI', label: 'Sự cố' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-orange-500 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Date Filter & Search input */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">📅 Tất cả thời gian</option>
            <option value="TODAY">📅 Hôm nay</option>
            <option value="7DAYS">📅 7 ngày qua</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã vận đơn, người nhận, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* Batch Actions Bar (Hiển thị khi có ít nhất 1 checkbox được tick chọn) */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <span className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs">
              {selectedOrderIds.length}
            </span>
            <span>Đã chọn {selectedOrderIds.length} vận đơn trong danh sách</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBatch}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> In Hàng Loạt ({selectedOrderIds.length} tem A6)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" /> Xuất Đơn Đã Chọn
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline ml-1 cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrderIds.includes(o.id))}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
              </th>
              <th className="py-3.5 px-4">Mã Vận Đơn</th>
              <th className="py-3.5 px-4">Người Gửi (Kho/Shop)</th>
              <th className="py-3.5 px-4">Người Nhận (Điểm Giao)</th>
              <th className="py-3.5 px-4">Khối Lượng &amp; Thu Hộ</th>
              <th className="py-3.5 px-4">Tài Xế Phụ Trách</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                  Đang tải danh sách đơn hàng...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  Không có đơn hàng nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                  {/* Checkbox */}
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(o.id)}
                      onChange={() => handleToggleSelect(o.id)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>

                  {/* Mã vận đơn */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsDetailOpen(true);
                        }}
                        className="font-mono font-bold text-orange-600 dark:text-orange-400 group-hover:underline cursor-pointer"
                      >
                        {o.ma_van_don}
                      </span>
                      {getPriorityBadge(o.muc_do_uu_tien)}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(o.created_at).toLocaleTimeString('vi-VN')} {new Date(o.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  {/* Người gửi */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{o.nguoi_gui_ten}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {o.nguoi_gui_tinh_thanh} ({o.nguoi_gui_dia_chi})
                    </div>
                  </td>

                  {/* Người nhận */}
                  <td className="py-3.5 px-4 max-w-[220px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{o.nguoi_nhan_ten} - {o.nguoi_nhan_sdt}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      {o.nguoi_nhan_dia_chi}, {o.nguoi_nhan_tinh_thanh}
                    </div>
                  </td>

                  {/* Khối lượng & COD */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{o.khoi_luong_kg} kg • {o.loai_hang_hoa}</div>
                    <div className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] mt-0.5">
                      COD: {formatVND(o.tien_thu_ho_cod)}
                    </div>
                  </td>

                  {/* Tài xế phụ trách */}
                  <td className="py-3.5 px-4">
                    {o.tai_xe ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {o.tai_xe.ho_ten[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{o.tai_xe.ho_ten}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{o.tai_xe.bien_so_xe}</div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsAssignOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3 h-3" /> Phân công
                      </button>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(o.trang_thai)}
                  </td>

                  {/* Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Nút in vận đơn A6 trực tiếp */}
                      <button
                        onClick={() => handlePrintSingle(o)}
                        title="In phiếu gửi A6 (AWB)"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-500/10 text-slate-700 dark:text-slate-300 hover:text-orange-500 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Nút xem chi tiết */}
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsDetailOpen(true);
                        }}
                        title="Xem chi tiết vận đơn"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Nút điều phối tài xế */}
                      {user?.vai_tro === 'QUAN_LY' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsAssignOpen(true);
                          }}
                          title="Điều phối tài xế & Gán tuyến"
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (10 - 20 - 50) */}
      <PaginationBar
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={safePage}
        setCurrentPage={setCurrentPage}
        itemLabel="vận đơn"
      />

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={() => {
          fetchOrders();
          onOrdersChanged?.();
        }}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={() => {
          fetchOrders();
          onOrdersChanged?.();
          if (selectedOrder) {
            ordersAPI.getById(selectedOrder.id).then(setSelectedOrder).catch(console.error);
          }
        }}
      />

      <AssignDriverModal
        order={selectedOrder}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssigned={() => {
          fetchOrders();
          onOrdersChanged?.();
        }}
      />

      {/* Print Shipping Label A6 Modal */}
      <PrintShippingLabelModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        orders={printOrders}
      />
    </div>
  );
};
