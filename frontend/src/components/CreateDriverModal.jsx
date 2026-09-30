import React, { useState, useEffect } from 'react';
import { driversAPI } from '../api';
import {
  Truck, X, User, Phone, FileText, Scale, Mail, Lock,
  CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export const CreateDriverModal = ({ isOpen, onClose, onDriverCreated }) => {
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [soGplx, setSoGplx] = useState('');
  const [loaiXe, setLoaiXe] = useState('Xe tải 1.25 Tấn');
  const [bienSoXe, setBienSoXe] = useState('');
  const [taiTrongKg, setTaiTrongKg] = useState('1250');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('driver123');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ESC key closing mechanism
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setHoTen('');
      setSoDienThoai('');
      setSoGplx('');
      setLoaiXe('Xe tải 1.25 Tấn');
      setBienSoXe('');
      setTaiTrongKg('1250');
      setEmail('');
      setPassword('driver123');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Auto set payload based on vehicle type
  const handleVehicleTypeChange = (type) => {
    setLoaiXe(type);
    if (type.includes('1.25 Tấn')) setTaiTrongKg('1250');
    else if (type.includes('2.5 Tấn')) setTaiTrongKg('2500');
    else if (type.includes('5 Tấn')) setTaiTrongKg('5000');
    else if (type.includes('850kg') || type.includes('Van')) setTaiTrongKg('850');
    else if (type.includes('Xe máy')) setTaiTrongKg('150');
  };

  // Auto suggest email based on driver name or license plate
  const handlePlateChange = (val) => {
    setBienSoXe(val);
    const cleanPlate = val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanPlate && !email) {
      setEmail(`driver_${cleanPlate}@smartlog.vn`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hoTen.trim() || !soDienThoai.trim() || !soGplx.trim() || !bienSoXe.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ho_ten: hoTen.trim(),
        so_dien_thoai: soDienThoai.trim(),
        so_gplx: soGplx.trim().toUpperCase(),
        loai_xe: loaiXe,
        bien_so_xe: bienSoXe.trim().toUpperCase(),
        tai_trong_kg: parseFloat(taiTrongKg) || 1250.0,
        trang_thai_hoat_dong: 'SAN_SANG',
        danh_gia: 5.0,
        email: email.trim() ? email.trim() : undefined,
        password: password.trim() ? password.trim() : undefined,
      };

      const newDriver = await driversAPI.create(payload);
      setSuccess(`Đã tạo thành công tài xế ${newDriver.ho_ten} (${newDriver.bien_so_xe})!`);
      setTimeout(() => {
        if (onDriverCreated) onDriverCreated(newDriver);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tạo mới tài xế. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Mới Tài Xế & Phương Tiện
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cấp hồ sơ lái xe, định mức tải trọng và tài khoản truy cập hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên Tài Xế <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="VD: Hoàng Văn Đức"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="VD: 0987654321"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Giấy Phép Lái Xe (GPLX) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="VD: B2-582914"
                  value={soGplx}
                  onChange={(e) => setSoGplx(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Biển Kiểm Soát Xe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="VD: 29C-998.77"
                  value={bienSoXe}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Loại Phương Tiện
              </label>
              <select
                value={loaiXe}
                onChange={(e) => handleVehicleTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Xe tải 1.25 Tấn">Xe tải 1.25 Tấn (Nội thành &amp; Ngoại thành)</option>
                <option value="Xe tải 2.5 Tấn">Xe tải 2.5 Tấn (Liên tỉnh &amp; Tuyến trục)</option>
                <option value="Xe tải 5 Tấn">Xe tải 5 Tấn (Bắc - Nam đường dài)</option>
                <option value="Xe Van 850kg">Xe Van 850kg (Giao hẻm phố cấm giờ)</option>
                <option value="Xe máy 150kg">Xe máy giao hàng nhanh (Nội ô)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tải Trọng Tối Đa (kg)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  step="50"
                  required
                  value={taiTrongKg}
                  onChange={(e) => setTaiTrongKg(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Account Login Credentials */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Tài Khoản Đăng Nhập Cổng Tài Xế (Driver Portal)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Đăng Nhập
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="driver@smartlog.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mật Khẩu Khởi Tạo
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="driver123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Tài xế có thể đăng nhập bằng email này tại trang chủ để xem vận đơn được giao và quét ký nhận POD.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu hồ sơ...</span>
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5" />
                  <span>Lưu &amp; Kích Hoạt Tài Xế</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
