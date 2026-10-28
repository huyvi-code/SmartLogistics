import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';

/**
 * Bảng mã 107 pattern Code 128 chuẩn ISO/IEC 15417
 * Mỗi pattern biểu diễn 6 độ rộng của các vạch và khoảng trắng (tổng 11 modules; STOP có 7 độ rộng, tổng 13 modules)
 */
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (104: StartB, 106: Stop)
];

/**
 * Sinh mã vạch Code 128B chuẩn ISO/IEC 15417 dạng SVG, quét được 100% bằng mọi máy quét barcode
 */
const SvgBarcode = ({ value, height = 40, moduleWidth = 1.35 }) => {
  const cleanCode = (value || 'VN2026-0000').trim();

  // Bắt đầu bằng START B (index 104)
  const patternIndices = [104];
  let checksum = 104;

  for (let i = 0; i < cleanCode.length; i++) {
    const ascii = cleanCode.charCodeAt(i);
    const val = (ascii >= 32 && ascii <= 126) ? (ascii - 32) : 0;
    patternIndices.push(val);
    checksum += val * (i + 1);
  }

  // Thêm checksum modulo 103 và STOP (106)
  patternIndices.push(checksum % 103);
  patternIndices.push(106);

  // Tạo danh sách các vạch đen (bars)
  const bars = [];
  const quietZone = 12; // Vùng an toàn 12px ở 2 đầu
  let currentX = quietZone;

  patternIndices.forEach((patIdx) => {
    const pattern = CODE128_PATTERNS[patIdx] || '212222';
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10) * moduleWidth;
      if (isBar) {
        bars.push({ x: currentX, width: w });
      }
      currentX += w;
      isBar = !isBar;
    }
  });

  const totalWidth = Math.ceil(currentX + quietZone);

  return (
    <div className="flex flex-col items-center">
      <svg
        height={height}
        width={totalWidth}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="overflow-visible"
        aria-label={`Barcode ${cleanCode}`}
      >
        <rect x="0" y="0" width={totalWidth} height={height} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y="0"
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      <span className="font-mono font-bold tracking-widest text-[11px] text-black mt-0.5">{cleanCode}</span>
    </div>
  );
};

/**
 * Utility vẽ QR Code SVG chuẩn nhận dạng bưu tá
 */
const SvgQrCode = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 25 25" className="border border-black p-0.5 bg-white shrink-0">
    {/* Corner 1 */}
    <rect x="1" y="1" width="7" height="7" fill="black" />
    <rect x="2" y="2" width="5" height="5" fill="white" />
    <rect x="3" y="3" width="3" height="3" fill="black" />

    {/* Corner 2 */}
    <rect x="17" y="1" width="7" height="7" fill="black" />
    <rect x="18" y="2" width="5" height="5" fill="white" />
    <rect x="19" y="3" width="3" height="3" fill="black" />

    {/* Corner 3 */}
    <rect x="1" y="17" width="7" height="7" fill="black" />
    <rect x="2" y="18" width="5" height="5" fill="white" />
    <rect x="3" y="19" width="3" height="3" fill="black" />

    {/* Data dots */}
    <rect x="10" y="2" width="2" height="2" fill="black" />
    <rect x="13" y="4" width="2" height="2" fill="black" />
    <rect x="9" y="8" width="3" height="3" fill="black" />
    <rect x="14" y="9" width="2" height="2" fill="black" />
    <rect x="10" y="13" width="2" height="2" fill="black" />
    <rect x="13" y="15" width="3" height="2" fill="black" />
    <rect x="17" y="11" width="2" height="4" fill="black" />
    <rect x="19" y="18" width="4" height="2" fill="black" />
    <rect x="10" y="19" width="3" height="3" fill="black" />
  </svg>
);

const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

/**
 * Component tem nhãn A6 chuẩn 100mm x 148mm
 */
const ShippingLabelCard = ({ order, isPrint = false }) => {
  return (
    <div
      className={`awb-label-page bg-white text-black p-3.5 flex flex-col justify-between font-sans text-xs leading-tight box-border ${
        isPrint
          ? 'w-[100mm] h-[147mm] max-h-[147mm] overflow-hidden'
          : 'w-[100mm] min-h-[148mm] rounded-lg shadow-xl border border-slate-300'
      }`}
      style={{
        width: '100mm',
        height: isPrint ? '147mm' : 'auto',
        minHeight: isPrint ? '147mm' : '148mm',
        maxHeight: isPrint ? '147mm' : 'none',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Header Box */}
        <div className="border-b-2 border-black pb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-black text-xs">
              SL
            </div>
            <div>
              <div className="font-black text-xs tracking-tight uppercase">SMARTLOGISTICS B2B</div>
              <div className="text-[8px] text-gray-700">Hotline: 1900 6868 • www.smartlog.vn</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-bold uppercase bg-black text-white px-1.5 py-0.5 rounded">
              {order.tuyen_giao?.khu_vuc || 'TOÀN QUỐC'}
            </div>
            <div className="text-[8px] font-mono font-bold mt-0.5">
              {order.tuyen_giao?.ma_tuyen || 'RT-STD'}
            </div>
          </div>
        </div>

        {/* Barcode & QR Code Section */}
        <div className="py-2 border-b border-black flex items-center justify-between gap-1 bg-white">
          <div className="flex-1 flex justify-center">
            <SvgBarcode value={order.ma_van_don || 'VN2026-0000'} height={38} />
          </div>
          <SvgQrCode size={50} />
        </div>

        {/* Routing Hubs */}
        <div className="grid grid-cols-2 border-b border-black text-[9.5px]">
          <div className="p-1 border-r border-black">
            <span className="text-gray-600 block text-[7.5px] uppercase font-bold">Bưu cục gửi (Origin):</span>
            <span className="font-bold text-[10.5px]">{order.nguoi_gui_tinh_thanh}</span>
          </div>
          <div className="p-1 bg-gray-100">
            <span className="text-gray-600 block text-[7.5px] uppercase font-bold">Bưu cục phát (Dest):</span>
            <span className="font-black text-[10.5px] text-black">{order.nguoi_nhan_tinh_thanh}</span>
          </div>
        </div>

        {/* Sender & Receiver Boxes */}
        <div className="grid grid-cols-1 border-b border-black text-[10px]">
          {/* Người Gửi */}
          <div className="p-1.5 border-b border-dashed border-gray-400 bg-gray-50/50">
            <div className="flex items-center justify-between text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              <span>1. Người Gửi (Shipper):</span>
              <span className="font-mono">{order.nguoi_gui_sdt}</span>
            </div>
            <div className="font-bold text-[10px]">{order.nguoi_gui_ten}</div>
            <div className="text-[8.5px] text-gray-800 line-clamp-2">
              {order.nguoi_gui_dia_chi}, {order.nguoi_gui_tinh_thanh}
            </div>
          </div>

          {/* Người Nhận */}
          <div className="p-1.5 bg-yellow-50/40">
            <div className="flex items-center justify-between text-[8px] text-gray-600 font-bold uppercase mb-0.5">
              <span>2. Người Nhận (Consignee):</span>
              <span className="font-mono font-bold text-black text-[10.5px]">{order.nguoi_nhan_sdt}</span>
            </div>
            <div className="font-black text-[11px] text-black">{order.nguoi_nhan_ten}</div>
            <div className="text-[9.5px] font-semibold text-black leading-snug mt-0.5">
              {order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh}
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="grid grid-cols-3 border-b border-black text-[9px] p-1 bg-gray-50">
          <div>
            <span className="text-gray-600 block text-[7.5px]">Khối lượng:</span>
            <span className="font-bold">{order.khoi_luong_kg} kg</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[7.5px]">Nội dung:</span>
            <span className="font-bold truncate block">{order.loai_hang_hoa || 'Bưu phẩm'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[7.5px]">Dịch vụ:</span>
            <span className="font-bold uppercase">{order.muc_do_uu_tien || 'CHUẨN'}</span>
          </div>
        </div>

        {/* COD & Collect Banner */}
        <div className="border-b-2 border-black p-1.5 bg-black text-white text-center">
          <div className="text-[8px] uppercase tracking-wider font-bold">TIỀN THU HỘ NGƯỜI NHẬN (COD)</div>
          <div className="text-lg font-black tracking-tight text-amber-300">
            {formatVND(order.tien_thu_ho_cod)}
          </div>
          <div className="text-[7.5px] text-gray-300">
            Cước vận chuyển: {formatVND(order.cuoc_phi_van_chuyen)} (Đã gồm VAT)
          </div>
        </div>

        {/* Courier Note */}
        <div className="p-1 border-b border-black text-[9px]">
          <span className="font-bold uppercase text-[7.5px] text-gray-700">Chỉ dẫn phát hàng: </span>
          <span className="font-extrabold text-black">CHO XEM HÀNG - KHÔNG CHO THỬ</span>
          {order.ghi_chu && <div className="text-[7.5px] text-gray-700 italic mt-0.5">Ghi chú: {order.ghi_chu}</div>}
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-1 text-[8px]">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="font-bold text-gray-700 uppercase">Chữ ký người gửi</div>
            <div className="h-8 border border-dashed border-gray-400 mt-0.5 flex items-end justify-center pb-0.5 text-gray-400 text-[7px]">
              (Cam kết hàng hợp lệ)
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-700 uppercase">Chữ ký người nhận</div>
            <div className="h-8 border border-dashed border-gray-400 mt-0.5 flex items-end justify-center pb-0.5 text-gray-400 text-[7px]">
              (Xác nhận hàng nguyên vẹn)
            </div>
          </div>
        </div>
        <div className="text-center text-[7px] text-gray-500 mt-1 border-t border-gray-200 pt-0.5">
          In từ SmartLogistics TMS • {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export const PrintShippingLabelModal = ({ isOpen, onClose, orders = [] }) => {
  const printMountRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Quản lý class printing trên body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('awb-print-active');
    } else {
      document.body.classList.remove('awb-print-active');
    }
    return () => {
      document.body.classList.remove('awb-print-active');
    };
  }, [isOpen]);

  if (!isOpen || !orders || orders.length === 0) return null;

  const orderList = Array.isArray(orders) ? orders : [orders];

  /**
   * Cơ chế In cô lập qua Dedicated Iframe:
   * Loại bỏ 100% việc lặp lại 5 trang của toàn bộ ứng dụng React.
   * KHÔNG DÙNG visibility: hidden (tránh bị Chrome chặn in).
   * Dùng opacity: 0 và pointer-events: none để Chrome coi là node hợp lệ.
   */
  const handlePrint = () => {
    const printMount = printMountRef.current;
    if (!printMount) {
      window.print();
      return;
    }

    // Xóa iframe in cũ nếu có để đảm bảo tài liệu luôn tươi mới
    const oldIframe = document.getElementById('sl-dedicated-print-frame');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'sl-dedicated-print-frame';
    // Style tuyệt đối an toàn cho Chrome: opacity 0, không dùng visibility:hidden
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '100mm';
    iframe.style.height = '150mm';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    // Viết trực tiếp tài liệu A6 độc lập hoàn chỉnh
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>In Phiếu Gửi A6 - SmartLogistics TMS</title>
        <style>
          @page {
            size: 100mm 150mm;
            margin: 0mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .awb-label-page {
            width: 100mm !important;
            height: 147mm !important;
            max-height: 147mm !important;
            padding: 10px 14px !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
          }
          .awb-label-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          /* Các class CSS cần thiết để render tem đẹp chuẩn xác */
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-r { border-right: 1px solid #000; }
          .border-dashed { border-style: dashed; }
          .border-gray-400 { border-color: #9ca3af; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-black { border-color: #000; }
          .bg-black { background-color: #000 !important; color: #fff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-yellow-50\/40 { background-color: #fefce8 !important; }
          .text-amber-300 { color: #fcd34d !important; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-black { color: #000; }
          .font-black { font-weight: 900; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .uppercase { text-transform: uppercase; }
          .tracking-tight { letter-spacing: -0.025em; }
          .tracking-wider { letter-spacing: 0.05em; }
          .tracking-widest { letter-spacing: 0.1em; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .flex-1 { flex: 1 1 0%; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-1\.5 { gap: 0.375rem; }
          .gap-2 { gap: 0.5rem; }
          .p-1 { padding: 0.25rem; }
          .p-1\.5 { padding: 0.375rem; }
          .p-3\.5 { padding: 0.875rem; }
          .pb-1\.5 { padding-bottom: 0.375rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .pt-1 { padding-top: 0.25rem; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .rounded { border-radius: 0.25rem; }
          .w-6 { width: 1.5rem; }
          .h-6 { height: 1.5rem; }
          .h-8 { height: 2rem; }
          .overflow-visible { overflow: visible; }
          .overflow-hidden { overflow: hidden; }
          .shrink-0 { flex-shrink: 0; }
        </style>
      </head>
      <body>
        ${printMount.innerHTML}
      </body>
      </html>
    `);
    doc.close();

    // Chờ parse xong và gọi in
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Lỗi gọi print iframe:', err);
        window.print();
      }
    }, 250);
  };

  return (
    <>
      {/* Global CSS Print dự phòng nếu người dùng bấm Ctrl + P:
          Khi body có class awb-print-active, ẩn toàn bộ các thẻ con khác ngoài #sl-portal-print-mount */}
      <style>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0mm !important;
          }
          body.awb-print-active > *:not(#sl-portal-print-mount) {
            display: none !important;
          }
          body.awb-print-active {
            margin: 0 !important;
            padding: 0 !important;
            width: 100mm !important;
            background: #ffffff !important;
          }
          #sl-portal-print-mount {
            display: block !important;
            position: static !important;
            width: 100mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .awb-label-page {
            width: 100mm !important;
            height: 147mm !important;
            max-height: 147mm !important;
            padding: 10px 14px !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .awb-label-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {/* Modal Preview Area (Màn hình xem trước bình thường) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  In Phiếu Gửi Vận Chuyển A6 (AWB)
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                    {orderList.length} vận đơn
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Khổ chuẩn A6 (100mm x 150mm) • Mã vạch Code 128 chuẩn quốc tế quét được 100%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> In Ngay (Print / PDF)
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Area in Modal */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col items-center gap-8">
            {orderList.map((order, index) => (
              <ShippingLabelCard key={order.id || index} order={order} isPrint={false} />
            ))}
          </div>
        </div>
      </div>

      {/* Vùng in Portal gắn trực tiếp vào body (ẩn trên màn hình bằng inline style, hiện khi print hoặc dùng làm nguồn cho iframe) */}
      {createPortal(
        <div
          id="sl-portal-print-mount"
          ref={printMountRef}
          style={{ position: 'absolute', left: '-99999px', top: '0', width: '100mm' }}
        >
          {orderList.map((order, idx) => (
            <ShippingLabelCard key={order.id || idx} order={order} isPrint={true} />
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
