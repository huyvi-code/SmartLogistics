import React, { useState, useEffect } from 'react';
import { incidentsAPI, aiAPI } from '../api';
import {
  AlertTriangle, CheckCircle2, Clock, Sparkles, RefreshCw,
  Search, ShieldAlert, ArrowRight, User, Phone, Check
} from 'lucide-react';

export const IncidentsCenter = ({ onIncidentsChanged }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('CHUA_XU_LY');
  const [searchTerm, setSearchTerm] = useState('');

  // AI Solution state
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Resolve form
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveText, setResolveText] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentsAPI.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Lỗi lấy sự cố:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleGetAiSolution = async (incident) => {
    setActiveIncidentId(incident.id);
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await aiAPI.suggestIncidentSolution(
        incident.don_hang_id,
        incident.loai_su_co,
        incident.mo_ta
      );
      setAiResult(res);
    } catch (err) {
      alert('Không thể kết nối trợ lý AI lúc này.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolve = async (incidentId) => {
    if (!resolveText.trim()) {
      alert('Vui lòng nhập phương án xử lý.');
      return;
    }
    setSubmittingResolve(true);
    try {
      await incidentsAPI.resolve(incidentId, resolveText.trim());
      setResolvingId(null);
      setResolveText('');
      setAiResult(null);
      fetchIncidents();
      onIncidentsChanged?.();
      alert('Đã cập nhật trạng thái sự cố thành công.');
    } catch (err) {
      alert('Lỗi xử lý sự cố.');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchStatus = statusFilter === 'ALL' || inc.trang_thai === statusFilter;
    const matchSearch =
      inc.loai_su_co.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.mo_ta.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Trung Tâm Ứng Cứu & Xử Lý Sự Cố Hiện Trường
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
              AI Incident Copilot
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tiếp nhận báo cáo hỏng hóc, sai địa chỉ, khách hẹn lại từ tài xế và nhận đề xuất xử lý tối ưu từ AI
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, loại sự cố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['CHUA_XU_LY', 'DA_XU_LY', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-red-500 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'CHUA_XU_LY' ? 'Cần xử lý ngay' : st === 'DA_XU_LY' ? 'Đã giải quyết' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
            Đang tải dữ liệu sự cố hiện trường...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Tuyệt vời! Không có sự cố tồn đọng nào cần xử lý.
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const isPending = inc.trang_thai === 'CHUA_XU_LY';
            return (
              <div
                key={inc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{inc.loai_su_co}</span>
                    <span className="text-xs font-mono text-slate-400">Đơn hàng #{inc.don_hang_id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(inc.thoi_gian_tao).toLocaleString('vi-VN')}
                    </span>
                    {isPending ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                        Chờ điều phối xử lý
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Đã khắc phục
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Mô tả hiện trường:</span>
                  {inc.mo_ta}
                </div>

                {/* Khắc phục nếu đã xử lý */}
                {!isPending && inc.bien_phap_khac_phuc && (
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/20">
                    <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Biện pháp đã thực hiện:
                    </span>
                    {inc.bien_phap_khac_phuc}
                  </div>
                )}

                {/* AI Solution Box */}
                {activeIncidentId === inc.id && (
                  <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" /> Khuyến Nghị Tối Ưu Từ AI Copilot:
                    </div>

                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                        Đang phân tích dữ liệu tuyến và gợi ý phương án cứu hộ...
                      </div>
                    ) : aiResult ? (
                      <div className="space-y-2 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {aiResult.giai_phap_de_xuat}
                        </div>
                        {aiResult.cac_buoc_khac_phuc && (
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                            {aiResult.cac_buoc_khac_phuc.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingId(inc.id);
                            setResolveText(aiResult.giai_phap_de_xuat);
                          }}
                          className="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-[11px] transition cursor-pointer"
                        >
                          Áp dụng phương án này vào báo cáo
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Actions Bar */}
                {isPending && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleGetAiSolution(inc)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Hỏi Trợ Lý AI Khuyến Nghị
                    </button>

                    {resolvingId === inc.id ? (
                      <div className="flex-1 flex items-center gap-2 min-w-[280px]">
                        <input
                          type="text"
                          value={resolveText}
                          onChange={(e) => setResolveText(e.target.value)}
                          placeholder="Nhập hành động điều phối đã thực hiện..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleResolve(inc.id)}
                          disabled={submittingResolve}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolvingId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingId(inc.id);
                          setResolveText('');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Xác nhận đã khắc phục
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
