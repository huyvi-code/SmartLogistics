import React, { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle2, PenTool, RotateCcw, Camera, ShieldCheck,
  AlertTriangle, DollarSign, UserCheck, FileCheck, Image as ImageIcon, Trash2
} from 'lucide-react';

export const PodSignatureModal = ({ isOpen, onClose, order, onConfirmSuccess }) => {
  const [receiverName, setReceiverName] = useState('');
  const [relationship, setRelationship] = useState('Chính chủ nhận hàng');
  const [note, setNote] = useState('');
  const [codCollected, setCodCollected] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (order) {
      setReceiverName(order.nguoi_nhan_ten || '');
      setCodCollected(true);
      setPhotoPreview(null);
      setNote('');
      setHasSignature(false);
    }
  }, [order, isOpen]);

  // Khởi tạo Canvas khi modal mở
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate 900
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  // Lấy tọa độ chuẩn xác trên Canvas hỗ trợ cả Mouse và Touch + Responsive Scale
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX);
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoords(e);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoords(e);
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    startDrawing(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    draw(e);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Xử lý đính kèm hoặc chụp ảnh hiện trường
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Dung lượng ảnh hiện trường không được vượt quá 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      alert('Vui lòng nhập tên người nhận thực tế.');
      return;
    }

    if (order.tien_thu_ho_cod > 0 && !codCollected) {
      alert('Vui lòng xác nhận đã thu đủ số tiền COD trước khi hoàn tất.');
      return;
    }

    setSubmitting(true);
    try {
      // Lấy hình ảnh chữ ký điện tử thực tế dạng PNG DataURL từ Canvas
      const signatureBase64 = hasSignature && canvasRef.current
        ? canvasRef.current.toDataURL('image/png')
        : null;

      // Đóng gói payload POD hoàn chỉnh chứa chữ ký và ảnh hiện trường thực tế
      const podPayload = {
        nguoi_nhan_ten: receiverName.trim(),
        moi_quan_he: relationship,
        chu_ky_base64: signatureBase64,
        anh_hien_truong_base64: photoPreview || null,
        ghi_chu: note.trim() || null,
        tien_thu_ho_cod_da_thu: order.tien_thu_ho_cod || 0
      };

      await onConfirmSuccess(podPayload);
      onClose();
    } catch (err) {
      console.error('Lỗi lưu POD:', err);
      alert('Không thể lưu thông tin ký nhận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Biên Bản Ký Nhận Giao Hàng (POD)
              </h2>
              <p className="text-xs text-slate-500 font-mono">Vận đơn: {order.ma_van_don}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Order Summary Pill */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <div className="text-slate-500 dark:text-slate-400">Địa chỉ giao hàng:</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                {order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh}
              </div>
            </div>
            {order.tien_thu_ho_cod > 0 && (
              <div className="text-right shrink-0 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Tiền thu COD:</div>
                <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                  {formatVND(order.tien_thu_ho_cod)}
                </div>
              </div>
            )}
          </div>

          {/* Receiver Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên Người Nhận Thực Tế *
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nhập họ tên người nhận"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mối Quan Hệ Với Người Nhận
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Chính chủ nhận hàng">Chính chủ nhận hàng</option>
                <option value="Người thân trong gia đình">Người thân trong gia đình</option>
                <option value="Đồng nghiệp / Lễ tân công ty">Đồng nghiệp / Lễ tân công ty</option>
                <option value="Bảo vệ tòa nhà / Hàng xóm">Bảo vệ tòa nhà / Hàng xóm</option>
                <option value="Người được ủy quyền">Người được ủy quyền</option>
              </select>
            </div>
          </div>

          {/* Canvas Ký Tên Điện Tử Của Người Nhận */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-500" /> Chữ Ký Điện Tử Của Người Nhận
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-slate-500 hover:text-red-500 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Ký lại
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={460}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
                className="w-full h-[120px] cursor-crosshair block"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
                  Chạm vuốt hoặc kéo chuột để ký tên trực tiếp vào ô này
                </div>
              )}
            </div>
          </div>

          {/* Chụp ảnh / Đính kèm ảnh bằng chứng giao nhận */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" /> Ảnh Bằng Chứng Giao Hàng (Kiện hàng / Vị trí nhận)
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-100 dark:bg-slate-800 max-h-36 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Ảnh bằng chứng giao hàng"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] flex items-center gap-1 backdrop-blur-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đã đính kèm ảnh thực tế
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800/40 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-blue-500" />
                <span>Chụp ảnh hiện trường hoặc chọn file ảnh</span>
              </button>
            )}
          </div>

          {/* COD Collect Confirmation Checkbox */}
          {order.tien_thu_ho_cod > 0 && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={codCollected}
                onChange={(e) => setCodCollected(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Xác nhận đã thu đủ {formatVND(order.tien_thu_ho_cod)} tiền mặt / chuyển khoản từ khách hàng
              </span>
            </label>
          )}

          {/* Ghi chú phát hàng */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Ghi chú phát hàng thực tế
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Giao tại quầy lễ tân tầng 1, kiện hàng nguyên vẹn"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Đang lưu chữ ký & hoàn tất...' : 'Xác Nhận & Hoàn Tất Đơn Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
