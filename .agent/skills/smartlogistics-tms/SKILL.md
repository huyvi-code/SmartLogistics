---
name: smartlogistics-tms
description: >-
  Hướng dẫn toàn diện về quy trình vận hành, phát triển, gỡ lỗi và mở rộng hệ thống SmartLogistics TMS
  (Transportation Management System). Kích hoạt skill này khi người dùng yêu cầu phát triển tính năng mới,
  sửa lỗi, kiểm tra cơ sở dữ liệu, quản lý tuyến vận chuyển, tính cước phí, điều phối tài xế hoặc tích hợp AI.
---

# SmartLogistics TMS - Development & Operations Skill

Tài liệu hướng dẫn nghiệp vụ và kỹ thuật dành cho AI Assistant và Lập trình viên khi làm việc với codebase **SmartLogistics TMS**.

---

## 1. Kiến Trúc Tổng Thể & Công Nghệ

* **Backend:** FastAPI (Python 3.10+), SQLAlchemy ORM, Pydantic v2, SQLite (`backend/smart_logistics.db`).
  - Đường dẫn SQLite được giải quyết tuyệt đối (`config.py`) nhằm đảm bảo ứng dụng luôn kết nối đúng file cơ sở dữ liệu bất kể chạy từ thư mục nào.
* **Frontend:** React 18, Vite, Tailwind CSS (v4), Lucide React Icons.
* **Authentication & RBAC:** JWT (JSON Web Token) Bearer Token, mã hóa bcrypt, phân quyền 3 vai trò:
  - `QUAN_LY`: Quản trị viên, điều phối mạng lưới, quản lý đội xe, phân tuyến, đối soát COD.
  - `TAI_XE`: Tài xế giao nhận, cập nhật trạng thái đơn, ký nhận POD, báo cáo sự cố hiện trường.
  - `KHACH_HANG`: Doanh nghiệp / chủ shop tạo đơn, tính cước tự động, in tem nhãn nhiệt A6 barcode.
* **AI Core:** Google Gemini API (fallback tự động sang Local Smart NLP / Heuristics Engine khi không có API Key).

---

## 2. Quy Trình Khởi Động & Kiểm Thử (Startup & Test Runbook)

### 2.1. Backend Service
* **Môi trường ảo:** `backend/venv` (Python 3.10+).
* **Lệnh khởi chạy:**
  ```powershell
  cd D:\SmartLogistics\backend
  .\venv\Scripts\Activate.ps1
  uvicorn main:app --reload --port 8000
  ```
* **Cổng dịch vụ:** `http://127.0.0.1:8000`
* **Swagger API Docs:** `http://127.0.0.1:8000/docs`
* **Health Check Endpoint:** `http://127.0.0.1:8000/health`

### 2.2. Frontend Service
* **Lưu ý trên Windows:** Dùng `cmd /c` khi chạy npm script nếu PowerShell bị chặn ExecutionPolicy:
  ```powershell
  cd D:\SmartLogistics\frontend
  cmd /c "npm run dev"
  ```
* **Kiểm tra cú pháp & build:**
  ```powershell
  cd D:\SmartLogistics\frontend
  cmd /c "npm run build"
  ```
* **Cổng giao diện:** `http://localhost:5173`

---

## 3. Quản Lý Tuyến Đường & Khớp Tuyến Tự Động (Routes & Auto-Match Engine)

### 3.1. Phân nhóm tuyến (`khu_vuc` trong bảng `tuyen_giao`)
Hệ thống quản lý 16 tuyến vận chuyển toàn quốc chia thành 5 nhóm:
* `NOI_THANH_HN`: Tuyến Nội & Ngoại thành Hà Nội (`RT-HN-NOITHANH`, `RT-HN-NGOITHANH`).
* `MIEN_BAC`: Các tuyến liên tỉnh Miền Bắc (`RT-HN-HP`, `RT-HN-QN`, `RT-HN-BN-BG`, `RT-HN-ND-NB`, `RT-HN-TN-PT`).
* `BAC_NAM`: Trục Bắc – Nam & Tuyến liên miền (`RT-HN-HCM`, `RT-HN-DN`, `RT-DN-HCM`).
* `MIEN_NAM`: Tuyến Miền Nam & Nội thành TP.HCM (`RT-HCM-NOITHANH`, `RT-HCM-BD-DN`, `RT-HCM-MIENTAY`, `RT-HCM-VT`).
* `MIEN_TRUNG`: Các tuyến liên tỉnh Miền Trung (`RT-DN-HUE`, `RT-DN-QN-QNG`).

### 3.2. Thuật toán Auto-Match Khớp Tuyến
* Được định nghĩa tại hàm `findSuggestedRoute(routes, sendProv, recvProv)` trong `frontend/src/components/CreateOrderModal.jsx`.
* Tự động phát hiện cặp tỉnh gửi - nhận để gán tuyến tối ưu (ví dụ gửi từ Bắc vào Nam tự động đề xuất `RT-HN-HCM`).
* Hiển thị chi tiết cự ly (`cu_ly_km`), thời gian ước tính (`thoi_gian_uoc_tinh_gio`) và cước chuẩn (`gia_cuoc_co_ban`).

---

## 4. Thuật Toán Tính Cước Vận Chuyển Đa Vùng Miền (`fee_service.py`)

$$\text{Tổng cước} = \text{Phí cơ bản} + \text{Phí khối lượng vượt mức} + \text{Phí COD}$$

1. **Phí cơ bản:**
   * Nội tỉnh / cùng thành phố: `22.000 đ`
   * Cùng miền (nội miền Bắc hoặc nội miền Nam): `35.000 đ`
   * Liên miền lân cận (Bắc – Trung, Trung – Nam): `55.000 đ`
   * Trục Bắc – Nam xuyên Việt: `75.000 đ`
2. **Phí khối lượng vượt mức:** $> 1.0 \text{ kg}$, mỗi kg vượt tính `5.000 đ/kg`.
3. **Phí COD:** $1\%$ giá trị tiền thu hộ COD.

---

## 5. Quản Lý Đội Xe & Thêm Mới Tài Xế (`CreateDriverModal.jsx`)

* **Quản trị đội xe (`FleetManagement.jsx`):** Giám sát trạng thái hoạt động, tải trọng đang chở thực tế, tỷ lệ đầy thùng xe và số tiền COD đang giữ.
* **Quy trình thêm tài xế mới (`POST /api/drivers`):**
  - Mở modal qua nút `+ Thêm Tài Xế Mới`.
  - Nhập thông tin: Họ tên, SĐT, Số GPLX, Biển kiểm soát, Loại xe & Tải trọng định mức.
  - Tự động cấp tài khoản đăng nhập: Nếu nhập email/mật khẩu, hệ thống tự động khởi tạo bản ghi trong bảng `users` với vai trò `TAI_XE` và gắn kết `user_id`.
  - Tài xế mới có thể đăng nhập ngay vào **Driver Portal** mà không cần qua bước kích hoạt thủ công.

---

## 6. Đăng Ký Khách Hàng Tự Động Onboarding (`LoginPage.jsx`)

* **Luồng đăng ký khách hàng (`POST /api/auth/register`):**
  - Nút chuyển đổi nhanh *"Đăng ký tài khoản doanh nghiệp ngay"* trên trang đăng nhập.
  - Thu thập: Tên doanh nghiệp/người gửi, SĐT, Email, Mật khẩu, Tỉnh/thành kho gửi và Địa chỉ chi tiết.
  - Tự động tạo đồng thời bản ghi trong bảng `users` (`vai_tro = KHACH_HANG`) và bảng `khach_hang`.
  - **Tự động đăng nhập (Auto-login):** Cấp JWT token và đưa khách hàng thẳng vào **Customer Portal** để bắt đầu tạo đơn hàng ngay lập tức.

---

## 7. Tiện Ích POD Điện Tử & In Tem Barcode A6

1. **Bằng chứng giao hàng điện tử POD (`PodSignatureModal.jsx`):**
   * Cho phép tài xế chụp ảnh hiện trường hoặc lưu ghi chú giao nhận khi hoàn tất bưu phẩm.
2. **In tem nhãn nhiệt A6 (`PrintShippingLabelModal.jsx`):**
   * Định dạng chuẩn bưu chính kích thước A6 (100x150mm).
   * Tạo mã vạch Code128 trực quan bằng SVG, bảng phân vùng tuyến, thông tin COD và chữ ký người nhận.

---

## 8. Bộ 3 Module AI & Thuật Toán Thông Minh

1. **Chatbot CSKH & Tra Cứu Vận Đơn (`AIChatWidget.jsx`):**
   * Tự động trích xuất mã vận đơn dạng `VN2026-xxxx` hoặc 4 chữ số cuối.
   * Truy vấn database và render widget thẻ vận đơn trực quan.
2. **AI Chẩn Đoán Sự Cố Hiện Trường (`ai_service.py`):**
   * Đánh giá mức độ nghiêm trọng (`THAP`, `TRUNG_BINH`, `CAO`, `KHAN_CAP`).
   * Đưa ra nguyên nhân cốt lõi và 3 bước khắc phục cụ thể cho điều phối viên.
3. **AI Gợi Ý Phân Công Tài Xế Tối Ưu (`AssignDriverModal.jsx`):**
   * Thuật toán Match Score ($0\% - 99\%$) dựa trên: Sẵn sàng + Tải trọng xe còn trống + Cân bằng tải ca giao + Khớp tuyến đường + Điểm đánh giá uy tín (Rating).

---

## 9. Thiết Kế Cơ Sở Dữ Liệu (8 Bảng)

| Tên Bảng | Model Class | Chức Năng Chính |
| :--- | :--- | :--- |
| `users` | `User` | Tài khoản, mật khẩu bcrypt, vai trò RBAC |
| `tai_xe` | `TaiXe` | Hồ sơ lái xe, loại xe, biển số, tải trọng (`tai_trong_kg`), trạng thái, liên kết `user_id` |
| `tuyen_giao` | `TuyenGiao` | Tuyến vận chuyển, cự ly km, thời gian, cước cơ bản, vùng miền (`khu_vuc`) |
| `don_hang` | `DonHang` | Vận đơn, người gửi/nhận, tiền COD, cước phí, trạng thái, mã tuyến |
| `log_trang_thai` | `LogTrangThai` | Timeline nhật ký hành trình theo thời gian thực |
| `su_co` | `SuCo` | Sự cố phát sinh hiện trường, giải pháp khắc phục |
| `khach_hang` | `KhachHang` | Danh bạ khách hàng / đối tác doanh nghiệp, địa chỉ kho gửi |
| `thanh_toan` | `ThanhToan` | Phương thức thanh toán, tiền COD, trạng thái quyết toán |

---

## 10. Tài Khoản Kiểm Thử Mẫu (Demo Credentials)

* **Điều phối / Quản lý:** `admin@smartlog.vn` / `admin123`
* **Tài xế 1 (1.25 Tấn):** `driver1@smartlog.vn` / `driver123`
* **Tài xế 2 (2.5 Tấn):** `driver2@smartlog.vn` / `driver123`
* **Tài xế 3 (Xe Van 850kg):** `driver3@smartlog.vn` / `driver123`
* **Khách hàng doanh nghiệp:** `customer@smartlog.vn` / `customer123`

---

## 11. Nguyên Tắc Sửa Đổi Mã Nguồn (Coding Standards)

1. **Bảo toàn tính nhất quán:** Khi thêm tuyến mới, cập nhật đồng thời ở `seed_data.py`, `smart_logistics.db`, và logic khớp tuyến ở frontend `CreateOrderModal.jsx`.
2. **Tránh can thiệp venv/node_modules:** Không chạy các lệnh đệ quy sâu không giới hạn vào `venv` hoặc `node_modules`.
3. **UX Modal:** Mọi modal popup phải hỗ trợ đủ 3 cơ chế đóng: nút `✕`, click backdrop bên ngoài và phím `Esc`.
4. **Xử lý lỗi kết nối:** Luôn phân biệt rõ giữa lỗi xác thực (401) và lỗi mất kết nối máy chủ (Network Error) để hướng dẫn người dùng chính xác.
