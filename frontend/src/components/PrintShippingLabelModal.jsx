import React, { useEffect, useRef } from 'react';
import { X, Printer, Download, CheckCircle, Package, Truck, AlertCircle } from 'lucide-react';

/**
 * Utility vẽ thanh Barcode dạng SVG Code 128 mô phỏng sắc nét ở mọi độ phân giải
 */
const SvgBarcode = ({ value, height = 45 }) => {
  // Sinh các vạch barcode dựa trên hash của chuỗi
  const bars = [];
  const hash = value.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  
  // Guard bars ở đầu
  bars.push({ width: 2, space: 1 });
  bars.push({ width: 1, space: 2 });

  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    const w1 = ((c * 3 + i) % 3) + 1;
    const s1 = ((c * 7 + i) % 2) + 1;
    const w2 = ((c * 5 + i) % 3) + 1;
    const s2 = ((c * 2 + i) % 2) + 1;
    bars.push({ width: w1, space: s1 });
    bars.push({ width: w2, space: s2 });
  }

  // Guard bars ở cuối
  bars.push({ width: 2, space: 1 });
  bars.push({ width: 3, space: 0 });

  let currentX = 10;
  return (
    <div className="flex flex-col items-center">
      <svg height={height} width="240" className="overflow-visible">
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width + bar.space + 1.2;
          return (
            <rect
              key={idx}
              x={x}
              y="0"
              width={bar.width + 0.8}
              height={height}
              fill="#000000"
            />
          );
        })}
      </svg>
      <span className="font-mono font-bold tracking-widest text-xs text-black mt-1">{value}</span>
    </div>
  );
};

/**
 * Utility vẽ QR Code SVG mô phỏng tiêu chuẩn
 */
const SvgQrCode = ({ size = 70 }) => (
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

export const PrintShippingLabelModal = ({ isOpen, onClose, orders = [] }) => {
  const printAreaRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !orders || orders.length === 0) return null;

  const orderList = Array.isArray(orders) ? orders : [orders];

  const handlePrint = () => {
    window.print();
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card - Ẩn khi ra lệnh Print thực tế của trình duyệt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:hidden">
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
                Khổ tem chuẩn 100mm x 150mm (A6) tương thích máy in nhiệt bưu chính bóc dán
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
            <div
              key={order.id || index}
              className="bg-white text-black p-5 rounded-lg shadow-lg border border-slate-300 w-[100mm] min-h-[150mm] font-sans text-xs leading-tight flex flex-col justify-between"
              style={{ width: '100mm', minHeight: '150mm', boxSizing: 'border-box' }}
            >
              {/* Header Box */}
              <div>
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-black text-sm">
                      SL
                    </div>
                    <div>
                      <div className="font-black text-sm tracking-tight uppercase">SMARTLOGISTICS B2B</div>
                      <div className="text-[9px] text-gray-700">Hotline: 1900 6868 • www.smartlog.vn</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded">
                      {order.tuyen_giao?.khu_vuc || 'TOÀN QUỐC'}
                    </div>
                    <div className="text-[9px] font-mono mt-0.5 font-bold">
                      {order.tuyen_giao?.ma_tuyen || 'RT-STD'}
                    </div>
                  </div>
                </div>

                {/* Barcode & QR Code Section */}
                <div className="py-2.5 border-b border-black flex items-center justify-between gap-2">
                  <div className="flex-1 flex justify-center">
                    <SvgBarcode value={order.ma_van_don || 'VN2026-0000'} height={40} />
                  </div>
                  <SvgQrCode size={58} />
                </div>

                {/* Routing & Sort Info */}
                <div className="grid grid-cols-2 border-b border-black text-[10px]">
                  <div className="p-1.5 border-r border-black">
                    <span className="text-gray-600 block text-[9px] uppercase font-bold">Bưu cục gửi (Origin Hub):</span>
                    <span className="font-bold text-xs">{order.nguoi_gui_tinh_thanh}</span>
                  </div>
                  <div className="p-1.5 bg-gray-100">
                    <span className="text-gray-600 block text-[9px] uppercase font-bold">Bưu cục phát (Dest Hub):</span>
                    <span className="font-black text-xs text-black">{order.nguoi_nhan_tinh_thanh}</span>
                  </div>
                </div>

                {/* Sender & Receiver Boxes */}
                <div className="grid grid-cols-1 border-b border-black text-[11px]">
                  {/* Người Gửi */}
                  <div className="p-2 border-b border-dashed border-gray-400 bg-gray-50/50">
                    <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase mb-0.5">
                      <span>1. Người Gửi (Shipper):</span>
                      <span className="font-mono">{order.nguoi_gui_sdt}</span>
                    </div>
                    <div className="font-bold">{order.nguoi_gui_ten}</div>
                    <div className="text-[10px] text-gray-800 line-clamp-2">
                      {order.nguoi_gui_dia_chi}, {order.nguoi_gui_tinh_thanh}
                    </div>
                  </div>

                  {/* Người Nhận */}
                  <div className="p-2 bg-yellow-50/40">
                    <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase mb-0.5">
                      <span>2. Người Nhận (Consignee):</span>
                      <span className="font-mono font-bold text-black text-xs">{order.nguoi_nhan_sdt}</span>
                    </div>
                    <div className="font-black text-xs text-black">{order.nguoi_nhan_ten}</div>
                    <div className="text-[11px] font-semibold text-black leading-snug mt-0.5">
                      {order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh}
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="grid grid-cols-3 border-b border-black text-[10px] p-1.5 bg-gray-50">
                  <div>
                    <span className="text-gray-600 block text-[9px]">Khối lượng:</span>
                    <span className="font-bold">{order.khoi_luong_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[9px]">Nội dung:</span>
                    <span className="font-bold truncate block">{order.loai_hang_hoa || 'Bưu phẩm'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[9px]">Dịch vụ:</span>
                    <span className="font-bold uppercase">{order.muc_do_uu_tien || 'CHUẨN'}</span>
                  </div>
                </div>

                {/* COD & Collect Banner - Điểm nhấn quan trọng nhất của bưu tá */}
                <div className="border-b-2 border-black p-2 bg-black text-white text-center">
                  <div className="text-[9px] uppercase tracking-wider font-bold">TIỀN THU HỘ NGƯỜI NHẬN (COD)</div>
                  <div className="text-xl font-black tracking-tight text-amber-300">
                    {formatVND(order.tien_thu_ho_cod)}
                  </div>
                  <div className="text-[9px] text-gray-300">
                    Cước vận chuyển: {formatVND(order.cuoc_phi_van_chuyen)} (Đã gồm VAT)
                  </div>
                </div>

                {/* Courier Note */}
                <div className="p-1.5 border-b border-black text-[10px]">
                  <span className="font-bold uppercase text-[9px] text-gray-700">Chỉ dẫn phát hàng: </span>
                  <span className="font-extrabold text-black">CHO XEM HÀNG - KHÔNG CHO THỬ</span>
                  {order.ghi_chu && <div className="text-[9px] text-gray-700 italic mt-0.5">Ghi chú: {order.ghi_chu}</div>}
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="pt-2 text-[9px]">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="font-bold text-gray-700 uppercase">Chữ ký người gửi</div>
                    <div className="h-10 border border-dashed border-gray-300 mt-1 flex items-end justify-center pb-1 text-gray-400 text-[8px]">
                      (Cam kết hàng hóa hợp lệ)
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-700 uppercase">Chữ ký người nhận</div>
                    <div className="h-10 border border-dashed border-gray-300 mt-1 flex items-end justify-center pb-1 text-gray-400 text-[8px]">
                      (Xác nhận hàng nguyên vẹn)
                    </div>
                  </div>
                </div>
                <div className="text-center text-[8px] text-gray-500 mt-1.5 border-t border-gray-200 pt-1">
                  In từ SmartLogistics TMS • Ngày {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden printable markup injected into DOM exclusively for browser window.print() */}
      <div id="printable-awb-area" className="hidden print:block print:w-full print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-awb-area, #printable-awb-area * {
              visibility: visible;
            }
            #printable-awb-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100mm;
              margin: 0;
              padding: 0;
            }
            .print-page-break {
              page-break-after: always;
              break-after: page;
            }
            @page {
              size: 100mm 150mm;
              margin: 0;
            }
          }
        ` }} />
        {orderList.map((order, idx) => (
          <div
            key={order.id || idx}
            className={`w-[100mm] h-[150mm] p-4 text-black bg-white flex flex-col justify-between font-sans text-xs box-border ${
              idx < orderList.length - 1 ? 'print-page-break' : ''
            }`}
            style={{ width: '100mm', height: '150mm', pageBreakAfter: idx < orderList.length - 1 ? 'always' : 'auto' }}
          >
            <div>
              {/* Header */}
              <div className="border-b-2 border-black pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-black text-sm">
                    SL
                  </div>
                  <div>
                    <div className="font-black text-sm tracking-tight uppercase">SMARTLOGISTICS B2B</div>
                    <div className="text-[8px] text-gray-700">Hotline: 1900 6868 • www.smartlog.vn</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded">
                    {order.tuyen_giao?.khu_vuc || 'TOÀN QUỐC'}
                  </div>
                  <div className="text-[9px] font-mono font-bold mt-0.5">
                    {order.tuyen_giao?.ma_tuyen || 'RT-STD'}
                  </div>
                </div>
              </div>

              {/* Barcode & QR Code */}
              <div className="py-2 border-b border-black flex items-center justify-between gap-1">
                <div className="flex-1 flex justify-center">
                  <SvgBarcode value={order.ma_van_don || 'VN2026-0000'} height={40} />
                </div>
                <SvgQrCode size={52} />
              </div>

              {/* Hub & Destination */}
              <div className="grid grid-cols-2 border-b border-black text-[10px]">
                <div className="p-1 border-r border-black">
                  <span className="text-gray-600 block text-[8px] uppercase font-bold">Bưu cục gửi:</span>
                  <span className="font-bold">{order.nguoi_gui_tinh_thanh}</span>
                </div>
                <div className="p-1 bg-gray-100">
                  <span className="text-gray-600 block text-[8px] uppercase font-bold">Bưu cục nhận:</span>
                  <span className="font-black text-black">{order.nguoi_nhan_tinh_thanh}</span>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 border-b border-black text-[10px]">
                <div className="p-1.5 border-b border-dashed border-gray-400">
                  <div className="flex justify-between font-bold text-gray-700 text-[9px] uppercase">
                    <span>Người gửi:</span>
                    <span className="font-mono">{order.nguoi_gui_sdt}</span>
                  </div>
                  <div className="font-bold">{order.nguoi_gui_ten}</div>
                  <div className="text-[9px] text-gray-700 leading-tight">
                    {order.nguoi_gui_dia_chi}, {order.nguoi_gui_tinh_thanh}
                  </div>
                </div>

                <div className="p-1.5 bg-yellow-50/50">
                  <div className="flex justify-between font-bold text-gray-700 text-[9px] uppercase">
                    <span>Người nhận:</span>
                    <span className="font-mono font-bold text-black text-xs">{order.nguoi_nhan_sdt}</span>
                  </div>
                  <div className="font-black text-xs">{order.nguoi_nhan_ten}</div>
                  <div className="text-[10px] font-bold text-black leading-tight">
                    {order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh}
                  </div>
                </div>
              </div>

              {/* Weight & Goods */}
              <div className="grid grid-cols-3 border-b border-black text-[9px] p-1 bg-gray-50">
                <div>
                  <span className="text-gray-600 block text-[8px]">Khối lượng:</span>
                  <span className="font-bold">{order.khoi_luong_kg} kg</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-[8px]">Nội dung:</span>
                  <span className="font-bold truncate block">{order.loai_hang_hoa || 'Bưu phẩm'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-[8px]">Dịch vụ:</span>
                  <span className="font-bold uppercase">{order.muc_do_uu_tien || 'CHUẨN'}</span>
                </div>
              </div>

              {/* Big COD Banner */}
              <div className="border-b-2 border-black p-1.5 bg-black text-white text-center">
                <div className="text-[8px] uppercase tracking-wider font-bold">TIỀN THU HỘ COD</div>
                <div className="text-lg font-black tracking-tight text-amber-300">
                  {formatVND(order.tien_thu_ho_cod)}
                </div>
                <div className="text-[8px] text-gray-300">
                  Cước: {formatVND(order.cuoc_phi_van_chuyen)}
                </div>
              </div>

              {/* Delivery instructions */}
              <div className="p-1 border-b border-black text-[9px]">
                <span className="font-bold uppercase text-gray-700 text-[8px]">Chỉ dẫn: </span>
                <span className="font-black">CHO XEM HÀNG - KHÔNG CHO THỬ</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-1 text-[8px]">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="font-bold uppercase">Chữ ký người gửi</div>
                  <div className="h-9 border border-dashed border-gray-400 mt-0.5 flex items-end justify-center pb-0.5 text-gray-400 text-[7px]">
                    (Ký, ghi rõ họ tên)
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase">Chữ ký người nhận</div>
                  <div className="h-9 border border-dashed border-gray-400 mt-0.5 flex items-end justify-center pb-0.5 text-gray-400 text-[7px]">
                    (Ký, ghi rõ họ tên)
                  </div>
                </div>
              </div>
              <div className="text-center text-[7px] text-gray-500 mt-1 border-t border-gray-200 pt-0.5">
                SmartLogistics TMS • {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
