import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models.models import (
    DonHang, LogTrangThai, TaiXe, TuyenGiao, User, ThanhToan,
    TrangThaiDonHang, MucDoUuTien, VaiTroNguoiDung, PhuongThucThanhToan
)
from app.schemas.schemas import (
    DonHangOut, DonHangCreate, DonHangStatusUpdate, DonHangAssignDriver,
    FeeCalculationRequest, FeeCalculationResponse
)
from app.api.deps import get_current_user, require_quan_ly
from app.services.fee_service import calculate_shipping_fee

router = APIRouter(prefix="/orders", tags=["Orders"])

def tao_ma_van_don(db: Session) -> str:
    while True:
        code = f"VN2026-{random.randint(1000, 9999)}"
        existing = db.query(DonHang).filter(DonHang.ma_van_don == code).first()
        if not existing:
            return code

@router.post("/calculate-fee", response_model=FeeCalculationResponse)
def calculate_fee_endpoint(req: FeeCalculationRequest):
    return calculate_shipping_fee(req)

@router.get("", response_model=List[DonHangOut])
def get_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None, description="Tìm theo mã vận đơn, người nhận, SĐT"),
    tai_xe_id: Optional[int] = None,
    tuyen_giao_id: Optional[int] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DonHang)

    # 1. ÁP DỤNG PHÂN QUYỀN TRUY VẤN DỮ LIỆU THỰC TẾ
    if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value:
        # Tài xế CHỈ được xem đơn hàng được phân công cho chính mình
        tai_xe = db.query(TaiXe).filter(TaiXe.user_id == current_user.id).first()
        if not tai_xe:
            return []
        query = query.filter(DonHang.tai_xe_id == tai_xe.id)

    elif current_user.vai_tro == VaiTroNguoiDung.KHACH_HANG.value:
        # Khách hàng CHỈ được xem đơn hàng do mình tạo hoặc có SĐT trùng khớp
        filters = [DonHang.nguoi_tao_id == current_user.id]
        if current_user.so_dien_thoai:
            filters.append(DonHang.nguoi_gui_sdt == current_user.so_dien_thoai)
            filters.append(DonHang.nguoi_nhan_sdt == current_user.so_dien_thoai)
        query = query.filter(or_(*filters))

    elif current_user.vai_tro == VaiTroNguoiDung.QUAN_LY.value:
        # Quản lý được xem toàn bộ đơn hàng và có thể lọc theo tài xế được chọn
        if tai_xe_id:
            query = query.filter(DonHang.tai_xe_id == tai_xe_id)

    # 2. Các bộ lọc chung
    if status_filter and status_filter != "ALL":
        query = query.filter(DonHang.trang_thai == status_filter)
        
    if tuyen_giao_id:
        query = query.filter(DonHang.tuyen_giao_id == tuyen_giao_id)

    if priority and priority != "ALL":
        query = query.filter(DonHang.muc_do_uu_tien == priority)

    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                DonHang.ma_van_don.ilike(search),
                DonHang.nguoi_gui_ten.ilike(search),
                DonHang.nguoi_nhan_ten.ilike(search),
                DonHang.nguoi_nhan_sdt.ilike(search),
                DonHang.nguoi_gui_sdt.ilike(search)
            )
        )

    return query.order_by(desc(DonHang.created_at)).all()

@router.get("/{order_id}", response_model=DonHangOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DonHang).filter(DonHang.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Kiểm tra quyền xem chi tiết đơn
    if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value:
        tai_xe = db.query(TaiXe).filter(TaiXe.user_id == current_user.id).first()
        if not tai_xe or order.tai_xe_id != tai_xe.id:
            raise HTTPException(status_code=403, detail="Tài xế không có quyền xem đơn hàng này")
    elif current_user.vai_tro == VaiTroNguoiDung.KHACH_HANG.value:
        if order.nguoi_tao_id != current_user.id and order.nguoi_gui_sdt != current_user.so_dien_thoai and order.nguoi_nhan_sdt != current_user.so_dien_thoai:
            raise HTTPException(status_code=403, detail="Khách hàng không có quyền xem đơn hàng của người khác")

    return order

@router.post("", response_model=DonHangOut)
def create_order(
    order_in: DonHangCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tài xế không được tạo đơn vận chuyển mới
    if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value:
        raise HTTPException(status_code=403, detail="Tài xế không có quyền tạo đơn vận chuyển")

    code = tao_ma_van_don(db)

    cuoc_phi = order_in.cuoc_phi_van_chuyen
    tong_tien = order_in.tong_tien_thu
    if not cuoc_phi or cuoc_phi <= 0:
        fee_res = calculate_shipping_fee(FeeCalculationRequest(
            tinh_thanh_gui=order_in.nguoi_gui_tinh_thanh,
            tinh_thanh_nhan=order_in.nguoi_nhan_tinh_thanh,
            khoi_luong_kg=order_in.khoi_luong_kg,
            tien_thu_ho_cod=order_in.tien_thu_ho_cod
        ))
        cuoc_phi = fee_res.cuoc_phi_van_chuyen
        tong_tien = fee_res.tong_tien_thu

    new_order = DonHang(
        ma_van_don=code,
        nguoi_gui_ten=order_in.nguoi_gui_ten,
        nguoi_gui_sdt=order_in.nguoi_gui_sdt,
        nguoi_gui_dia_chi=order_in.nguoi_gui_dia_chi,
        nguoi_gui_tinh_thanh=order_in.nguoi_gui_tinh_thanh,
        nguoi_nhan_ten=order_in.nguoi_nhan_ten,
        nguoi_nhan_sdt=order_in.nguoi_nhan_sdt,
        nguoi_nhan_dia_chi=order_in.nguoi_nhan_dia_chi,
        nguoi_nhan_tinh_thanh=order_in.nguoi_nhan_tinh_thanh,
        khoi_luong_kg=order_in.khoi_luong_kg,
        loai_hang_hoa=order_in.loai_hang_hoa,
        tien_thu_ho_cod=order_in.tien_thu_ho_cod,
        cuoc_phi_van_chuyen=cuoc_phi,
        tong_tien_thu=tong_tien if tong_tien else (order_in.tien_thu_ho_cod + cuoc_phi),
        trang_thai=TrangThaiDonHang.MOI.value,
        muc_do_uu_tien=order_in.muc_do_uu_tien or MucDoUuTien.CHUAN.value,
        ghi_chu=order_in.ghi_chu,
        tuyen_giao_id=order_in.tuyen_giao_id,
        nguoi_tao_id=current_user.id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Log trạng thái khởi tạo
    init_log = LogTrangThai(
        don_hang_id=new_order.id,
        trang_thai=TrangThaiDonHang.MOI.value,
        vi_tri_hien_tai=f"Bưu cục khởi tạo ({new_order.nguoi_gui_tinh_thanh})",
        mo_ta_chi_tiet=f"Đơn hàng được khởi tạo bởi {current_user.ho_ten} ({current_user.vai_tro})"
    )
    db.add(init_log)

    tt = ThanhToan(
        don_hang_id=new_order.id,
        phuong_thuc=PhuongThucThanhToan.TIEN_MAT.value,
        so_tien=new_order.tong_tien_thu,
        trang_thai="CHUA_THANH_TOAN"
    )
    db.add(tt)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}/status", response_model=DonHangOut)
def update_order_status(
    order_id: int,
    status_update: DonHangStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DonHang).filter(DonHang.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Phân quyền cập nhật trạng thái
    if current_user.vai_tro == VaiTroNguoiDung.KHACH_HANG.value:
        raise HTTPException(status_code=403, detail="Khách hàng không có quyền cập nhật trạng thái vận hành của đơn hàng")

    if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value:
        tai_xe = db.query(TaiXe).filter(TaiXe.user_id == current_user.id).first()
        if not tai_xe or order.tai_xe_id != tai_xe.id:
            raise HTTPException(status_code=403, detail="Tài xế chỉ được cập nhật trạng thái các đơn hàng do mình phụ trách")

    order.trang_thai = status_update.trang_thai
    order.updated_at = datetime.utcnow()

    # Nếu thành công -> tự động cập nhật thanh toán
    if status_update.trang_thai == TrangThaiDonHang.GIAO_THANH_CONG.value:
        if order.thanh_toan:
            order.thanh_toan.trang_thai = "DA_THANH_TOAN"
            order.thanh_toan.ngay_thanh_toan = datetime.utcnow()

    loc = status_update.vi_tri or (order.nguoi_nhan_tinh_thanh if status_update.trang_thai in ["GIAO_THANH_CONG", "DANG_GIAO"] else order.nguoi_gui_tinh_thanh)
    mo_ta = status_update.mo_ta or f"{current_user.ho_ten} cập nhật trạng thái: {status_update.trang_thai}"
    
    log = LogTrangThai(
        don_hang_id=order.id,
        trang_thai=status_update.trang_thai,
        vi_tri_hien_tai=loc,
        mo_ta_chi_tiet=mo_ta
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order

@router.patch("/{order_id}/assign", response_model=DonHangOut)
def assign_driver(
    order_id: int,
    assignment: DonHangAssignDriver,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_quan_ly)  # BẮT BUỘC LÀ QUẢN LÝ / ĐIỀU PHỐI
):
    order = db.query(DonHang).filter(DonHang.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    tai_xe = db.query(TaiXe).filter(TaiXe.id == assignment.tai_xe_id).first()
    if not tai_xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài xế")

    order.tai_xe_id = tai_xe.id
    if assignment.tuyen_giao_id:
        order.tuyen_giao_id = assignment.tuyen_giao_id

    if order.trang_thai == TrangThaiDonHang.MOI.value:
        order.trang_thai = TrangThaiDonHang.DA_LAY_HANG.value

    log = LogTrangThai(
        don_hang_id=order.id,
        trang_thai=order.trang_thai,
        vi_tri_hien_tai="Bưu cục điều phối trung tâm",
        mo_ta_chi_tiet=f"Điều phối viên {current_user.ho_ten} đã gán đơn cho tài xế {tai_xe.ho_ten} ({tai_xe.bien_so_xe})"
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order
