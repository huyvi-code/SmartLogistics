from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.core.database import get_db
from app.models.models import DonHang, TaiXe, SuCo, User, TrangThaiDonHang, TrangThaiSuCo, VaiTroNguoiDung
from app.schemas.schemas import StatsOverview
from app.api.deps import get_current_user

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/overview", response_model=StatsOverview)
def get_stats_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DonHang)
    incident_query = db.query(SuCo)

    # Nếu là Tài xế: Chỉ thống kê các đơn của chính mình
    if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value:
        tai_xe = db.query(TaiXe).filter(TaiXe.user_id == current_user.id).first()
        if tai_xe:
            query = query.filter(DonHang.tai_xe_id == tai_xe.id)
            incident_query = incident_query.filter(SuCo.tai_xe_id == tai_xe.id)
        else:
            return StatsOverview(
                tong_so_don=0, ty_le_giao_thanh_cong=0.0, tong_doanh_thu=0.0,
                don_moi_cho_giao=0, don_dang_giao=0, don_giao_thanh_cong=0,
                don_that_bai=0, tai_xe_hoat_dong=0, su_co_chua_xu_ly=0
            )

    # Nếu là Khách hàng: Chỉ thống kê các đơn do mình gửi/nhận
    elif current_user.vai_tro == VaiTroNguoiDung.KHACH_HANG.value:
        filters = [DonHang.nguoi_tao_id == current_user.id]
        if current_user.so_dien_thoai:
            filters.append(DonHang.nguoi_gui_sdt == current_user.so_dien_thoai)
            filters.append(DonHang.nguoi_nhan_sdt == current_user.so_dien_thoai)
        query = query.filter(or_(*filters))
        incident_query = incident_query.filter(SuCo.don_hang_id.in_(query.with_entities(DonHang.id)))

    tong_so_don = query.count()
    don_giao_thanh_cong = query.filter(DonHang.trang_thai == TrangThaiDonHang.GIAO_THANH_CONG.value).count()
    don_that_bai = query.filter(DonHang.trang_thai == TrangThaiDonHang.THAT_BAI.value).count()
    don_moi_cho_giao = query.filter(DonHang.trang_thai.in_([TrangThaiDonHang.MOI.value, TrangThaiDonHang.DA_LAY_HANG.value])).count()
    don_dang_giao = query.filter(DonHang.trang_thai == TrangThaiDonHang.DANG_GIAO.value).count()

    hoan_thanh = don_giao_thanh_cong + don_that_bai
    ty_le_giao_thanh_cong = round((don_giao_thanh_cong / hoan_thanh * 100), 1) if hoan_thanh > 0 else (100.0 if tong_so_don == 0 else round((don_giao_thanh_cong / tong_so_don * 100), 1))

    # Doanh thu / Cước
    doanh_thu_result = query.with_entities(func.sum(DonHang.cuoc_phi_van_chuyen)).scalar()
    tong_doanh_thu = float(doanh_thu_result) if doanh_thu_result else 0.0

    tai_xe_hoat_dong = db.query(TaiXe).filter(TaiXe.trang_thai_hoat_dong.in_(["SAN_SANG", "DANG_GIAO"])).count() if current_user.vai_tro == VaiTroNguoiDung.QUAN_LY.value else (1 if current_user.vai_tro == VaiTroNguoiDung.TAI_XE.value else 0)
    su_co_chua_xu_ly = incident_query.filter(SuCo.trang_thai == TrangThaiSuCo.CHUA_XU_LY.value).count()

    return StatsOverview(
        tong_so_don=tong_so_don,
        ty_le_giao_thanh_cong=ty_le_giao_thanh_cong,
        tong_doanh_thu=tong_doanh_thu,
        don_moi_cho_giao=don_moi_cho_giao,
        don_dang_giao=don_dang_giao,
        don_giao_thanh_cong=don_giao_thanh_cong,
        don_that_bai=don_that_bai,
        tai_xe_hoat_dong=tai_xe_hoat_dong,
        su_co_chua_xu_ly=su_co_chua_xu_ly
    )
