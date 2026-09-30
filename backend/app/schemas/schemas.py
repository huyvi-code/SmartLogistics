from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    ho_ten: str
    so_dien_thoai: Optional[str] = None
    vai_tro: str = "KHACH_HANG"  # QUAN_LY, TAI_XE, KHACH_HANG

class UserCreate(UserBase):
    password: str
    dia_chi: Optional[str] = "Hà Nội"
    tinh_thanh: Optional[str] = "Hà Nội"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Tai Xe Schemas ---
class TaiXeBase(BaseModel):
    ho_ten: str
    so_dien_thoai: str
    so_gplx: str
    loai_xe: str = "Xe tải 1.25 Tấn"
    bien_so_xe: str
    tai_trong_kg: float = 1250.0
    trang_thai_hoat_dong: str = "SAN_SANG"
    danh_gia: float = 5.0

class TaiXeCreate(TaiXeBase):
    user_id: Optional[int] = None
    email: Optional[str] = None
    password: Optional[str] = None

class TaiXeOut(TaiXeBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Tuyen Giao Schemas ---
class TuyenGiaoBase(BaseModel):
    ma_tuyen: str
    ten_tuyen: str
    diem_dau: str
    diem_cuoi: str
    cu_ly_km: float
    thoi_gian_uoc_tinh_gio: float
    gia_cuoc_co_ban: float
    khu_vuc: Optional[str] = "MIEN_BAC"
    dang_hoat_dong: bool = True

class TuyenGiaoCreate(TuyenGiaoBase):
    pass

class TuyenGiaoOut(TuyenGiaoBase):
    id: int

    class Config:
        from_attributes = True

# --- Khach Hang Schemas ---
class KhachHangBase(BaseModel):
    ten_khach_hang: str
    so_dien_thoai: str
    email: Optional[str] = None
    dia_chi: str
    tinh_thanh: str = "Hà Nội"
    ten_cong_ty: Optional[str] = None

class KhachHangCreate(KhachHangBase):
    pass

class KhachHangOut(KhachHangBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Log Trang Thai Schemas ---
class LogTrangThaiOut(BaseModel):
    id: int
    trang_thai: str
    vi_tri_hien_tai: Optional[str] = None
    mo_ta_chi_tiet: Optional[str] = None
    thoi_gian: datetime

    class Config:
        from_attributes = True

# --- Su Co Schemas ---
class SuCoBase(BaseModel):
    don_hang_id: int
    tai_xe_id: Optional[int] = None
    loai_su_co: str
    mo_ta: str

class SuCoCreate(SuCoBase):
    pass

class SuCoResolve(BaseModel):
    bien_phap_khac_phuc: str

class SuCoOut(SuCoBase):
    id: int
    trang_thai: str
    bien_phap_khac_phuc: Optional[str] = None
    thoi_gian_tao: datetime
    thoi_gian_xu_ly: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Thanh Toan Schemas ---
class ThanhToanOut(BaseModel):
    id: int
    don_hang_id: int
    phuong_thuc: str
    so_tien: float
    trang_thai: str
    ngay_thanh_toan: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Don Hang Schemas ---
class DonHangBase(BaseModel):
    nguoi_gui_ten: str
    nguoi_gui_sdt: str
    nguoi_gui_dia_chi: str
    nguoi_gui_tinh_thanh: str = "Hà Nội"
    nguoi_nhan_ten: str
    nguoi_nhan_sdt: str
    nguoi_nhan_dia_chi: str
    nguoi_nhan_tinh_thanh: str = "Hà Nội"
    khoi_luong_kg: float = 1.0
    loai_hang_hoa: str = "Bưu phẩm tiêu chuẩn"
    tien_thu_ho_cod: float = 0.0
    ghi_chu: Optional[str] = None
    muc_do_uu_tien: str = "CHUAN"
    tuyen_giao_id: Optional[int] = None

class DonHangCreate(DonHangBase):
    cuoc_phi_van_chuyen: Optional[float] = None
    tong_tien_thu: Optional[float] = None

class DonHangStatusUpdate(BaseModel):
    trang_thai: str
    mo_ta: Optional[str] = None
    vi_tri: Optional[str] = None

class DonHangAssignDriver(BaseModel):
    tai_xe_id: int
    tuyen_giao_id: Optional[int] = None

class FeeCalculationRequest(BaseModel):
    tinh_thanh_gui: str = "Hà Nội"
    tinh_thanh_nhan: str = "Hà Nội"
    khoi_luong_kg: float = 1.0
    tien_thu_ho_cod: float = 0.0

class FeeCalculationResponse(BaseModel):
    phi_co_ban: float
    phi_khoi_luong: float
    phi_cod: float
    cuoc_phi_van_chuyen: float
    tong_tien_thu: float

class DonHangOut(DonHangBase):
    id: int
    ma_van_don: str
    cuoc_phi_van_chuyen: float
    tong_tien_thu: float
    trang_thai: str
    tai_xe_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    logs: List[LogTrangThaiOut] = []
    su_co: List[SuCoOut] = []
    tai_xe: Optional[TaiXeOut] = None
    tuyen_giao: Optional[TuyenGiaoOut] = None
    thanh_toan: Optional[ThanhToanOut] = None

    class Config:
        from_attributes = True

# --- Stats Schemas ---
class StatsOverview(BaseModel):
    tong_so_don: int
    ty_le_giao_thanh_cong: float
    tong_doanh_thu: float
    don_moi_cho_giao: int
    don_dang_giao: int
    don_giao_thanh_cong: int
    don_that_bai: int
    tai_xe_hoat_dong: int
    su_co_chua_xu_ly: int

# --- AI Schemas ---
class DriverRecommendation(BaseModel):
    tai_xe_id: int
    ho_ten: str
    so_dien_thoai: str
    bien_so_xe: str
    loai_xe: str
    danh_gia: float
    trang_thai_hoat_dong: str
    match_score: int  # 0 to 100%
    tai_trong_con_lai_kg: float
    so_don_dang_giao: int
    ly_do_de_xuat: str
    is_top_choice: bool = False

class DriverRecommendationResponse(BaseModel):
    order_id: int
    ma_van_don: str
    khoi_luong_kg: float
    muc_do_uu_tien: str
    top_recommended_driver_id: Optional[int] = None
    ai_summary: str
    recommendations: List[DriverRecommendation]

class IncidentSolutionRequest(BaseModel):
    order_id: int
    loai_su_co: str
    mo_ta: str

class IncidentSolutionResponse(BaseModel):
    muc_do_nghiem_trong: str  # THAP, TRUNG_BINH, CAO, KHAN_CAP
    nguyen_nhan_du_doan: str
    bien_phap_khac_phuc_goi_y: str
    hanh_dong_tiep_theo: List[str]

class AIChatRequest(BaseModel):
    message: str
    context_order_id: Optional[int] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    related_order: Optional[DonHangOut] = None
    source: str = "ai_engine"

