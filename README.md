# HỆ THỐNG QUẢN LÝ VẬN TẢI GIAO HÀNG TẬP TRUNG TÍCH HỢP TRÍ TUỆ NHÂN TẠO
## (SMARTLOGISTICS TMS - TRANSPORTATION MANAGEMENT SYSTEM ENTERPRISE PLATFORM)

> **Dự án:** Hệ thống Quản trị & Điều hành Vận tải Giao nhận Bưu chính - Hàng hóa (TMS) thế hệ mới  
> **Kiến trúc:** Micro-modular (Backend: FastAPI Python + Frontend: React 18 Vite Tailwind CSS + Database: SQLite / PostgreSQL Ready)  
> **Công nghệ AI:** Google Gemini API + Local Smart Logistics Heuristics & NLP Engine  
> **Phạm vi mạng lưới:** Vận tải toàn quốc (Nội thành Hà Nội, Liên tỉnh Miền Bắc, Trục Bắc – Nam xuyên Việt, Liên tỉnh Miền Trung, Miền Nam & Nội thành TP.HCM)

---

## 📑 MỤC LỤC
1. [Giới thiệu & Mục tiêu Dự án](#1-giới-thiệu--mục-tiêu-dự-án)
2. [Kiến trúc 4 Cổng Thông Tin & Phân Quyền (Portals & RBAC)](#2-kiến-trúc-4-cổng-thông-tin--phân-quyền-portals--rbac)
3. [Mạng Lưới Tuyến Vận Chuyển & Auto-Match Khớp Tuyến](#3-mạng-lưới-tuyến-vận-chuyển--auto-match-khớp-tuyến)
4. [Thuật Toán Tính Cước Đa Vùng Miền (Pricing Engine)](#4-thuật-toán-tính-cước-đa-vùng-miền-pricing-engine)
5. [Quy Trình Nghiệp Vụ Mới: Quản Lý Đội Xe & Đăng Ký Khách Hàng](#5-quy-trình-nghiệp-vụ-mới-quản-lý-đội-xe--đăng-ký-khách-hàng)
6. [Bằng Chứng Giao Hàng POD & In Tem Nhãn Nhiệt A6](#6-bằng-chứng-giao-hàng-pod--in-tem-nhãn-nhiệt-a6)
7. [Bộ 3 Tính Năng AI Đột Phá (AI Core Modules)](#7-bộ-3-tính-năng-ai-đột-phá-ai-core-modules)
8. [Quản Lý Tải Trọng & Nhận Diện "Vận Chuyển Đủ" Của Tài Xế](#8-quản-lý-tải-trọng--nhận-diện-vận-chuyển-đủ-của-tài-xế)
9. [Cấu trúc Thư mục Dự án](#9-cấu-trúc-thư-mục-dự-án)
10. [Thiết kế Cơ sở Dữ liệu (8 Bảng CSDL Chuẩn Hoá)](#10-thiết-kế-cơ-sở-dữ-liệu-8-bảng-csdl-chuẩn-hoá)
11. [Tài khoản Demo Khởi tạo Sẵn (Seed Accounts)](#11-tài-khoản-demo-khởi-tạo-sẵn-seed-accounts)
12. [Danh mục RESTful API Chi tiết](#12-danh-mục-restful-api-chi-tiết)
13. [Hướng dẫn Cài đặt & Vận hành](#13-hướng-dẫn-cài-đặt--vận-hành)
14. [Điểm Nổi Bật Về Trải Nghiệm Người Dùng (UI/UX)](#14-điểm-nổi-bật-về-trải-nghiệm-người-dùng-uiux)

---

## 1. Giới thiệu & Mục tiêu Dự án

**SmartLogistics TMS** là giải pháp phần mềm quản lý logistics toàn diện dành cho các doanh nghiệp giao nhận bưu chính, chuyển phát nhanh và vận tải hàng hóa liên tỉnh. Hệ thống số hóa 100% quy trình vận hành:
- Khởi tạo đơn gửi hàng đa vùng miền với danh bạ 3 Miền chuẩn hóa.
- Tự động nhận diện lộ trình và khớp tuyến vận chuyển thông minh (**Smart Auto-Match Route**).
- Tự động tính cước vận chuyển chuẩn xác phân định nội thành, nội miền, liên miền và trục Bắc – Nam.
- Điều phối gán xe và phân công tài xế thông minh nhờ thuật toán chấm điểm và AI.
- Quản lý đội xe, thêm mới tài xế và tự động cấp tài khoản đăng nhập hiện trường.
- Đăng ký đối tác khách hàng gửi hàng trực tuyến với trải nghiệm tự động đăng nhập (seamless onboarding).
- Ký nhận điện tử POD và in tem nhãn nhiệt A6 có mã vạch barcode chuẩn bưu chính.
- Giám sát hành trình thời gian thực (Real-time tracking timeline) và xử lý sự cố hiện trường bằng AI Incident Copilot.
- Quản lý tài chính, đối soát cước phí và tiền thu hộ COD minh bạch.

---

## 2. Kiến trúc 4 Cổng Thông Tin & Phân Quyền (Portals & RBAC)

Hệ thống được thiết kế theo mô hình phân quyền bảo mật cao (RBAC), tự động chuyển đổi giao diện tối ưu theo từng đối tượng người dùng:

### 🛡️ 1. Cổng Quản Trị & Điều Phối (Dispatcher / Manager Portal)
* **Thanh chỉ số KPI Real-time (`StatsBar.jsx`):** Giám sát tổng số đơn, tỷ lệ giao hàng thành công, tổng doanh thu cước, đơn chờ giao, đơn đang chạy, tài xế đang hoạt động và sự cố tồn đọng.
* **Bảng điều phối vận đơn (`OrderManagement.jsx`):** Quản lý danh sách đơn hàng đa tiêu chí, tạo đơn mới, gán tài xế kèm AI đề xuất và xuất file Excel/CSV.
* **Giám sát đội xe & Thêm tài xế (`FleetManagement.jsx`):** Theo dõi tải trọng thực tế, tỷ lệ đầy thùng, tiền COD đang giữ và chức năng thêm mới tài xế (`CreateDriverModal.jsx`).
* **Quản lý mạng lưới tuyến & Biểu cước (`RouteNetworkManagement.jsx`):** Giám sát 16 tuyến vận chuyển toàn quốc chia 5 vùng miền.
* **Đối soát COD & Doanh thu (`CodReconciliation.jsx`):** Quản lý tiền thu hộ COD, đối soát chuyển khoản và thống kê tài chính.
* **Trung tâm xử lý sự cố (`IncidentsCenter.jsx`):** Tiếp nhận sự cố hiện trường và áp dụng giải pháp khắc phục từ AI Copilot.

### 🚚 2. Cổng Tài Xế Giao Nhận (Driver Portal)
* **Hồ sơ tài xế & Bảng KPI cá nhân:** Thống kê đơn cần lấy, đơn đang giao, đơn hoàn thành và tổng tiền COD đang giữ trong ca.
* **Hệ thống Kiểm soát Tải trọng & Nhận diện "Vận chuyển đủ" (`DriverPortal.jsx`):**
  - Đồng hồ đo sức chứa thùng xe trực quan theo tải trọng định mức xe (1.25 Tấn, 2.5 Tấn, 5 Tấn, Xe Van 850kg).
  - Đánh giá trạng thái thùng xe: *Còn rộng chỗ / Đủ tải tối ưu / Đã đạt giới hạn an toàn*.
  - Thanh tiến độ ca giao hàng và thông báo huy hiệu: **🎉 ĐÃ VẬN CHUYỂN ĐỦ CA (100%)**.
* **Thao tác vận đơn tại hiện trường:** Xác nhận đã lấy hàng, bắt đầu đi giao, ký nhận POD hoàn tất đơn và in tem nhãn A6.
* **Trợ lý AI Hiện Trường:** Nhận khuyến nghị xử lý tức thì khi khách hẹn lại, sai địa chỉ hoặc xe gặp sự cố kỹ thuật.

### 📦 3. Cổng Khách Hàng Doanh Nghiệp (Customer Portal)
* **Tra cứu vận đơn trực tiếp:** Xem chi tiết lộ trình vận chuyển, tài xế phụ trách, tiền thu hộ COD và thời gian giao dự kiến.
* **Tạo đơn gửi hàng trực tuyến:** Nhập thông tin người nhận, chọn điểm gửi/nhận phân nhóm 3 Miền, tự động nhận diện tuyến và tính cước tức thì.
* **In nhãn gửi A6:** Tự động tạo tem dán thùng bưu gửi có mã vạch barcode chuẩn A6.
* **Lịch sử đơn gửi & Xuất dữ liệu:** Theo dõi toàn bộ các đơn hàng đã tạo, trạng thái thanh toán và xuất báo cáo CSV.

### 🌐 4. Cổng Tra Cứu Công Khai (Guest / Public Tracking)
* Dành cho người nhận hoặc khách vãng lai tra cứu nhanh hành trình đơn hàng bằng mã bưu gửi (`VN2026-xxxx` hoặc 4 số cuối) trực tiếp tại trang chủ mà không cần đăng nhập.

---

## 3. Mạng Lưới Tuyến Vận Chuyển & Auto-Match Khớp Tuyến

Hệ thống quản lý 16 tuyến vận chuyển chuẩn hóa toàn quốc phân bổ theo 5 nhóm khu vực địa lý:

| Nhóm Khu Vực | Mã Tuyến | Tên Tuyến Vận Chuyển | Lộ Trình | Cự Ly | Thời Gian Dự Kiến | Cước Chuẩn Tuyến |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nội & Ngoại Thành Hà Nội** | `RT-HN-NOITHANH` | Tuyến Nội thành Hà Nội | Cầu Giấy – Đống Đa – Hoàn Kiếm | 18.5 km | ~1.5 giờ | 25.000 đ |
| | `RT-HN-NGOITHANH` | Tuyến Ngoại thành Hà Nội | Hà Đông – Nam Từ Liêm – Gia Lâm | 35.0 km | ~2.5 giờ | 32.000 đ |
| **Liên Tỉnh Miền Bắc** | `RT-HN-HP` | Cao tốc Hà Nội – Hải Phòng | Hà Nội ➔ Hải Phòng | 115.0 km | ~2.5 giờ | 65.000 đ |
| | `RT-HN-QN` | Hà Nội – Hải Dương – Quảng Ninh | Hà Nội ➔ Quảng Ninh | 155.0 km | ~3.0 giờ | 75.000 đ |
| | `RT-HN-BN-BG` | Vành đai CN Hà Nội – Bắc Ninh – Bắc Giang | Hà Nội ➔ Bắc Ninh | 55.0 km | ~1.5 giờ | 45.000 đ |
| | `RT-HN-ND-NB` | Tuyến duyên hải Hà Nam – Nam Định – Ninh Bình | Hà Nội ➔ Ninh Bình | 95.0 km | ~2.0 giờ | 55.000 đ |
| | `RT-HN-TN-PT` | Tuyến trung du Thái Nguyên – Phú Thọ | Hà Nội ➔ Thái Nguyên | 80.0 km | ~2.0 giờ | 50.000 đ |
| **Trục Bắc – Nam & Liên Miền** | `RT-HN-HCM` | **Trục xuyên Việt Hà Nội – TP. Hồ Chí Minh** | Hà Nội ➔ TP. Hồ Chí Minh | 1.720 km | ~36.0 giờ | 160.000 đ |
| | `RT-HN-DN` | Trục liên tỉnh Hà Nội – Đà Nẵng | Hà Nội ➔ Đà Nẵng | 760.0 km | ~14.0 giờ | 110.000 đ |
| | `RT-DN-HCM` | Trục liên miền Đà Nẵng – TP. Hồ Chí Minh | Đà Nẵng ➔ TP. Hồ Chí Minh | 960.0 km | ~18.0 giờ | 125.000 đ |
| **Miền Nam & Nội Thành TP.HCM** | `RT-HCM-NOITHANH` | Tuyến Nội thành TP. Hồ Chí Minh | Q.1 – Bình Thạnh – Thủ Đức – Q.7 | 22.0 km | ~1.5 giờ | 25.000 đ |
| | `RT-HCM-BD-DN` | Tuyến công nghiệp TP.HCM – Bình Dương – Đồng Nai | TP.HCM ➔ Bình Dương | 60.0 km | ~1.8 giờ | 50.000 đ |
| | `RT-HCM-MIENTAY` | Tuyến Miền Tây Nam Bộ TP.HCM – Long An – Cần Thơ | TP.HCM ➔ Cần Thơ | 170.0 km | ~3.5 giờ | 75.000 đ |
| | `RT-HCM-VT` | Tuyến Đông Nam Bộ TP.HCM – Bà Rịa – Vũng Tàu | TP.HCM ➔ Vũng Tàu | 105.0 km | ~2.2 giờ | 65.000 đ |
| **Liên Tỉnh Miền Trung** | `RT-DN-HUE` | Tuyến liên tỉnh Đà Nẵng – Thừa Thiên Huế | Đà Nẵng ➔ Huế | 100.0 km | ~2.0 giờ | 55.000 đ |
| | `RT-DN-QN-QNG` | Tuyến duyên hải Đà Nẵng – Quảng Nam – Quảng Ngãi | Đà Nẵng ➔ Quảng Ngãi | 135.0 km | ~2.5 giờ | 60.000 đ |

---

## 4. Thuật Toán Tính Cước Đa Vùng Miền (Pricing Engine)

Dịch vụ tính cước (`fee_service.py`) phân loại khu vực theo dữ liệu địa lý thực tế:

$$\text{Tổng cước vận chuyển} = \text{Phí cơ bản vùng miền} + \text{Phí khối lượng vượt mức} + \text{Phí COD}$$

1. **Phí cơ bản theo vùng miền:**
   * Nội tỉnh / Nội thành: `22.000 đ`
   * Liên tỉnh cùng miền (Nội miền Bắc / Nội miền Nam): `35.000 đ`
   * Liên miền lân cận (Bắc – Trung, Trung – Nam): `55.000 đ`
   * Trục Bắc – Nam xuyên Việt: `75.000 đ`
2. **Phí khối lượng vượt mức:** $> 1.0 \text{ kg}$, mỗi kg tính `5.000 đ/kg`.
3. **Phí dịch vụ thu hộ COD:** `1%` giá trị tiền thu hộ COD.

---

## 5. Quy Trình Nghiệp Vụ Mới: Quản Lý Đội Xe & Đăng Ký Khách Hàng

### 🚚 5.1. Thêm Mới Tài Xế & Cấp Tài Khoản Tự Động (`CreateDriverModal.jsx`)
* Điều phối viên bấm **`+ Thêm Tài Xế Mới`** tại Cổng Quản Lý -> tab "Giám Sát Đội Xe".
* Nhập: Họ tên, Số điện thoại, Số GPLX, Biển số xe, Loại xe (1.25T, 2.5T, 5T, Xe Van, Xe máy) và Tải trọng định mức.
* Hệ thống tự động gợi ý email đăng nhập theo biển kiểm soát và mật khẩu mặc định `driver123`.
* **Cơ chế liên kết Backend:** `POST /api/drivers` tự động tạo tài khoản trong bảng `users` (`vai_tro = TAI_XE`) và liên kết `user_id` với hồ sơ `tai_xe`. Tài xế mới có thể đăng nhập ngay lập tức.

### 📦 5.2. Đăng Ký Khách Hàng Gửi Hàng Trực Tuyến (`LoginPage.jsx`)
* Khách hàng / chủ shop bấm **"Đăng ký tài khoản doanh nghiệp ngay"** tại trang chủ.
* Điền thông tin: Tên doanh nghiệp/người gửi, SĐT, Email, Mật khẩu, Tỉnh/thành kho gửi và Địa chỉ chi tiết.
* **Onboarding tự động:** Gọi `POST /api/auth/register`, tự động lưu bảng `users` và `khach_hang`, tự động đăng nhập (Auto-login) và đưa khách hàng thẳng vào **Customer Portal** để tạo đơn ngay.

---

## 6. Bằng Chứng Giao Hàng POD & In Tem Nhãn Nhiệt A6

1. **Ký nhận điện tử POD (`PodSignatureModal.jsx`):**
   * Cho phép tài xế chụp ảnh hiện trường hoặc lưu ghi chú giao nhận khi bàn giao hàng thành công.
2. **In tem nhãn nhiệt A6 (`PrintShippingLabelModal.jsx`):**
   * Định dạng chuẩn bưu chính kích thước A6 (100x150mm).
   * Tạo mã vạch Code128 trực quan bằng SVG, bảng phân vùng tuyến, thông tin COD và ô chữ ký xác nhận của người nhận.

---

## 7. Bộ 3 Tính Năng AI Đột Phá (AI Core Modules)

1. **Chatbot AI CSKH & Tra Cứu Vận Đơn (`AIChatWidget.jsx`):** Tự động phát hiện mã vận đơn trong câu chat, truy xuất database và trả về thẻ vận đơn trực quan.
2. **AI Chẩn Đoán Sự Cố Hiện Trường (`ai_service.py`):** Phân tích sự cố, đánh giá mức độ nghiêm trọng và đề xuất 3 bước hành động khắc phục cho điều phối viên.
3. **AI Gợi Ý Phân Công Tài Xế Tối Ưu (`AssignDriverModal.jsx`):** Thuật toán tính điểm Match Score ($0\% - 99\%$) dựa trên 5 tiêu chí: Trạng thái sẵn sàng, Tải trọng trống, Cân bằng tải, Khớp tuyến và Điểm đánh giá (Rating).

---

## 8. Quản Lý Tải Trọng & Nhận Diện "Vận Chuyển Đủ" Của Tài Xế

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        HỆ THỐNG ĐÁNH GIÁ "VẬN CHUYỂN ĐỦ"                                │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ 1. ĐỦ TẢI TRỌNG THÙNG XE (PAYLOAD)        │ 2. ĐỦ CHỈ TIÊU CA GIAO (SHIFT QUOTA)       │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Tính tổng kg hàng đang chở trên xe      │ • Theo dõi tiến độ hoàn thành ca:          │
│ • So khớp với tải định mức xe (1,250 kg): │   Số đơn thành công / Tổng đơn trong ca    │
│   - < 70%: Còn rộng chỗ (nhận thêm hàng)  │ • Khi còn đơn đang giao: Báo số đơn tồn.   │
│   - 70% - 89%: Đạt tải trọng tối ưu       │ • Khi 100% đơn thành công (0 đơn tồn):     │
│   - ≥ 90%: ⚠️ ĐÃ ĐỦ TẢI TỐI ĐA            │   🎉 "ĐÃ VẬN CHUYỂN ĐỦ CA": Toàn bộ đơn    │
│     (Cảnh báo không nhận thêm hàng nặng)  │   đã phát, tiền COD sẵn sàng kết toán.     │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 9. Cấu trúc Thư mục Dự án

```text
D:\SmartLogistics\
│
├── README.md                     # Tài liệu kỹ thuật toàn diện của hệ thống
├── ARCHITECTURE_DESIGN.md        # Bản vẽ kiến trúc hệ thống và luồng dữ liệu
│
├── backend/                      # DỊCH VỤ BACKEND (FastAPI - Python)
│   ├── venv/                     # Virtual Environment Python
│   ├── requirements.txt          # Thư viện phụ thuộc (FastAPI, SQLAlchemy, Pydantic...)
│   ├── smart_logistics.db        # Cơ sở dữ liệu SQLite
│   ├── main.py                   # Điểm khởi chạy ứng dụng (Routers, CORS & Seed Data)
│   └── app/
│       ├── core/
│       │   ├── config.py         # Cấu hình biến môi trường & đường dẫn tuyệt đối SQLite
│       │   ├── database.py       # Kết nối SQLAlchemy Engine & SessionLocal
│       │   └── security.py       # Thuật toán mã hóa bcrypt & tạo JWT Token
│       ├── models/
│       │   └── models.py         # 8 Bảng ORM Models chuẩn hoá
│       ├── schemas/
│       │   └── schemas.py        # Pydantic Schemas (Request/Response DTO)
│       ├── services/
│       │   ├── ai_service.py     # Lõi AI (Chatbot NLP, Chẩn đoán sự cố, Gợi ý tài xế)
│       │   ├── fee_service.py    # Thuật toán tính cước vận chuyển chuẩn đa vùng miền
│       │   └── seed_data.py      # Bộ nạp 16 tuyến đường và dữ liệu mẫu ban đầu
│       └── api/
│           ├── deps.py           # Dependency xác thực phiên & phân quyền RBAC
│           ├── auth.py           # API Đăng nhập, Đăng ký khách hàng, Lấy thông tin tài khoản
│           ├── orders.py         # API Quản lý đơn, tính cước, cập nhật trạng thái
│           ├── drivers.py        # API Quản lý danh sách tài xế, thêm mới & tải trọng
│           ├── routes.py         # API Tuyến đường giao nhận toàn quốc
│           ├── customers.py      # API Khách hàng
│           ├── incidents.py      # API Báo cáo & Xử lý sự cố
│           ├── stats.py          # API Thống kê chỉ số Dashboard
│           ├── tracking.py       # API Tra cứu vận đơn công khai
│           └── ai.py             # API Bộ 3 Module Trí tuệ nhân tạo (AI)
│
└── frontend/                     # DỊCH VỤ FRONTEND (React 18 + Vite + Tailwind CSS)
    ├── package.json              # Cấu hình npm & dependencies
    ├── vite.config.js            # Cấu hình Vite & Tailwind
    ├── index.html                # Entrypoint HTML
    └── src/
        ├── index.css             # Tailwind styling & dark mode setup
        ├── api.js                # Axios HTTP client tích hợp API Backend & Health Check
        ├── App.jsx               # Root Component điều phối giao diện theo vai trò
        ├── main.jsx              # React DOM render
        ├── utils/
        │   └── exportUtils.js    # Tiện ích xuất dữ liệu báo cáo CSV/Excel
        ├── context/
        │   ├── AuthContext.jsx   # Quản lý phiên đăng nhập, đăng ký & chuyển vai trò
        │   └── ThemeContext.jsx  # Quản lý chế độ hiển thị Sáng / Tối (Light/Dark Mode)
        └── components/
            ├── Navbar.jsx        # Thanh điều hướng, thông tin tài khoản, chuyển Theme
            ├── StatsBar.jsx      # Thanh KPI tổng quan thời gian thực
            ├── OrderManagement.jsx # Bảng quản trị đơn hàng cốt lõi
            ├── FleetManagement.jsx # Giám sát đội xe, tải trọng & nút thêm tài xế
            ├── RouteNetworkManagement.jsx # Quản lý 16 trục tuyến toàn quốc
            ├── CodReconciliation.jsx # Đối soát tiền thu hộ COD
            ├── IncidentsCenter.jsx # Trung tâm xử lý sự cố hiện trường
            ├── CreateOrderModal.jsx # Hộp thoại tạo đơn mới kèm auto-match tuyến & tính cước
            ├── CreateDriverModal.jsx# Hộp thoại thêm tài xế & phương tiện mới
            ├── PodSignatureModal.jsx# Hộp thoại ký nhận điện tử POD
            ├── PrintShippingLabelModal.jsx # Hộp thoại in tem vận đơn nhiệt A6 barcode
            ├── OrderDetailModal.jsx# Hộp thoại chi tiết vận đơn & tracking timeline
            ├── AssignDriverModal.jsx# Hộp thoại phân công tài xế & AI đề xuất
            ├── AIChatWidget.jsx  # Widget Chatbot AI nổi CSKH & tra cứu vận đơn
            ├── LoginPage.jsx     # Trang đăng nhập & đăng ký thương mại tích hợp 1-Click
            └── portals/
                ├── DispatcherPortal.jsx # Cổng quản trị điều phối
                ├── DriverPortal.jsx     # Cổng tài xế kèm đồng hồ tải trọng
                └── CustomerPortal.jsx   # Cổng khách hàng gửi đơn
```

---

## 10. Thiết kế Cơ sở Dữ liệu (8 Bảng CSDL Chuẩn Hoá)

1. **`users`:** Quản lý tài khoản đăng nhập, mật khẩu mã hóa bcrypt, phân quyền 3 vai trò (`QUAN_LY`, `TAI_XE`, `KHACH_HANG`).
2. **`don_hang`:** Quản lý mã vận đơn (`VN2026-xxxx`), thông tin người gửi/nhận, khối lượng, tiền COD, cước phí, trạng thái đơn (`MOI`, `DA_LAY_HANG`, `DANG_GIAO`, `GIAO_THANH_CONG`, `THAT_BAI`), mức ưu tiên (`CHUAN`, `CAO`, `HOA_TOC`), mã tuyến giao (`tuyen_giao_id`).
3. **`tai_xe`:** Hồ sơ tài xế, GPLX, loại xe, biển số xe, tải trọng xe (`tai_trong_kg`), trạng thái (`SAN_SANG`, `DANG_GIAO`, `NGHI`), liên kết tài khoản `user_id`.
4. **`tuyen_giao`:** Danh mục 16 tuyến vận chuyển (mã tuyến, tên tuyến, cự ly km, thời gian ước tính, cước cơ bản, vùng miền `khu_vuc`).
5. **`log_trang_thai`:** Nhật ký hành trình thời gian thực ghi lại từng mốc trạng thái, địa điểm và mô tả chi tiết.
6. **`su_co`:** Ghi nhận sự cố vận chuyển phát sinh từ hiện trường, mức độ nghiêm trọng, biện pháp khắc phục và trạng thái xử lý (`CHUA_XU_LY`, `DA_XU_LY`).
7. **`khach_hang`:** Danh bạ khách hàng, công ty, số điện thoại, email, địa chỉ kho gửi, tỉnh thành.
8. **`thanh_toan`:** Hồ sơ thanh toán đơn hàng (phương thức `TIEN_MAT`, `CHUYEN_KHOAN`, `VI_DIEN_TU`, số tiền và trạng thái quyết toán).

---

## 11. Tài khoản Demo Khởi tạo Sẵn (Seed Accounts)

Bạn có thể nhấn vào các nút **"⚡ Vào ngay" (1-Click Login)** trên màn hình đăng nhập hoặc sử dụng thông tin sau:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Họ Tên Đại Diện | Phương Tiện / Ghi Chú |
| :--- | :--- | :--- | :--- | :--- |
| **Quản Lý / Điều Phối** | `admin@smartlog.vn` | `admin123` | Nguyễn Quốc Hưng | Toàn quyền kiểm soát và điều phối hệ thống |
| **Tài Xế 1** | `driver1@smartlog.vn` | `driver123` | Nguyễn Văn Hùng | Xe tải 1.25 Tấn (29C-888.99) - Sẵn sàng |
| **Tài Xế 2** | `driver2@smartlog.vn` | `driver123` | Trần Đình Trọng | Xe tải 2.5 Tấn (29D-567.89) - Sẵn sàng |
| **Tài Xế 3** | `driver3@smartlog.vn` | `driver123` | Lê Hoàng Nam | Xe Van 850kg (30F-123.45) - Đang giao |
| **Khách Hàng Doanh Nghiệp** | `customer@smartlog.vn` | `customer123` | Phạm Thu Hà | Công ty TNHH Thời Trang An Nam |

---

## 12. Danh mục RESTful API Chi tiết

### 🔐 Xác thực & Người dùng (`/api/auth`)
- `POST /api/auth/login`: Đăng nhập hệ thống, nhận JWT Token.
- `POST /api/auth/register`: Đăng ký tài khoản khách hàng doanh nghiệp kèm địa chỉ kho gửi.
- `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại từ Token.

### 🚚 Quản lý Tài xế & Đội xe (`/api/drivers`)
- `GET /api/drivers`: Danh sách tài xế, trạng thái hoạt động và tải trọng.
- `POST /api/drivers`: Thêm mới tài xế & tự động cấp tài khoản đăng nhập `User` liên kết.
- `PATCH /api/drivers/{id}/status`: Cập nhật trạng thái tài xế (`SAN_SANG` / `DANG_GIAO` / `NGHI`).

### 📦 Quản lý Đơn hàng (`/api/orders`)
- `GET /api/orders`: Lấy danh sách vận đơn (lọc theo trạng thái, tuyến giao, mức ưu tiên, từ khóa).
- `GET /api/orders/{id}`: Xem chi tiết vận đơn kèm lịch sử timeline, tuyến đường và sự cố.
- `POST /api/orders`: Tạo vận đơn mới.
- `POST /api/orders/calculate-fee`: Tính toán cước phí vận chuyển tự động đa vùng miền.
- `PATCH /api/orders/{id}/status`: Cập nhật trạng thái vận đơn & tự động ghi log hành trình.
- `PATCH /api/orders/{id}/assign`: Phân công tài xế và gán tuyến đường.

### 🧠 Trí tuệ nhân tạo AI (`/api/ai`)
- `POST /api/ai/chat`: Chatbot AI Tra cứu vận đơn NLP & tư vấn chăm sóc khách hàng.
- `POST /api/ai/suggest-incident-solution`: AI Phân tích sự cố hiện trường và đề xuất giải pháp xử lý.
- `GET /api/ai/suggest-driver/{order_id}`: AI Gợi ý phân công tài xế tối ưu nhất theo 5 tiêu chí.

### 📍 Tuyến đường, Sự cố & Tiện ích
- `GET /api/routes`: Danh mục 16 tuyến đường giao nhận kèm vùng miền.
- `GET /api/incidents`: Danh sách sự cố giao hàng.
- `POST /api/incidents`: Báo cáo sự cố từ hiện trường.
- `PATCH /api/incidents/{id}/resolve`: Cập nhật biện pháp giải quyết và đóng sự cố.
- `GET /api/stats/overview`: Thống kê các chỉ số KPI vận hành Dashboard.
- `GET /api/tracking/{code}`: Tra cứu vận đơn công khai không cần đăng nhập.
- `GET /health`: Kiểm tra tình trạng kết nối máy chủ Backend.

---

## 13. Hướng dẫn Cài đặt & Vận hành

### Yêu cầu môi trường
- **Python:** 3.10+ (Đã kiểm thử tối ưu trên Python 3.12 / 3.13)
- **Node.js:** 18+ và **npm**

### Khởi động Backend (FastAPI)
```powershell
# 1. Di chuyển vào thư mục backend
cd D:\SmartLogistics\backend

# 2. Kích hoạt môi trường ảo
.\venv\Scripts\Activate.ps1

# 3. Chạy server uvicorn (cổng 8000)
uvicorn main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Tài liệu Swagger UI:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

### Khởi động Frontend (React + Vite)
```powershell
# 1. Di chuyển vào thư mục frontend
cd D:\SmartLogistics\frontend

# 2. Khởi chạy Vite Dev Server (cổng 5173)
cmd /c "npm run dev"
```
- **Ứng dụng Web:** `http://localhost:5173`

---

## 14. Điểm Nổi Bật Về Trải Nghiệm Người Dùng (UI/UX)

1. **Khớp Tuyến Tự Động & Thẻ Lộ Trình Trực Quan:** Khi tạo đơn, hệ thống tự động xác định tuyến tối ưu (ví dụ gửi vào miền Nam chọn ngay Trục Bắc – Nam), đồng thời hiển thị cự ly (km), thời gian di chuyển (~giờ) và cước chuẩn tuyến.
2. **Đăng nhập 1-Chạm & Chẩn đoán kết nối thông minh:** Hỗ trợ 3 nút đăng nhập nhanh tức thì và hệ thống tự động kiểm tra kết nối Backend (port 8000), cảnh báo rõ ràng khi server chưa bật.
3. **Trải nghiệm đóng Modal chuẩn mực:** Các cửa sổ popup (Chi tiết vận đơn, Thêm tài xế, Báo sự cố, POD, In tem A6) đều hỗ trợ thoát tức thì bằng 3 cách: nút `✕`, click ra ngoài (Backdrop), hoặc phím `Esc`.
4. **Hỗ trợ Dark Mode / Light Mode toàn diện:** Chuyển đổi linh hoạt giữa giao diện Sáng tinh tế và Tối hiện đại, bảo vệ mắt người dùng khi làm việc ban đêm.
5. **In tem nhãn A6 chuẩn Barcode:** Tự động định dạng trang in nhãn nhiệt A6 có mã vạch Code128, thông tin COD và khu vực chia chọn bưu chính.
