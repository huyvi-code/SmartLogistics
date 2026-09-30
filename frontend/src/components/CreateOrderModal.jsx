import React, { useState, useEffect } from 'react';
import { ordersAPI, routesAPI } from '../api';
import { X, Package, Calculator, Check, AlertCircle, Navigation, Sparkles, MapPin, Compass, ArrowRight } from 'lucide-react';

export const ROUTE_CATEGORIES = [
  { key: 'NOI_THANH_HN', title: '🏙️ Tuyến Nội & Ngoại thành Hà Nội' },
  { key: 'MIEN_BAC', title: '🚛 Các Tuyến Liên Tỉnh Miền Bắc' },
  { key: 'BAC_NAM', title: '🚚 Trục Bắc - Nam & Tuyến Liên Miền' },
  { key: 'MIEN_NAM', title: '🌴 Tuyến Miền Nam & Nội Thành TP.HCM' },
  { key: 'MIEN_TRUNG', title: '🌊 Các Tuyến Liên Tỉnh Miền Trung' },
];

export const PROVINCES_BY_REGION = {
  'Miền Bắc': [
    'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hải Dương',
    'Hưng Yên', 'Nam Định', 'Ninh Bình', 'Hà Nam', 'Thái Nguyên',
    'Phú Thọ', 'Vĩnh Phúc', 'Bắc Giang'
  ],
  'Miền Trung': [
    'Đà Nẵng', 'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ngãi', 'Nghệ An',
    'Thanh Hóa', 'Hà Tĩnh', 'Bình Định', 'Khánh Hòa'
  ],
  'Miền Nam': [
    'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu',
    'Long An', 'Tiền Giang', 'Cần Thơ', 'An Giang', 'Kiên Giang', 'Đồng Tháp'
  ]
};

export const findSuggestedRoute = (routes, sendProv, recvProv) => {
  if (!routes || routes.length === 0) return null;
  const s = (sendProv || '').toLowerCase();
  const r = (recvProv || '').toLowerCase();

  // 1. Cùng nội thành / cùng tỉnh
  if (s.includes('hà nội') && r.includes('hà nội')) {
    return routes.find((rt) => rt.ma_tuyen === 'RT-HN-NOITHANH');
  }
  if ((s.includes('hồ chí minh') || s.includes('hcm')) && (r.includes('hồ chí minh') || r.includes('hcm'))) {
    return routes.find((rt) => rt.ma_tuyen === 'RT-HCM-NOITHANH');
  }

  // 2. Điểm xuất phát từ Hà Nội / Miền Bắc
  if (s.includes('hà nội') || ['hải phòng', 'quảng ninh', 'bắc ninh', 'hải dương', 'nam định', 'ninh bình', 'thái nguyên', 'vĩnh phúc'].some((x) => s.includes(x))) {
    if (r.includes('hải phòng')) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-HP');
    if (r.includes('quảng ninh')) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-QN');
    if (['bắc ninh', 'bắc giang', 'hải dương'].some((x) => r.includes(x))) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-BN-BG');
    if (['nam định', 'ninh bình', 'hà nam'].some((x) => r.includes(x))) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-ND-NB');
    if (['thái nguyên', 'phú thọ', 'vĩnh phúc'].some((x) => r.includes(x))) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-TN-PT');

    // Gửi vào Miền Nam (Bắc - Nam)
    if (['hồ chí minh', 'hcm', 'bình dương', 'đồng nai', 'cần thơ', 'vũng tàu', 'long an', 'tiền giang', 'an giang', 'kiên giang', 'đồng tháp'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HN-HCM');
    }

    // Gửi vào Miền Trung
    if (['đà nẵng', 'huế', 'quảng nam', 'quảng ngãi', 'bình định', 'khánh hòa'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HN-DN');
    }
  }

  // 3. Điểm xuất phát từ TP.HCM / Miền Nam
  if (s.includes('hồ chí minh') || s.includes('hcm') || ['bình dương', 'đồng nai', 'cần thơ', 'long an'].some((x) => s.includes(x))) {
    if (['cần thơ', 'long an', 'tiền giang', 'an giang', 'kiên giang', 'đồng tháp'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HCM-MIENTAY');
    }
    if (['bình dương', 'đồng nai'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HCM-BD-DN');
    }
    if (r.includes('vũng tàu')) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HCM-VT');
    }
    // Gửi ra Bắc
    if (['hà nội', 'hải phòng', 'quảng ninh', 'bắc ninh'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-HN-HCM');
    }
    // Gửi ra Trung
    if (['đà nẵng', 'huế', 'quảng nam', 'khánh hòa'].some((x) => r.includes(x))) {
      return routes.find((rt) => rt.ma_tuyen === 'RT-DN-HCM');
    }
  }

  // 4. Điểm xuất phát từ Miền Trung (Đà Nẵng, Huế...)
  if (s.includes('đà nẵng') || s.includes('huế')) {
    if (r.includes('huế')) return routes.find((rt) => rt.ma_tuyen === 'RT-DN-HUE');
    if (r.includes('quảng nam') || r.includes('quảng ngãi')) return routes.find((rt) => rt.ma_tuyen === 'RT-DN-QN-QNG');
    if (['hà nội', 'hải phòng'].some((x) => r.includes(x))) return routes.find((rt) => rt.ma_tuyen === 'RT-HN-DN');
    if (['hồ chí minh', 'cần thơ'].some((x) => r.includes(x))) return routes.find((rt) => rt.ma_tuyen === 'RT-DN-HCM');
  }

  // Tìm theo diem_dau / diem_cuoi trực tiếp
  const directMatch = routes.find(
    (rt) => rt.diem_dau.toLowerCase().includes(s) && rt.diem_cuoi.toLowerCase().includes(r)
  );
  if (directMatch) return directMatch;

  return null;
};

export const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    nguoi_gui_ten: '',
    nguoi_gui_sdt: '',
    nguoi_gui_dia_chi: '',
    nguoi_gui_tinh_thanh: 'Hà Nội',
    nguoi_nhan_ten: '',
    nguoi_nhan_sdt: '',
    nguoi_nhan_dia_chi: '',
    nguoi_nhan_tinh_thanh: 'Hà Nội',
    khoi_luong_kg: 1.0,
    loai_hang_hoa: 'Bưu phẩm tiêu chuẩn',
    tien_thu_ho_cod: 0,
    muc_do_uu_tien: 'CHUAN',
    tuyen_giao_id: '',
    ghi_chu: '',
  });

  const [routes, setRoutes] = useState([]);
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedRoute, setSuggestedRoute] = useState(null);
  const [isManualRoute, setIsManualRoute] = useState(false);

  useEffect(() => {
    if (isOpen) {
      routesAPI.getAll().then(setRoutes).catch(console.error);
    }
  }, [isOpen]);

  // Tự động phân tích và gợi ý tuyến phù hợp theo tỉnh gửi - nhận
  useEffect(() => {
    if (!routes || routes.length === 0) return;
    const match = findSuggestedRoute(routes, formData.nguoi_gui_tinh_thanh, formData.nguoi_nhan_tinh_thanh);
    setSuggestedRoute(match || null);

    if (!isManualRoute && match) {
      setFormData((prev) => ({ ...prev, tuyen_giao_id: String(match.id) }));
    }
  }, [formData.nguoi_gui_tinh_thanh, formData.nguoi_nhan_tinh_thanh, routes, isManualRoute]);

  useEffect(() => {
    if (!isOpen) return;
    const calc = async () => {
      try {
        const fee = await ordersAPI.calculateFee({
          tinh_thanh_gui: formData.nguoi_gui_tinh_thanh,
          tinh_thanh_nhan: formData.nguoi_nhan_tinh_thanh,
          khoi_luong_kg: parseFloat(formData.khoi_luong_kg) || 1.0,
          tien_thu_ho_cod: parseFloat(formData.tien_thu_ho_cod) || 0,
        });
        setCalculatedFee(fee);
      } catch (err) {
        console.error('Lỗi tính cước tạm tính:', err);
      }
    };
    calc();
  }, [
    formData.nguoi_gui_tinh_thanh,
    formData.nguoi_nhan_tinh_thanh,
    formData.khoi_luong_kg,
    formData.tien_thu_ho_cod,
    isOpen,
  ]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        khoi_luong_kg: parseFloat(formData.khoi_luong_kg),
        tien_thu_ho_cod: parseFloat(formData.tien_thu_ho_cod),
        tuyen_giao_id: formData.tuyen_giao_id ? parseInt(formData.tuyen_giao_id) : null,
        cuoc_phi_van_chuyen: calculatedFee?.cuoc_phi_van_chuyen || 25000,
        tong_tien_thu: calculatedFee?.tong_tien_thu || 25000,
      };

      await ordersAPI.create(payload);
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tạo Đơn Giao Hàng Mới</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nhập đầy đủ thông tin gửi/nhận và hệ thống sẽ tự động tính cước vận chuyển</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột gửi */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">1. Thông Tin Người Gửi</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ tên người gửi *</label>
                <input
                  type="text"
                  name="nguoi_gui_ten"
                  required
                  placeholder="Ví dụ: Công ty Thời Trang An Nam"
                  value={formData.nguoi_gui_ten}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  name="nguoi_gui_sdt"
                  required
                  placeholder="0901234567"
                  value={formData.nguoi_gui_sdt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành *</label>
                  <select
                    name="nguoi_gui_tinh_thanh"
                    value={formData.nguoi_gui_tinh_thanh}
                    onChange={(e) => {
                      handleChange(e);
                      setIsManualRoute(false);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    {Object.entries(PROVINCES_BY_REGION).map(([region, provs]) => (
                      <optgroup key={region} label={`-- ${region} --`}>
                        {provs.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    name="nguoi_gui_dia_chi"
                    required
                    placeholder="Số 45 Tràng Tiền"
                    value={formData.nguoi_gui_dia_chi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Cột nhận */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">2. Thông Tin Người Nhận</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  name="nguoi_nhan_ten"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.nguoi_nhan_ten}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  name="nguoi_nhan_sdt"
                  required
                  placeholder="0988112233"
                  value={formData.nguoi_nhan_sdt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành *</label>
                  <select
                    name="nguoi_nhan_tinh_thanh"
                    value={formData.nguoi_nhan_tinh_thanh}
                    onChange={(e) => {
                      handleChange(e);
                      setIsManualRoute(false);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    {Object.entries(PROVINCES_BY_REGION).map(([region, provs]) => (
                      <optgroup key={region} label={`-- ${region} --`}>
                        {provs.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    name="nguoi_nhan_dia_chi"
                    required
                    placeholder="10 Phạm Văn Bạch, Cầu Giấy"
                    value={formData.nguoi_nhan_dia_chi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết hàng hóa & Cước phí */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">3. Chi Tiết Hàng Hóa & Cước Phí</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Loại hàng hóa</label>
                <input
                  type="text"
                  name="loai_hang_hoa"
                  value={formData.loai_hang_hoa}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Khối lượng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="khoi_luong_kg"
                  value={formData.khoi_luong_kg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tiền thu hộ COD (VNĐ)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  name="tien_thu_ho_cod"
                  value={formData.tien_thu_ho_cod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mức độ ưu tiên</label>
                <select
                  name="muc_do_uu_tien"
                  value={formData.muc_do_uu_tien}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="CHUAN">Tiêu chuẩn (Giao tiết kiệm)</option>
                  <option value="CAO">Ưu tiên cao (Trong ngày)</option>
                  <option value="HOA_TOC">Hỏa tốc (Giao ngay 2h)</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tuyến vận chuyển phù hợp
                  </label>
                  {suggestedRoute && (
                    <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                      Gợi ý tự động
                    </span>
                  )}
                </div>
                <select
                  name="tuyen_giao_id"
                  value={formData.tuyen_giao_id}
                  onChange={(e) => {
                    setIsManualRoute(true);
                    handleChange(e);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Tự động chọn theo lộ trình --</option>
                  {ROUTE_CATEGORIES.map((cat) => {
                    const catRoutes = routes.filter((r) => r.khu_vuc === cat.key);
                    if (catRoutes.length === 0) return null;
                    return (
                      <optgroup key={cat.key} label={cat.title}>
                        {catRoutes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.ma_tuyen} - {r.ten_tuyen} ({r.cu_ly_km} km)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>

                {/* Gợi ý tuyến thông minh theo lộ trình */}
                {suggestedRoute && String(formData.tuyen_giao_id) !== String(suggestedRoute.id) && (
                  <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                      <Navigation className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      Lộ trình khớp: <strong>{suggestedRoute.ten_tuyen}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualRoute(false);
                        setFormData((prev) => ({ ...prev, tuyen_giao_id: String(suggestedRoute.id) }));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 text-[11px] shrink-0 ml-2 cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}

                {/* Chi tiết tuyến đã chọn */}
                {(() => {
                  const sel = routes.find((r) => String(r.id) === String(formData.tuyen_giao_id));
                  if (!sel) return null;
                  return (
                    <div className="mt-2 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Compass className="w-3.5 h-3.5" />
                          {sel.ma_tuyen}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          Lộ trình: {sel.diem_dau} ➜ {sel.diem_cuoi}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Cự ly: <strong className="text-slate-700 dark:text-slate-300">{sel.cu_ly_km} km</strong></span>
                        <span>•</span>
                        <span>Dự kiến: <strong className="text-slate-700 dark:text-slate-300">~{sel.thoi_gian_uoc_tinh_gio} giờ</strong></span>
                        <span>•</span>
                        <span>Cước cơ sở: <strong className="text-slate-700 dark:text-slate-300">{formatVND(sel.gia_cuoc_co_ban)}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bảng tính cước thông minh */}
            {calculatedFee && (
              <div className="mt-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Cước cơ bản: <span className="font-bold text-slate-900 dark:text-white">{formatVND(calculatedFee.phi_co_ban)}</span> | Phí khối lượng: <span className="font-bold text-slate-900 dark:text-white">{formatVND(calculatedFee.phi_khoi_luong)}</span> | Phí COD: <span className="font-bold text-slate-900 dark:text-white">{formatVND(calculatedFee.phi_cod)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Công thức: Cước cơ bản + (vượt 1kg × 5k/kg) + (COD × 1%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tổng cước vận chuyển:</div>
                  <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                    {formatVND(calculatedFee.cuoc_phi_van_chuyen)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang tạo đơn...' : 'Xác Nhận Tạo Đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
