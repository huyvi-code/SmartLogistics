from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class VaiTroNguoiDung(str, enum.Enum):
    QUAN_LY = "QUAN_LY"          # Quản lý / Điều phối
    TAI_XE = "TAI_XE"            # Tài xế
    KHACH_HANG = "KHACH_HANG"    # Khách hàng

class TrangThaiDonHang(str, enum.Enum):
    MOI = "MOI"                              # Mới tiếp nhận
    DA_LAY_HANG = "DA_LAY_HANG"              # Đã lấy hàng / Đang ở bưu cục
    DANG_GIAO = "DANG_GIAO"                  # Đang giao
    GIAO_THANH_CONG = "GIAO_THANH_CONG"      # Giao thành công
    THAT_BAI = "THAT_BAI"                    # Thất bại / Sự cố

class MucDoUuTien(str, enum.Enum):
    CHUAN = "CHUAN"          # Tiêu chuẩn
    CAO = "CAO"              # Ưu tiên cao
    HOA_TOC = "HOA_TOC"      # Hỏa tốc

class TrangThaiSuCo(str, enum.Enum):
    CHUA_XU_LY = "CHUA_XU_LY"
    DA_XU_LY = "DA_XU_LY"

class PhuongThucThanhToan(str, enum.Enum):
    TIEN_MAT = "TIEN_MAT"
    CHUYEN_KHOAN = "CHUYEN_KHOAN"
    VI_DIEN_TU = "VI_DIEN_TU"

# 1. Bảng USERS
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    ho_ten = Column(String(255), nullable=False)
    so_dien_thoai = Column(String(50), nullable=True)
    vai_tro = Column(String(50), default=VaiTroNguoiDung.KHACH_HANG.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tai_xe_profile = relationship("TaiXe", back_populates="user", uselist=False)
    don_hang_tao = relationship("DonHang", back_populates="nguoi_tao")

# 2. Bảng KHACH_HANG
class KhachHang(Base):
    __tablename__ = "khach_hang"

    id = Column(Integer, primary_key=True, index=True)
    ten_khach_hang = Column(String(255), nullable=False)
    so_dien_thoai = Column(String(50), index=True, nullable=False)
    email = Column(String(255), nullable=True)
    dia_chi = Column(String(255), nullable=False)
    tinh_thanh = Column(String(100), default="Hà Nội")
    ten_cong_ty = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 3. Bảng TAI_XE
class TaiXe(Base):
    __tablename__ = "tai_xe"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    ho_ten = Column(String(255), nullable=False)
    so_dien_thoai = Column(String(50), nullable=False)
    so_gplx = Column(String(50), nullable=False)
    loai_xe = Column(String(100), default="Xe tải 1.25 Tấn")
    bien_so_xe = Column(String(50), nullable=False)
    tai_trong_kg = Column(Float, default=1250.0)
    trang_thai_hoat_dong = Column(String(50), default="SAN_SANG")  # SAN_SANG, DANG_GIAO, NGHI
    danh_gia = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tai_xe_profile")
    don_hang_nhan = relationship("DonHang", back_populates="tai_xe")
    su_co_bao_cao = relationship("SuCo", back_populates="tai_xe")

# 4. Bảng TUYEN_GIAO
class TuyenGiao(Base):
    __tablename__ = "tuyen_giao"

    id = Column(Integer, primary_key=True, index=True)
    ma_tuyen = Column(String(50), unique=True, index=True, nullable=False)
    ten_tuyen = Column(String(255), nullable=False)
    diem_dau = Column(String(100), nullable=False)
    diem_cuoi = Column(String(100), nullable=False)
    cu_ly_km = Column(Float, default=15.0)
    thoi_gian_uoc_tinh_gio = Column(Float, default=1.5)
    gia_cuoc_co_ban = Column(Float, default=25000.0)
    khu_vuc = Column(String(50), default="MIEN_BAC", nullable=True)
    dang_hoat_dong = Column(Boolean, default=True)

    don_hang_thuoc_tuyen = relationship("DonHang", back_populates="tuyen_giao")

# 5. Bảng DON_HANG
class DonHang(Base):
    __tablename__ = "don_hang"

    id = Column(Integer, primary_key=True, index=True)
    ma_van_don = Column(String(50), unique=True, index=True, nullable=False)
    
    # Thông tin người gửi
    nguoi_gui_ten = Column(String(255), nullable=False)
    nguoi_gui_sdt = Column(String(50), nullable=False)
    nguoi_gui_dia_chi = Column(String(255), nullable=False)
    nguoi_gui_tinh_thanh = Column(String(100), default="Hà Nội")

    # Thông tin người nhận
    nguoi_nhan_ten = Column(String(255), nullable=False)
    nguoi_nhan_sdt = Column(String(50), nullable=False)
    nguoi_nhan_dia_chi = Column(String(255), nullable=False)
    nguoi_nhan_tinh_thanh = Column(String(100), default="Hà Nội")

    # Chi tiết hàng hóa & Cước phí
    khoi_luong_kg = Column(Float, default=1.0)
    loai_hang_hoa = Column(String(100), default="Bưu phẩm tiêu chuẩn")
    tien_thu_ho_cod = Column(Float, default=0.0)
    cuoc_phi_van_chuyen = Column(Float, default=25000.0)
    tong_tien_thu = Column(Float, default=25000.0)

    # Trạng thái & Phân công
    trang_thai = Column(String(50), default=TrangThaiDonHang.MOI.value, index=True)
    muc_do_uu_tien = Column(String(50), default=MucDoUuTien.CHUAN.value)
    ghi_chu = Column(Text, nullable=True)

    tai_xe_id = Column(Integer, ForeignKey("tai_xe.id"), nullable=True)
    tuyen_giao_id = Column(Integer, ForeignKey("tuyen_giao.id"), nullable=True)
    nguoi_tao_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Quan hệ
    nguoi_tao = relationship("User", back_populates="don_hang_tao")
    tai_xe = relationship("TaiXe", back_populates="don_hang_nhan")
    tuyen_giao = relationship("TuyenGiao", back_populates="don_hang_thuoc_tuyen")
    logs = relationship("LogTrangThai", back_populates="don_hang", cascade="all, delete-orphan", order_by="LogTrangThai.thoi_gian.desc()")
    su_co = relationship("SuCo", back_populates="don_hang", cascade="all, delete-orphan")
    thanh_toan = relationship("ThanhToan", back_populates="don_hang", uselist=False, cascade="all, delete-orphan")

# 6. Bảng LOG_TRANG_THAI
class LogTrangThai(Base):
    __tablename__ = "log_trang_thai"

    id = Column(Integer, primary_key=True, index=True)
    don_hang_id = Column(Integer, ForeignKey("don_hang.id"), nullable=False)
    trang_thai = Column(String(50), nullable=False)
    vi_tri_hien_tai = Column(String(255), nullable=True)
    mo_ta_chi_tiet = Column(String(500), nullable=True)
    thoi_gian = Column(DateTime, default=datetime.utcnow)

    don_hang = relationship("DonHang", back_populates="logs")

# 7. Bảng SU_CO
class SuCo(Base):
    __tablename__ = "su_co"

    id = Column(Integer, primary_key=True, index=True)
    don_hang_id = Column(Integer, ForeignKey("don_hang.id"), nullable=False)
    tai_xe_id = Column(Integer, ForeignKey("tai_xe.id"), nullable=True)
    loai_su_co = Column(String(100), nullable=False)  # Khách hẹn lại / Sai địa chỉ / Hư hỏng / Kẹt xe
    mo_ta = Column(Text, nullable=False)
    trang_thai = Column(String(50), default=TrangThaiSuCo.CHUA_XU_LY.value)  # CHUA_XU_LY, DA_XU_LY
    bien_phap_khac_phuc = Column(Text, nullable=True)
    thoi_gian_tao = Column(DateTime, default=datetime.utcnow)
    thoi_gian_xu_ly = Column(DateTime, nullable=True)

    don_hang = relationship("DonHang", back_populates="su_co")
    tai_xe = relationship("TaiXe", back_populates="su_co_bao_cao")

# 8. Bảng THANH_TOAN
class ThanhToan(Base):
    __tablename__ = "thanh_toan"

    id = Column(Integer, primary_key=True, index=True)
    don_hang_id = Column(Integer, ForeignKey("don_hang.id"), unique=True, nullable=False)
    phuong_thuc = Column(String(50), default=PhuongThucThanhToan.TIEN_MAT.value)
    so_tien = Column(Float, default=0.0)
    trang_thai = Column(String(50), default="CHUA_THANH_TOAN")  # CHUA_THANH_TOAN, DA_THANH_TOAN
    ngay_thanh_toan = Column(DateTime, nullable=True)

    don_hang = relationship("DonHang", back_populates="thanh_toan")
