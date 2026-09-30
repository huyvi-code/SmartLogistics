from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import SuCo, DonHang, LogTrangThai, TrangThaiSuCo, TrangThaiDonHang
from app.schemas.schemas import SuCoOut, SuCoCreate, SuCoResolve

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[SuCoOut])
def get_incidents(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(SuCo)
    if status and status != "ALL":
        q = q.filter(SuCo.trang_thai == status)
    return q.order_by(desc(SuCo.thoi_gian_tao)).all()

@router.post("", response_model=SuCoOut)
def report_incident(incident_in: SuCoCreate, db: Session = Depends(get_db)):
    order = db.query(DonHang).filter(DonHang.id == incident_in.don_hang_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    incident = SuCo(
        don_hang_id=incident_in.don_hang_id,
        tai_xe_id=incident_in.tai_xe_id or order.tai_xe_id,
        loai_su_co=incident_in.loai_su_co,
        mo_ta=incident_in.mo_ta,
        trang_thai=TrangThaiSuCo.CHUA_XU_LY.value
    )
    db.add(incident)

    order.trang_thai = TrangThaiDonHang.THAT_BAI.value
    order.updated_at = datetime.utcnow()

    log = LogTrangThai(
        don_hang_id=order.id,
        trang_thai=TrangThaiDonHang.THAT_BAI.value,
        vi_tri_hien_tai="Hiện trường / Bưu cục",
        mo_ta_chi_tiet=f"Sự cố giao hàng: {incident_in.loai_su_co} - {incident_in.mo_ta}"
    )
    db.add(log)
    db.commit()
    db.refresh(incident)
    return incident

@router.patch("/{incident_id}/resolve", response_model=SuCoOut)
def resolve_incident(incident_id: int, resolve_in: SuCoResolve, db: Session = Depends(get_db)):
    incident = db.query(SuCo).filter(SuCo.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Không tìm thấy sự cố")

    incident.trang_thai = TrangThaiSuCo.DA_XU_LY.value
    incident.bien_phap_khac_phuc = resolve_in.bien_phap_khac_phuc
    incident.thoi_gian_xu_ly = datetime.utcnow()

    log = LogTrangThai(
        don_hang_id=incident.don_hang_id,
        trang_thai="SỰ CỐ ĐÃ XỬ LÝ",
        vi_tri_hien_tai="Trung tâm điều phối",
        mo_ta_chi_tiet=f"Đã xử lý sự cố: {resolve_in.bien_phap_khac_phuc}"
    )
    db.add(log)
    db.commit()
    db.refresh(incident)
    return incident
