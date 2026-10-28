/**
 * SmartLogistics TMS - Bộ công cụ xuất báo cáo Excel (.xlsx chuẩn OpenXML)
 * Tạo bảng tính có định dạng cột, độ rộng tự động, kẻ khung (borders),
 * màu tiêu đề, định dạng số tiền VNĐ và dòng tổng cộng rõ ràng.
 */

// Bảng tính CRC32 chuẩn cho định dạng ZIP (.xlsx)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// Đóng gói danh sách file XML thành file ZIP (.xlsx) không nén (STORE)
const createZipBlob = (files) => {
  const encoder = new TextEncoder();
  const fileRecords = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    // Local File Header (30 bytes + file name)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // Signature
    view.setUint16(4, 20, true); // Version needed (2.0)
    view.setUint16(6, 0x0800, true); // UTF-8 flag
    view.setUint16(8, 0, true); // Compression: 0 (STORE)
    view.setUint16(10, 0, true); // Mod time
    view.setUint16(12, 0, true); // Mod date
    view.setUint32(14, crc, true); // CRC-32
    view.setUint32(18, dataBytes.length, true); // Compressed size
    view.setUint32(22, dataBytes.length, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // Filename length
    view.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    fileRecords.push({
      nameBytes,
      dataBytes,
      crc,
      localHeader,
      offset,
    });

    offset += localHeader.length + dataBytes.length;
  }

  // Central Directory
  const centralParts = [];
  let centralSize = 0;

  for (const rec of fileRecords) {
    const centralHeader = new Uint8Array(46 + rec.nameBytes.length);
    const view = new DataView(centralHeader.buffer);
    view.setUint32(0, 0x02014b50, true); // Central directory signature
    view.setUint16(4, 20, true); // Version made by
    view.setUint16(6, 20, true); // Version needed
    view.setUint16(8, 0x0800, true); // UTF-8 flag
    view.setUint16(10, 0, true); // Compression: STORE
    view.setUint16(12, 0, true); // Mod time
    view.setUint16(14, 0, true); // Mod date
    view.setUint32(16, rec.crc, true); // CRC32
    view.setUint32(20, rec.dataBytes.length, true); // Compressed size
    view.setUint32(24, rec.dataBytes.length, true); // Uncompressed size
    view.setUint16(28, rec.nameBytes.length, true); // Filename length
    view.setUint16(30, 0, true); // Extra length
    view.setUint16(32, 0, true); // Comment length
    view.setUint16(34, 0, true); // Disk number
    view.setUint16(36, 0, true); // Internal attrs
    view.setUint32(38, 0, true); // External attrs
    view.setUint32(42, rec.offset, true); // Relative offset of local header
    centralHeader.set(rec.nameBytes, 46);

    centralParts.push(centralHeader);
    centralSize += centralHeader.length;
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true); // Disk number
  eocdView.setUint16(6, 0, true); // Start disk
  eocdView.setUint16(8, fileRecords.length, true); // Entries on disk
  eocdView.setUint16(10, fileRecords.length, true); // Total entries
  eocdView.setUint32(12, centralSize, true); // Size of central directory
  eocdView.setUint32(16, offset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  const blobParts = [];
  for (const rec of fileRecords) {
    blobParts.push(rec.localHeader, rec.dataBytes);
  }
  for (const c of centralParts) {
    blobParts.push(c);
  }
  blobParts.push(eocd);

  return new Blob(blobParts, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

const escapeXml = (val) => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Chuyển chỉ số cột (0-based) sang ký tự cột Excel (A, B, ..., Z, AA, AB...)
const getExcelColLetter = (colIndex) => {
  let temp = colIndex + 1;
  let letter = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

/**
 * Style IDs trong xl/styles.xml:
 * 0: Mặc định
 * 1: Tiêu đề lớn báo cáo (14pt Bold, chữ Cam #EA580C)
 * 2: Dòng phụ đề thời gian xuất (10pt Italic, chữ Xám #475569)
 * 3: Header bảng (11pt Bold Trắng, nền Xanh Đen #0F172A, căn giữa, có khung viền)
 * 4: Ô dữ liệu căn trái (10pt, có khung viền, căn dọc giữa)
 * 5: Ô dữ liệu căn giữa (10pt, có khung viền, căn giữa)
 * 6: Ô Mã Vận Đơn in đậm (10pt Bold #EA580C, có khung viền, căn giữa)
 * 7: Ô Số Tiền VNĐ (10pt Bold, định dạng #,##0, căn phải, có khung viền)
 * 8: Ô Khối Lượng kg (10pt, định dạng 0.0, căn phải, có khung viền)
 * 9: Dòng Tổng Cộng - Nhãn (11pt Bold, nền Cam nhạt #FFEDD5, căn giữa, có khung viền)
 * 10: Dòng Tổng Cộng - Số tiền (11pt Bold #C2410C, định dạng #,##0, nền Cam nhạt #FFEDD5, căn phải, có khung viền)
 * 11: Dòng Tổng Cộng - Khối lượng (11pt Bold, định dạng 0.0, nền Cam nhạt #FFEDD5, căn phải, có khung viền)
 */
const buildStylesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="#,##0"/>
    <numFmt numFmtId="165" formatCode="0.0"/>
  </numFmts>
  <fonts count="7">
    <font><sz val="10"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="14"/><color rgb="FFEA580C"/><name val="Arial"/></font>
    <font><i/><sz val="10"/><color rgb="FF475569"/><name val="Arial"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><b/><sz val="10"/><color rgb="FFEA580C"/><name val="Arial"/></font>
    <font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FFC2410C"/><name val="Arial"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFEDD5"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="164" fontId="5" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="164" fontId="6" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
    <xf numFmtId="165" fontId="5" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

const buildCellXml = (colIdx, rowIdx, cellObj) => {
  const ref = `${getExcelColLetter(colIdx)}${rowIdx}`;
  const style = cellObj.style ?? 4;
  if (cellObj.type === 'number') {
    const numVal = Number(cellObj.value) || 0;
    return `<c r="${ref}" s="${style}"><v>${numVal}</v></c>`;
  }
  const textVal = escapeXml(cellObj.value ?? '');
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${textVal}</t></is></c>`;
};

const downloadXlsxWorkbook = ({ sheetName, title, subtitle, columns, dataRows, totalRow, filename }) => {
  const colsXml = columns
    .map((col, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${col.width || 16}" customWidth="1"/>`)
    .join('');

  const xmlRows = [];

  // Dòng 1: Tiêu đề bảng kê
  xmlRows.push(
    `<row r="1" ht="28" customHeight="1">${buildCellXml(0, 1, {
      type: 'string',
      value: title,
      style: 1,
    })}</row>`
  );

  // Dòng 2: Thời gian kết xuất & tổng số bản ghi
  xmlRows.push(
    `<row r="2" ht="20" customHeight="1">${buildCellXml(0, 2, {
      type: 'string',
      value: subtitle,
      style: 2,
    })}</row>`
  );

  // Dòng 4: Header cột
  const headerCellsXml = columns
    .map((col, colIdx) => buildCellXml(colIdx, 4, { type: 'string', value: col.header, style: 3 }))
    .join('');
  xmlRows.push(`<row r="4" ht="28" customHeight="1">${headerCellsXml}</row>`);

  // Các dòng dữ liệu (bắt đầu từ dòng 5)
  dataRows.forEach((rowCells, idx) => {
    const rowNum = 5 + idx;
    const cellsXml = rowCells.map((cell, colIdx) => buildCellXml(colIdx, rowNum, cell)).join('');
    xmlRows.push(`<row r="${rowNum}" ht="22" customHeight="1">${cellsXml}</row>`);
  });

  // Dòng Tổng Cộng cuối bảng (nếu có)
  if (totalRow && totalRow.length > 0) {
    const totalRowNum = 5 + dataRows.length;
    const totalCellsXml = totalRow.map((cell, colIdx) => buildCellXml(colIdx, totalRowNum, cell)).join('');
    xmlRows.push(`<row r="${totalRowNum}" ht="25" customHeight="1">${totalCellsXml}</row>`);
  }

  const lastColLetter = getExcelColLetter(columns.length - 1);
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>${xmlRows.join('')}</sheetData>
  <mergeCells count="2">
    <mergeCell ref="A1:${lastColLetter}1"/>
    <mergeCell ref="A2:${lastColLetter}2"/>
  </mergeCells>
</worksheet>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const blob = createZipBlob([
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: rootRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    { name: 'xl/styles.xml', content: buildStylesXml() },
    { name: 'xl/worksheets/sheet1.xml', content: sheetXml },
  ]);

  const safeFilename = filename.replace(/\.csv$/i, '.xlsx');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportOrdersToCSV = (orders, filename = 'Bang_Ke_Van_Don_SmartLogistics.xlsx') => {
  if (!orders || orders.length === 0) {
    alert('Không có dữ liệu vận đơn để xuất file.');
    return;
  }

  const columns = [
    { header: 'STT', width: 7 },
    { header: 'Mã Vận Đơn', width: 16 },
    { header: 'Ngày Tạo', width: 20 },
    { header: 'Mức Độ Ưu Tiên', width: 15 },
    { header: 'Trạng Thái', width: 18 },
    { header: 'Người Gửi (Shop/Kho)', width: 25 },
    { header: 'SĐT Người Gửi', width: 15 },
    { header: 'Địa Chỉ Gửi', width: 28 },
    { header: 'Tỉnh/TP Gửi', width: 16 },
    { header: 'Người Nhận', width: 22 },
    { header: 'SĐT Người Nhận', width: 15 },
    { header: 'Địa Chỉ Giao Nhận', width: 32 },
    { header: 'Tỉnh/TP Nhận', width: 16 },
    { header: 'Loại Hàng Hóa', width: 22 },
    { header: 'Khối Lượng (kg)', width: 16 },
    { header: 'Tiền Thu Hộ COD (VNĐ)', width: 20 },
    { header: 'Cước Vận Chuyển (VNĐ)', width: 20 },
    { header: 'Tổng Tiền Thu (VNĐ)', width: 20 },
    { header: 'Tài Xế Phụ Trách', width: 20 },
    { header: 'Biển Số Xe', width: 15 },
    { header: 'Tuyến Vận Chuyển', width: 26 },
    { header: 'Đối Soát COD', width: 18 },
    { header: 'Ghi Chú', width: 25 },
  ];

  const statusMap = {
    MOI: 'Mới tiếp nhận',
    DA_LAY_HANG: 'Đã lấy hàng',
    DANG_GIAO: 'Đang giao hàng',
    GIAO_THANH_CONG: 'Giao thành công',
    THAT_BAI: 'Thất bại / Sự cố',
  };

  const priorityMap = {
    HOA_TOC: 'Hỏa tốc',
    CAO: 'Ưu tiên',
    CHUAN: 'Tiêu chuẩn',
  };

  let sumWeight = 0;
  let sumCod = 0;
  let sumFee = 0;
  let sumTotal = 0;

  const dataRows = orders.map((o, idx) => {
    const weight = Number(o.khoi_luong_kg) || 0;
    const cod = Number(o.tien_thu_ho_cod) || 0;
    const fee = Number(o.cuoc_phi_van_chuyen) || 0;
    const total = Number(o.tong_tien_thu) || cod + fee;

    sumWeight += weight;
    sumCod += cod;
    sumFee += fee;
    sumTotal += total;

    return [
      { type: 'number', value: idx + 1, style: 5 },
      { type: 'string', value: o.ma_van_don, style: 6 },
      { type: 'string', value: new Date(o.created_at).toLocaleString('vi-VN'), style: 5 },
      { type: 'string', value: priorityMap[o.muc_do_uu_tien] || o.muc_do_uu_tien, style: 5 },
      { type: 'string', value: statusMap[o.trang_thai] || o.trang_thai, style: 5 },
      { type: 'string', value: o.nguoi_gui_ten, style: 4 },
      { type: 'string', value: o.nguoi_gui_sdt, style: 5 },
      { type: 'string', value: o.nguoi_gui_dia_chi, style: 4 },
      { type: 'string', value: o.nguoi_gui_tinh_thanh, style: 5 },
      { type: 'string', value: o.nguoi_nhan_ten, style: 4 },
      { type: 'string', value: o.nguoi_nhan_sdt, style: 5 },
      { type: 'string', value: o.nguoi_nhan_dia_chi, style: 4 },
      { type: 'string', value: o.nguoi_nhan_tinh_thanh, style: 5 },
      { type: 'string', value: o.loai_hang_hoa, style: 4 },
      { type: 'number', value: Math.round(weight * 10) / 10, style: 8 },
      { type: 'number', value: cod, style: 7 },
      { type: 'number', value: fee, style: 7 },
      { type: 'number', value: total, style: 7 },
      { type: 'string', value: o.tai_xe?.ho_ten || 'Chưa phân công', style: 4 },
      { type: 'string', value: o.tai_xe?.bien_so_xe || '-', style: 5 },
      { type: 'string', value: o.tuyen_giao?.ten_tuyen || o.tuyen_giao_id || '-', style: 4 },
      {
        type: 'string',
        value: o.thanh_toan?.trang_thai === 'DA_THANH_TOAN' ? 'Đã quyết toán' : 'Chưa quyết toán',
        style: 5,
      },
      { type: 'string', value: o.ghi_chu || '', style: 4 },
    ];
  });

  const totalRow = columns.map((_, colIdx) => {
    if (colIdx === 1) return { type: 'string', value: 'TỔNG CỘNG', style: 9 };
    if (colIdx === 14) return { type: 'number', value: Math.round(sumWeight * 10) / 10, style: 11 };
    if (colIdx === 15) return { type: 'number', value: sumCod, style: 10 };
    if (colIdx === 16) return { type: 'number', value: sumFee, style: 10 };
    if (colIdx === 17) return { type: 'number', value: sumTotal, style: 10 };
    return { type: 'string', value: '', style: 9 };
  });

  downloadXlsxWorkbook({
    sheetName: 'Bang_Ke_Van_Don',
    title: 'BẢNG KÊ CHI TIẾT VẬN ĐƠN - HỆ THỐNG SMARTLOGISTICS TMS',
    subtitle: `Thời gian kết xuất: ${new Date().toLocaleString('vi-VN')}  |  Tổng số: ${orders.length} vận đơn`,
    columns,
    dataRows,
    totalRow,
    filename,
  });
};

export const exportReconciliationToCSV = (
  reconciliations,
  filename = 'Bang_Doi_Soat_COD_SmartLogistics.xlsx'
) => {
  if (!reconciliations || reconciliations.length === 0) {
    alert('Không có dữ liệu đối soát để xuất.');
    return;
  }

  const columns = [
    { header: 'STT', width: 7 },
    { header: 'Mã Vận Đơn', width: 16 },
    { header: 'Đối Tác (Shop Gửi)', width: 26 },
    { header: 'SĐT Người Gửi', width: 16 },
    { header: 'Người Nhận', width: 22 },
    { header: 'Tài Xế Thu Hộ', width: 22 },
    { header: 'Tiền Thu Hộ COD (VNĐ)', width: 22 },
    { header: 'Cước Vận Chuyển (VNĐ)', width: 22 },
    { header: 'Thực Trả Cho Shop (VNĐ)', width: 24 },
    { header: 'Trạng Thái Đối Soát', width: 20 },
    { header: 'Trạng Thái Đơn', width: 18 },
    { header: 'Cập Nhật Lúc', width: 20 },
  ];

  let sumCod = 0;
  let sumCuoc = 0;
  let sumNet = 0;

  const dataRows = reconciliations.map((item, idx) => {
    const cod = Number(item.tien_thu_ho_cod) || 0;
    const cuoc = Number(item.cuoc_phi_van_chuyen) || 0;
    const thucTra = Math.max(0, cod - cuoc);

    sumCod += cod;
    sumCuoc += cuoc;
    sumNet += thucTra;

    return [
      { type: 'number', value: idx + 1, style: 5 },
      { type: 'string', value: item.ma_van_don, style: 6 },
      { type: 'string', value: item.nguoi_gui_ten, style: 4 },
      { type: 'string', value: item.nguoi_gui_sdt, style: 5 },
      { type: 'string', value: item.nguoi_nhan_ten, style: 4 },
      { type: 'string', value: item.tai_xe?.ho_ten || 'Chưa phân công', style: 4 },
      { type: 'number', value: cod, style: 7 },
      { type: 'number', value: cuoc, style: 7 },
      { type: 'number', value: thucTra, style: 7 },
      {
        type: 'string',
        value: item.thanh_toan?.trang_thai === 'DA_THANH_TOAN' ? 'Đã quyết toán' : 'Chờ đối soát',
        style: 5,
      },
      { type: 'string', value: item.trang_thai, style: 5 },
      {
        type: 'string',
        value: item.updated_at ? new Date(item.updated_at).toLocaleString('vi-VN') : '-',
        style: 5,
      },
    ];
  });

  const totalRow = columns.map((_, colIdx) => {
    if (colIdx === 1) return { type: 'string', value: 'TỔNG CỘNG', style: 9 };
    if (colIdx === 6) return { type: 'number', value: sumCod, style: 10 };
    if (colIdx === 7) return { type: 'number', value: sumCuoc, style: 10 };
    if (colIdx === 8) return { type: 'number', value: sumNet, style: 10 };
    return { type: 'string', value: '', style: 9 };
  });

  downloadXlsxWorkbook({
    sheetName: 'Bang_Doi_Soat_COD',
    title: 'BẢNG KÊ ĐỐI SOÁT TÀI CHÍNH & THU HỘ COD - SMARTLOGISTICS TMS',
    subtitle: `Thời gian kết xuất: ${new Date().toLocaleString('vi-VN')}  |  Tổng số: ${reconciliations.length} đơn đối soát`,
    columns,
    dataRows,
    totalRow,
    filename,
  });
};
