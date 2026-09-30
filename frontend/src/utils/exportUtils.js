/**
 * SmartLogistics TMS - Utility xuất dữ liệu báo cáo sang CSV (tương thích Microsoft Excel với UTF-8 BOM)
 */

export const exportOrdersToCSV = (orders, filename = 'Bang_Ke_Van_Don_SmartLogistics.csv') => {
  if (!orders || orders.length === 0) {
    alert('Không có dữ liệu vận đơn để xuất file.');
    return;
  }

  const headers = [
    'Mã Vận Đơn',
    'Ngày Tạo',
    'Mức Độ Ưu Tiên',
    'Trạng Thái',
    'Người Gửi',
    'SĐT Người Gửi',
    'Địa Chỉ Gửi',
    'Tỉnh Gửi',
    'Người Nhận',
    'SĐT Người Nhận',
    'Địa Chỉ Nhận',
    'Tỉnh Nhận',
    'Loại Hàng',
    'Khối Lượng (kg)',
    'Tiền COD (VNĐ)',
    'Cước Vận Chuyển (VNĐ)',
    'Tổng Tiền Thu (VNĐ)',
    'Tài Xế Phụ Trách',
    'Biển Số Xe',
    'Tuyến Vận Chuyển',
    'Trạng Thái Thanh Toán',
    'Ghi Chú'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const statusMap = {
    'MOI': 'Mới tiếp nhận',
    'DA_LAY_HANG': 'Đã lấy hàng',
    'DANG_GIAO': 'Đang giao hàng',
    'GIAO_THANH_CONG': 'Giao thành công',
    'THAT_BAI': 'Thất bại / Sự cố'
  };

  const priorityMap = {
    'HOA_TOC': 'Hỏa tốc',
    'CAO': 'Ưu tiên',
    'CHUAN': 'Tiêu chuẩn'
  };

  const rows = orders.map((o) => [
    escapeCSV(o.ma_van_don),
    escapeCSV(new Date(o.created_at).toLocaleString('vi-VN')),
    escapeCSV(priorityMap[o.muc_do_uu_tien] || o.muc_do_uu_tien),
    escapeCSV(statusMap[o.trang_thai] || o.trang_thai),
    escapeCSV(o.nguoi_gui_ten),
    escapeCSV(o.nguoi_gui_sdt),
    escapeCSV(o.nguoi_gui_dia_chi),
    escapeCSV(o.nguoi_gui_tinh_thanh),
    escapeCSV(o.nguoi_nhan_ten),
    escapeCSV(o.nguoi_nhan_sdt),
    escapeCSV(o.nguoi_nhan_dia_chi),
    escapeCSV(o.nguoi_nhan_tinh_thanh),
    escapeCSV(o.loai_hang_hoa),
    escapeCSV(o.khoi_luong_kg),
    escapeCSV(o.tien_thu_ho_cod || 0),
    escapeCSV(o.cuoc_phi_van_chuyen || 0),
    escapeCSV(o.tong_tien_thu || 0),
    escapeCSV(o.tai_xe?.ho_ten || 'Chưa gán'),
    escapeCSV(o.tai_xe?.bien_so_xe || ''),
    escapeCSV(o.tuyen_giao?.ten_tuyen || o.tuyen_giao_id || ''),
    escapeCSV(o.thanh_toan?.trang_thai === 'DA_THANH_TOAN' ? 'Đã quyết toán' : 'Chưa quyết toán'),
    escapeCSV(o.ghi_chu || '')
  ].join(','));

  // Thêm UTF-8 BOM (\uFEFF) để Excel hiển thị tiếng Việt có dấu chuẩn 100%
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportReconciliationToCSV = (reconciliations, filename = 'Bang_Doi_Soat_COD_SmartLogistics.csv') => {
  if (!reconciliations || reconciliations.length === 0) {
    alert('Không có dữ liệu đối soát để xuất.');
    return;
  }

  const headers = [
    'Mã Vận Đơn',
    'Khách Hàng (Người Gửi)',
    'SĐT Người Gửi',
    'Người Nhận',
    'Tài Xế Thu Hộ',
    'Tiền Thu Hộ COD (VNĐ)',
    'Cước Vận Chuyển (VNĐ)',
    'Thực Trả Khách Hàng (VNĐ)',
    'Trạng Thái COD',
    'Trạng Thái Đơn',
    'Ngày Giao Thành Công'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reconciliations.map((item) => {
    const cod = item.tien_thu_ho_cod || 0;
    const cuoc = item.cuoc_phi_van_chuyen || 0;
    const thucTra = Math.max(0, cod - cuoc);
    return [
      escapeCSV(item.ma_van_don),
      escapeCSV(item.nguoi_gui_ten),
      escapeCSV(item.nguoi_gui_sdt),
      escapeCSV(item.nguoi_nhan_ten),
      escapeCSV(item.tai_xe?.ho_ten || 'N/A'),
      escapeCSV(cod),
      escapeCSV(cuoc),
      escapeCSV(thucTra),
      escapeCSV(item.thanh_toan?.trang_thai === 'DA_THANH_TOAN' ? 'Đã quyết toán' : 'Chờ đối soát'),
      escapeCSV(item.trang_thai),
      escapeCSV(item.updated_at ? new Date(item.updated_at).toLocaleString('vi-VN') : 'N/A')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
