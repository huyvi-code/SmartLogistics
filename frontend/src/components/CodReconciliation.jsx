import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { exportReconciliationToCSV } from '../utils/exportUtils';
import {
  Download, CheckCircle2, Clock, RefreshCw, Search
} from 'lucide-react';
import { PaginationBar } from './PaginationBar';

export const CodReconciliation = ({ onSettlementChanged }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Pagination state (10 - 20 - 50)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Lỗi lấy đơn đối soát:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  // Lọc chỉ các đơn có COD hoặc đã hoàn thành
  const codOrders = orders.filter((o) => (o.tien_thu_ho_cod > 0) || o.thanh_toan);

  const filteredOrders = codOrders.filter((o) => {
    const isPaid = o.thanh_toan?.trang_thai === 'DA_THANH_TOAN';
    const matchFilter =
      settlementFilter === 'ALL'
        ? true
        : settlementFilter === 'PAID'
        ? isPaid
        : !isPaid;
    const matchSearch =
      o.ma_van_don.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.nguoi_gui_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.nguoi_nhan_ten.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Xác nhận quyết toán COD
  const handleSettleOrders = async (orderIdsToSettle) => {
    if (!orderIdsToSettle || orderIdsToSettle.length === 0) return;
    if (!window.confirm(`Xác nhận hoàn tất đối soát và quyết toán cho ${orderIdsToSettle.length} đơn hàng?`)) {
      return;
    }

    setProcessing(true);
    try {
      for (const id of orderIdsToSettle) {
        await ordersAPI.updateStatus(id, 'GIAO_THANH_CONG', 'Đã đối soát tiền COD và cước phí với khách hàng');
      }
      setSelectedIds([]);
      fetchOrders();
      onSettlementChanged?.();
      alert(`Đã hoàn tất đối soát thành công cho ${orderIdsToSettle.length} đơn hàng.`);
    } catch (err) {
      console.error('Lỗi đối soát:', err);
      alert('Có lỗi phát sinh trong quá trình đối soát.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? filteredOrders.filter((o) => selectedIds.includes(o.id))
      : filteredOrders;
    exportReconciliationToCSV(dataToExport);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Trung Tâm Đối Soát Tài Chính &amp; Thu Hộ COD
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Minh bạch dòng tiền bưu chính, cấn trừ cước tự động và chi trả tiền thu hộ định kỳ cho đối tác
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchOrders();
              onSettlementChanged?.();
            }}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Xuất Bảng Kê (CSV/Excel)
          </button>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã vận đơn, tên shop, người nhận..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={() => handleSettleOrders(selectedIds)}
              disabled={processing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Quyết Toán ({selectedIds.length} đơn)
            </button>
          )}

          {['ALL', 'PENDING', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSettlementFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                settlementFilter === st
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ đối soát' : 'Đã quyết toán'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.includes(o.id))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3.5 px-4">Mã Vận Đơn</th>
              <th className="py-3.5 px-4">Đối Tác (Shop Gửi)</th>
              <th className="py-3.5 px-4">Người Nhận</th>
              <th className="py-3.5 px-4 text-right">Tiền Thu COD</th>
              <th className="py-3.5 px-4 text-right">Cước Phí Vận Chuyển</th>
              <th className="py-3.5 px-4 text-right">Thực Trả Cho Shop</th>
              <th className="py-3.5 px-4 text-center">Trạng Thái Đối Soát</th>
              <th className="py-3.5 px-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Đang tổng hợp dữ liệu tài chính đối soát...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  Không có đơn hàng nào cần đối soát.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => {
                const isPaid = o.thanh_toan?.trang_thai === 'DA_THANH_TOAN';
                const cod = o.tien_thu_ho_cod || 0;
                const cuoc = o.cuoc_phi_van_chuyen || 0;
                const netPay = Math.max(0, cod - cuoc);

                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(o.id)}
                        onChange={() => handleToggleSelect(o.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      {o.ma_van_don}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{o.nguoi_gui_ten}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{o.nguoi_gui_sdt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{o.nguoi_nhan_ten}</div>
                      <div className="text-[11px] text-slate-400">{o.nguoi_nhan_tinh_thanh}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-amber-600 dark:text-amber-400">
                      {formatVND(cod)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                      {formatVND(cuoc)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatVND(netPay)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã quyết toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> Chờ đối soát
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isPaid && (
                        <button
                          onClick={() => handleSettleOrders([o.id])}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Quyết toán
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
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
        itemLabel="đơn đối soát"
      />
    </div>
  );
};
