from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, VaiTroNguoiDung, TaiXe, TuyenGiao, DonHang, LogTrangThai, SuCo, KhachHang, ThanhToan,
    TrangThaiDonHang, MucDoUuTien, TrangThaiSuCo, PhuongThucThanhToan
)

def init_db_data(db: Session):
    if db.query(User).first():
        return

    print("--- Seeding initial demo data for SmartLogistics TMS (8 tables) ---")

    # 1. Bảng USERS (Quản lý, Tài xế, Khách hàng)
    admin_user = User(
        email="admin@smartlog.vn",
        password_hash=get_password_hash("admin123"),
        ho_ten="Nguyễn Quốc Hưng (Điều phối & Quản lý)",
        so_dien_thoai="0901234567",
        vai_tro=VaiTroNguoiDung.QUAN_LY.value
    )
    db.add(admin_user)

    driver_u1 = User(
        email="driver1@smartlog.vn",
        password_hash=get_password_hash("driver123"),
        ho_ten="Nguyễn Văn Hùng",
        so_dien_thoai="0912345678",
        vai_tro=VaiTroNguoiDung.TAI_XE.value
    )
    driver_u2 = User(
        email="driver2@smartlog.vn",
        password_hash=get_password_hash("driver123"),
        ho_ten="Trần Đình Trọng",
        so_dien_thoai="0923456789",
        vai_tro=VaiTroNguoiDung.TAI_XE.value
    )
    driver_u3 = User(
        email="driver3@smartlog.vn",
        password_hash=get_password_hash("driver123"),
        ho_ten="Lê Hoàng Nam",
        so_dien_thoai="0934567890",
        vai_tro=VaiTroNguoiDung.TAI_XE.value
    )
    db.add_all([driver_u1, driver_u2, driver_u3])

    customer_u1 = User(
        email="customer@smartlog.vn",
        password_hash=get_password_hash("customer123"),
        ho_ten="Phạm Thu Hà",
        so_dien_thoai="0945678901",
        vai_tro=VaiTroNguoiDung.KHACH_HANG.value
    )
    db.add(customer_u1)
    db.commit()

    # 2. Bảng TAI_XE
    tx1 = TaiXe(
        user_id=driver_u1.id,
        ho_ten="Nguyễn Văn Hùng",
        so_dien_thoai="0912345678",
        so_gplx="B2-798213",
        loai_xe="Xe tải 1.25 Tấn",
        bien_so_xe="29C-888.99",
        tai_trong_kg=1250.0,
        trang_thai_hoat_dong="SAN_SANG",
        danh_gia=4.9
    )
    tx2 = TaiXe(
        user_id=driver_u2.id,
        ho_ten="Trần Đình Trọng",
        so_dien_thoai="0923456789",
        so_gplx="C-452190",
        loai_xe="Xe tải 2.5 Tấn",
        bien_so_xe="29D-567.89",
        tai_trong_kg=2500.0,
        trang_thai_hoat_dong="SAN_SANG",
        danh_gia=4.8
    )
    tx3 = TaiXe(
        user_id=driver_u3.id,
        ho_ten="Lê Hoàng Nam",
        so_dien_thoai="0934567890",
        so_gplx="B2-112344",
        loai_xe="Xe Van 850kg",
        bien_so_xe="30F-123.45",
        tai_trong_kg=850.0,
        trang_thai_hoat_dong="DANG_GIAO",
        danh_gia=5.0
    )
    db.add_all([tx1, tx2, tx3])
    db.commit()

    # 3. Bảng KHACH_HANG
    kh1 = KhachHang(
        ten_khach_hang="Công ty TNHH Thời Trang An Nam",
        so_dien_thoai="0945678901",
        email="customer@smartlog.vn",
        dia_chi="Số 45 Tràng Tiền, Hoàn Kiếm",
        tinh_thanh="Hà Nội",
        ten_cong_ty="Thời Trang An Nam"
    )
    kh2 = KhachHang(
        ten_khach_hang="Showroom Thiết Bị DigiTech",
        so_dien_thoai="0977889900",
        email="digitech@contact.vn",
        dia_chi="120 Cầu Giấy, Cầu Giấy",
        tinh_thanh="Hà Nội",
        ten_cong_ty="DigiTech VN"
    )
    db.add_all([kh1, kh2])

    # 4. Bảng TUYEN_GIAO
    # Nhóm 1: Nội & Ngoại thành Hà Nội
    tg1 = TuyenGiao(
        ma_tuyen="RT-HN-NOITHANH",
        ten_tuyen="Nội thành Hà Nội (Cầu Giấy - Đống Đa - Ba Đình - Hoàn Kiếm)",
        diem_dau="Hà Nội",
        diem_cuoi="Hà Nội",
        cu_ly_km=18.5,
        thoi_gian_uoc_tinh_gio=1.5,
        gia_cuoc_co_ban=25000.0,
        khu_vuc="NOI_THANH_HN"
    )
    tg_hn_ngoai = TuyenGiao(
        ma_tuyen="RT-HN-NGOITHANH",
        ten_tuyen="Ngoại thành Hà Nội (Hà Đông - Bắc/Nam Từ Liêm - Đông Anh - Gia Lâm)",
        diem_dau="Hà Nội",
        diem_cuoi="Hà Nội",
        cu_ly_km=35.0,
        thoi_gian_uoc_tinh_gio=2.5,
        gia_cuoc_co_ban=32000.0,
        khu_vuc="NOI_THANH_HN"
    )

    # Nhóm 2: Các tuyến liên tỉnh Miền Bắc
    tg2 = TuyenGiao(
        ma_tuyen="RT-HN-HP",
        ten_tuyen="Cao tốc Hà Nội - Hải Phòng",
        diem_dau="Hà Nội",
        diem_cuoi="Hải Phòng",
        cu_ly_km=115.0,
        thoi_gian_uoc_tinh_gio=2.5,
        gia_cuoc_co_ban=65000.0,
        khu_vuc="MIEN_BAC"
    )
    tg_hn_qn = TuyenGiao(
        ma_tuyen="RT-HN-QN",
        ten_tuyen="Tuyến kết nối Hà Nội - Hải Dương - Quảng Ninh (Hạ Long)",
        diem_dau="Hà Nội",
        diem_cuoi="Quảng Ninh",
        cu_ly_km=155.0,
        thoi_gian_uoc_tinh_gio=3.0,
        gia_cuoc_co_ban=75000.0,
        khu_vuc="MIEN_BAC"
    )
    tg_hn_bnbg = TuyenGiao(
        ma_tuyen="RT-HN-BN-BG",
        ten_tuyen="Tuyến vành đai công nghiệp Hà Nội - Bắc Ninh - Bắc Giang",
        diem_dau="Hà Nội",
        diem_cuoi="Bắc Ninh",
        cu_ly_km=55.0,
        thoi_gian_uoc_tinh_gio=1.5,
        gia_cuoc_co_ban=45000.0,
        khu_vuc="MIEN_BAC"
    )
    tg_hn_ndnb = TuyenGiao(
        ma_tuyen="RT-HN-ND-NB",
        ten_tuyen="Tuyến nam đồng bằng Hà Nội - Hà Nam - Nam Định - Ninh Bình",
        diem_dau="Hà Nội",
        diem_cuoi="Ninh Bình",
        cu_ly_km=95.0,
        thoi_gian_uoc_tinh_gio=2.0,
        gia_cuoc_co_ban=55000.0,
        khu_vuc="MIEN_BAC"
    )
    tg_hn_tnpt = TuyenGiao(
        ma_tuyen="RT-HN-TN-PT",
        ten_tuyen="Tuyến trung du Hà Nội - Thái Nguyên - Phú Thọ",
        diem_dau="Hà Nội",
        diem_cuoi="Thái Nguyên",
        cu_ly_km=80.0,
        thoi_gian_uoc_tinh_gio=2.0,
        gia_cuoc_co_ban=50000.0,
        khu_vuc="MIEN_BAC"
    )

    # Nhóm 3: Trục Bắc - Nam & Tuyến liên miền
    tg_hn_hcm = TuyenGiao(
        ma_tuyen="RT-HN-HCM",
        ten_tuyen="Trục xuyên Việt Hà Nội - TP. Hồ Chí Minh (Bắc - Nam)",
        diem_dau="Hà Nội",
        diem_cuoi="TP. Hồ Chí Minh",
        cu_ly_km=1720.0,
        thoi_gian_uoc_tinh_gio=36.0,
        gia_cuoc_co_ban=160000.0,
        khu_vuc="BAC_NAM"
    )
    tg3 = TuyenGiao(
        ma_tuyen="RT-HN-DN",
        ten_tuyen="Trục liên tỉnh Hà Nội - Đà Nẵng",
        diem_dau="Hà Nội",
        diem_cuoi="Đà Nẵng",
        cu_ly_km=760.0,
        thoi_gian_uoc_tinh_gio=14.0,
        gia_cuoc_co_ban=110000.0,
        khu_vuc="BAC_NAM"
    )
    tg_dn_hcm = TuyenGiao(
        ma_tuyen="RT-DN-HCM",
        ten_tuyen="Trục liên miền Đà Nẵng - TP. Hồ Chí Minh",
        diem_dau="Đà Nẵng",
        diem_cuoi="TP. Hồ Chí Minh",
        cu_ly_km=960.0,
        thoi_gian_uoc_tinh_gio=18.0,
        gia_cuoc_co_ban=125000.0,
        khu_vuc="BAC_NAM"
    )

    # Nhóm 4: Tuyến Miền Nam & Nội thành TP.HCM
    tg_hcm_noithanh = TuyenGiao(
        ma_tuyen="RT-HCM-NOITHANH",
        ten_tuyen="Nội thành TP. Hồ Chí Minh (Quận 1 - 3 - Bình Thạnh - Thủ Đức - Quận 7)",
        diem_dau="TP. Hồ Chí Minh",
        diem_cuoi="TP. Hồ Chí Minh",
        cu_ly_km=22.0,
        thoi_gian_uoc_tinh_gio=1.5,
        gia_cuoc_co_ban=25000.0,
        khu_vuc="MIEN_NAM"
    )
    tg_hcm_bddn = TuyenGiao(
        ma_tuyen="RT-HCM-BD-DN",
        ten_tuyen="Tuyến công nghiệp TP.HCM - Bình Dương - Đồng Nai",
        diem_dau="TP. Hồ Chí Minh",
        diem_cuoi="Bình Dương",
        cu_ly_km=60.0,
        thoi_gian_uoc_tinh_gio=1.8,
        gia_cuoc_co_ban=50000.0,
        khu_vuc="MIEN_NAM"
    )
    tg_hcm_mientay = TuyenGiao(
        ma_tuyen="RT-HCM-MIENTAY",
        ten_tuyen="Tuyến Miền Tây TP.HCM - Long An - Tiền Giang - Cần Thơ",
        diem_dau="TP. Hồ Chí Minh",
        diem_cuoi="Cần Thơ",
        cu_ly_km=170.0,
        thoi_gian_uoc_tinh_gio=3.5,
        gia_cuoc_co_ban=75000.0,
        khu_vuc="MIEN_NAM"
    )
    tg_hcm_vt = TuyenGiao(
        ma_tuyen="RT-HCM-VT",
        ten_tuyen="Tuyến Đông Nam Bộ TP.HCM - Bà Rịa - Vũng Tàu",
        diem_dau="TP. Hồ Chí Minh",
        diem_cuoi="Bà Rịa - Vũng Tàu",
        cu_ly_km=105.0,
        thoi_gian_uoc_tinh_gio=2.2,
        gia_cuoc_co_ban=65000.0,
        khu_vuc="MIEN_NAM"
    )

    # Nhóm 5: Tuyến Miền Trung
    tg_dn_hue = TuyenGiao(
        ma_tuyen="RT-DN-HUE",
        ten_tuyen="Tuyến liên tỉnh Đà Nẵng - Thừa Thiên Huế",
        diem_dau="Đà Nẵng",
        diem_cuoi="Thừa Thiên Huế",
        cu_ly_km=100.0,
        thoi_gian_uoc_tinh_gio=2.0,
        gia_cuoc_co_ban=55000.0,
        khu_vuc="MIEN_TRUNG"
    )
    tg_dn_qn = TuyenGiao(
        ma_tuyen="RT-DN-QN-QNG",
        ten_tuyen="Tuyến duyên hải Đà Nẵng - Quảng Nam - Quảng Ngãi",
        diem_dau="Đà Nẵng",
        diem_cuoi="Quảng Ngãi",
        cu_ly_km=135.0,
        thoi_gian_uoc_tinh_gio=2.5,
        gia_cuoc_co_ban=60000.0,
        khu_vuc="MIEN_TRUNG"
    )

    all_routes = [
        tg1, tg_hn_ngoai, tg2, tg_hn_qn, tg_hn_bnbg, tg_hn_ndnb, tg_hn_tnpt,
        tg_hn_hcm, tg3, tg_dn_hcm,
        tg_hcm_noithanh, tg_hcm_bddn, tg_hcm_mientay, tg_hcm_vt,
        tg_dn_hue, tg_dn_qn
    ]
    db.add_all(all_routes)
    db.commit()

    # 5. Bảng DON_HANG
    now = datetime.utcnow()

    # Đơn 1: MỚI
    dh1 = DonHang(
        ma_van_don="VN2026-8801",
        nguoi_gui_ten="Công ty TNHH Thời Trang An Nam",
        nguoi_gui_sdt="0945678901",
        nguoi_gui_dia_chi="Số 45 Tràng Tiền",
        nguoi_gui_tinh_thanh="Hà Nội",
        nguoi_nhan_ten="Vũ Đức Minh",
        nguoi_nhan_sdt="0988112233",
        nguoi_nhan_dia_chi="Tòa FPT Cầu Giấy, 10 Phạm Văn Bạch",
        nguoi_nhan_tinh_thanh="Hà Nội",
        khoi_luong_kg=2.5,
        loai_hang_hoa="Quần áo may mặc",
        tien_thu_ho_cod=380000.0,
        cuoc_phi_van_chuyen=32500.0,
        tong_tien_thu=412500.0,
        trang_thai=TrangThaiDonHang.MOI.value,
        muc_do_uu_tien=MucDoUuTien.CHUAN.value,
        tuyen_giao_id=tg1.id,
        nguoi_tao_id=customer_u1.id,
        created_at=now - timedelta(hours=2)
    )

    # Đơn 2: ĐÃ LẤY HÀNG
    dh2 = DonHang(
        ma_van_don="VN2026-8802",
        nguoi_gui_ten="Showroom Thiết Bị DigiTech",
        nguoi_gui_sdt="0977889900",
        nguoi_gui_dia_chi="120 Cầu Giấy",
        nguoi_gui_tinh_thanh="Hà Nội",
        nguoi_nhan_ten="Lê Thanh Tùng",
        nguoi_nhan_sdt="0971239988",
        nguoi_nhan_dia_chi="28 Lê Lợi, Quận Ngô Quyền",
        nguoi_nhan_tinh_thanh="Hải Phòng",
        khoi_luong_kg=4.0,
        loai_hang_hoa="Linh kiện máy tính",
        tien_thu_ho_cod=1200000.0,
        cuoc_phi_van_chuyen=80000.0,
        tong_tien_thu=1280000.0,
        trang_thai=TrangThaiDonHang.DA_LAY_HANG.value,
        muc_do_uu_tien=MucDoUuTien.CAO.value,
        tai_xe_id=tx2.id,
        tuyen_giao_id=tg2.id,
        created_at=now - timedelta(hours=6)
    )

    # Đơn 3: ĐANG GIAO
    dh3 = DonHang(
        ma_van_don="VN2026-8803",
        nguoi_gui_ten="Kho Tổng SmartLog Hà Đông",
        nguoi_gui_sdt="0901234567",
        nguoi_gui_dia_chi="Km 12 Đường Quang Trung, Hà Đông",
        nguoi_gui_tinh_thanh="Hà Nội",
        nguoi_nhan_ten="Hoàng Thị Mai",
        nguoi_nhan_sdt="0966442211",
        nguoi_nhan_dia_chi="Chung cư Vinhomes Smart City, Tây Mỗ",
        nguoi_nhan_tinh_thanh="Hà Nội",
        khoi_luong_kg=1.8,
        loai_hang_hoa="Đồ gia dụng thông minh",
        tien_thu_ho_cod=520000.0,
        cuoc_phi_van_chuyen=29000.0,
        tong_tien_thu=549000.0,
        trang_thai=TrangThaiDonHang.DANG_GIAO.value,
        muc_do_uu_tien=MucDoUuTien.HOA_TOC.value,
        tai_xe_id=tx1.id,
        tuyen_giao_id=tg1.id,
        created_at=now - timedelta(hours=4)
    )

    # Đơn 4: GIAO THÀNH CÔNG
    dh4 = DonHang(
        ma_van_don="VN2026-8804",
        nguoi_gui_ten="Nhà sách Trí Tuệ",
        nguoi_gui_sdt="0933221100",
        nguoi_gui_dia_chi="187 Giảng Võ",
        nguoi_gui_tinh_thanh="Hà Nội",
        nguoi_nhan_ten="Đặng Quốc Anh",
        nguoi_nhan_sdt="0911558877",
        nguoi_nhan_dia_chi="54 Liễu Giai, Ba Đình",
        nguoi_nhan_tinh_thanh="Hà Nội",
        khoi_luong_kg=1.2,
        loai_hang_hoa="Sách chuyên ngành",
        tien_thu_ho_cod=240000.0,
        cuoc_phi_van_chuyen=26000.0,
        tong_tien_thu=266000.0,
        trang_thai=TrangThaiDonHang.GIAO_THANH_CONG.value,
        muc_do_uu_tien=MucDoUuTien.CHUAN.value,
        tai_xe_id=tx1.id,
        tuyen_giao_id=tg1.id,
        created_at=now - timedelta(days=1)
    )

    # Đơn 5: THẤT BẠI
    dh5 = DonHang(
        ma_van_don="VN2026-8805",
        nguoi_gui_ten="Mỹ Phẩm Xách Tay Seoul",
        nguoi_gui_sdt="0988776655",
        nguoi_gui_dia_chi="22 Nguyễn Trãi, Thanh Xuân",
        nguoi_gui_tinh_thanh="Hà Nội",
        nguoi_nhan_ten="Nguyễn Minh Châu",
        nguoi_nhan_sdt="0944668822",
        nguoi_nhan_dia_chi="Toà nhà Keangnam, Nam Từ Liêm",
        nguoi_nhan_tinh_thanh="Hà Nội",
        khoi_luong_kg=0.8,
        loai_hang_hoa="Mỹ phẩm dưỡng da",
        tien_thu_ho_cod=890000.0,
        cuoc_phi_van_chuyen=25000.0,
        tong_tien_thu=915000.0,
        trang_thai=TrangThaiDonHang.THAT_BAI.value,
        muc_do_uu_tien=MucDoUuTien.CAO.value,
        tai_xe_id=tx3.id,
        tuyen_giao_id=tg1.id,
        created_at=now - timedelta(hours=10)
    )

    db.add_all([dh1, dh2, dh3, dh4, dh5])
    db.commit()

    # 6. Bảng LOG_TRANG_THAI
    logs = [
        # Cho dh1
        LogTrangThai(don_hang_id=dh1.id, trang_thai=TrangThaiDonHang.MOI.value, vi_tri_hien_tai="Bưu cục Hoàn Kiếm", mo_ta_chi_tiet="Tiếp nhận đơn hàng mới từ shop", thoi_gian=now - timedelta(hours=2)),

        # Cho dh2
        LogTrangThai(don_hang_id=dh2.id, trang_thai=TrangThaiDonHang.MOI.value, vi_tri_hien_tai="Bưu cục Cầu Giấy", mo_ta_chi_tiet="Tạo đơn giao hàng", thoi_gian=now - timedelta(hours=6)),
        LogTrangThai(don_hang_id=dh2.id, trang_thai=TrangThaiDonHang.DA_LAY_HANG.value, vi_tri_hien_tai="Kho phân loại Cầu Giấy", mo_ta_chi_tiet="Tài xế Trần Đình Trọng đã gom hàng về kho", thoi_gian=now - timedelta(hours=5)),

        # Cho dh3
        LogTrangThai(don_hang_id=dh3.id, trang_thai=TrangThaiDonHang.MOI.value, vi_tri_hien_tai="Kho Hà Đông", mo_ta_chi_tiet="Đơn hàng được khởi tạo", thoi_gian=now - timedelta(hours=4)),
        LogTrangThai(don_hang_id=dh3.id, trang_thai=TrangThaiDonHang.DA_LAY_HANG.value, vi_tri_hien_tai="Kho Hà Đông", mo_ta_chi_tiet="Xuất kho giao cho tài xế Nguyễn Văn Hùng", thoi_gian=now - timedelta(hours=3)),
        LogTrangThai(don_hang_id=dh3.id, trang_thai=TrangThaiDonHang.DANG_GIAO.value, vi_tri_hien_tai="Khu đô thị Vinhomes Smart City", mo_ta_chi_tiet="Đang liên hệ khách hàng để giao kiện hàng", thoi_gian=now - timedelta(minutes=30)),

        # Cho dh4
        LogTrangThai(don_hang_id=dh4.id, trang_thai=TrangThaiDonHang.MOI.value, vi_tri_hien_tai="187 Giảng Võ", mo_ta_chi_tiet="Tạo đơn sách", thoi_gian=now - timedelta(days=1, hours=3)),
        LogTrangThai(don_hang_id=dh4.id, trang_thai=TrangThaiDonHang.DA_LAY_HANG.value, vi_tri_hien_tai="Bưu cục Ba Đình", mo_ta_chi_tiet="Đã lấy sách từ người gửi", thoi_gian=now - timedelta(days=1, hours=2)),
        LogTrangThai(don_hang_id=dh4.id, trang_thai=TrangThaiDonHang.DANG_GIAO.value, vi_tri_hien_tai="Liễu Giai, Ba Đình", mo_ta_chi_tiet="Tài xế đang giao", thoi_gian=now - timedelta(days=1, hours=1)),
        LogTrangThai(don_hang_id=dh4.id, trang_thai=TrangThaiDonHang.GIAO_THANH_CONG.value, vi_tri_hien_tai="54 Liễu Giai", mo_ta_chi_tiet="Khách hàng đã nhận và ký biên bản giao nhận", thoi_gian=now - timedelta(days=1)),

        # Cho dh5
        LogTrangThai(don_hang_id=dh5.id, trang_thai=TrangThaiDonHang.MOI.value, vi_tri_hien_tai="22 Nguyễn Trãi", mo_ta_chi_tiet="Tạo đơn mỹ phẩm", thoi_gian=now - timedelta(hours=10)),
        LogTrangThai(don_hang_id=dh5.id, trang_thai=TrangThaiDonHang.DA_LAY_HANG.value, vi_tri_hien_tai="Kho Thanh Xuân", mo_ta_chi_tiet="Đã nhận hàng", thoi_gian=now - timedelta(hours=8)),
        LogTrangThai(don_hang_id=dh5.id, trang_thai=TrangThaiDonHang.DANG_GIAO.value, vi_tri_hien_tai="Keangnam Mễ Trì", mo_ta_chi_tiet="Tài xế gọi giao hàng", thoi_gian=now - timedelta(hours=2)),
        LogTrangThai(don_hang_id=dh5.id, trang_thai=TrangThaiDonHang.THAT_BAI.value, vi_tri_hien_tai="Keangnam Mễ Trì", mo_ta_chi_tiet="Khách bận công tác hẹn sang tuần sau", thoi_gian=now - timedelta(hours=1))
    ]
    db.add_all(logs)

    # 7. Bảng SU_CO
    sc1 = SuCo(
        don_hang_id=dh5.id,
        tai_xe_id=tx3.id,
        loai_su_co="Khách hẹn lại ngày khác",
        mo_ta="Khách Nguyễn Minh Châu đi công tác Hải Phòng đến chủ nhật, yêu cầu chuyển lịch giao sang thứ 2.",
        trang_thai=TrangThaiSuCo.CHUA_XU_LY.value,
        thoi_gian_tao=now - timedelta(hours=1)
    )
    sc2 = SuCo(
        don_hang_id=dh3.id,
        tai_xe_id=tx1.id,
        loai_su_co="Sai số điện thoại người nhận",
        mo_ta="Số điện thoại người nhận ghi nhầm 1 số, không gọi được.",
        trang_thai=TrangThaiSuCo.DA_XU_LY.value,
        bien_phap_khac_phuc="Đã liên hệ shop lấy số phụ và gọi giao thành công.",
        thoi_gian_tao=now - timedelta(hours=2),
        thoi_gian_xu_ly=now - timedelta(hours=1)
    )
    db.add_all([sc1, sc2])

    # 8. Bảng THANH_TOAN
    tt1 = ThanhToan(
        don_hang_id=dh4.id,
        phuong_thuc=PhuongThucThanhToan.TIEN_MAT.value,
        so_tien=dh4.tong_tien_thu,
        trang_thai="DA_THANH_TOAN",
        ngay_thanh_toan=now - timedelta(days=1)
    )
    tt2 = ThanhToan(
        don_hang_id=dh1.id,
        phuong_thuc=PhuongThucThanhToan.TIEN_MAT.value,
        so_tien=dh1.tong_tien_thu,
        trang_thai="CHUA_THANH_TOAN"
    )
    db.add_all([tt1, tt2])

    db.commit()
    print("--- Successfully seeded initial demo data for all 8 tables! ---")
