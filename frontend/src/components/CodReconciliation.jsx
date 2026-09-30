import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { exportReconciliationToCSV } from '../utils/exportUtils';
import {
  DollarSign, Download, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Search, Filter, ShieldCheck, ArrowUpRight, ArrowDownLeft, Building
} from 'lucide-react';

export const CodReconciliation = ({ onSettlementChanged }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

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

  // Tính toán chỉ số tài chính
  const totalCodGenerated = codOrders.reduce((acc, o) => acc + (o.tien_thu_ho_cod || 0), 0);
  const collectedCod = codOrders
    .filter((o) => o.trang_thai === 'GIAO_THANH_CONG')
    .reduce((acc, o) => acc + (o.tien_thu_ho_cod || 0), 0);
  const inTransitCod = codOrders
    .filter((o) => ['DANG_GIAO', 'DA_LAY_HANG'].includes(o.trang_thai))
    .reduce((acc, o) => acc + (o.tien_thu_ho_cod || 0), 0);
  const totalShippingFee = orders.reduce((acc, o) => acc + (o.cuoc_phi_van_chuyen || 0), 0);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
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
        // Cập nhật trạng thái đơn sang thành công nếu cần, hoặc ghi log quyết toán
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Trung Tâm Đối Soát Tài Chính & Thu Hộ COD
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Quyết toán tự động
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Minh bạch dòng tiền bưu chính, cấn trừ cước tự động và chi trả tiền thu hộ định kỳ cho đối tác
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
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

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Tổng Tiền COD Phát Sinh</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatVND(totalCodGenerated)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Toàn bộ đơn hàng có thu tiền hộ</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>COD Đã Thu Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatVND(collectedCod)}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Đã vào tài khoản quỹ bưu cục</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>COD Đang Lưu Thông</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatVND(inTransitCod)}
          </div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Tài xế đang giữ hoặc trên đường</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Doanh Thu Cước Vận Chuyển</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatVND(totalShippingFee)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Đã bao gồm thuế GTGT 8%</div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => setSettlementFilter(st)}
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
                  checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
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
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  Không có đơn hàng nào cần đối soát.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
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
    </div>
  );
};
