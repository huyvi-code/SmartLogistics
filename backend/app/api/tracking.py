from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import DonHang
from app.schemas.schemas import DonHangOut

router = APIRouter(prefix="/tracking", tags=["Tracking"])

@router.get("/{tracking_number}", response_model=DonHangOut)
def track_order_public(tracking_number: str, db: Session = Depends(get_db)):
    clean_code = tracking_number.strip().upper()
    order = db.query(DonHang).filter(DonHang.ma_van_don == clean_code).first()
    if not order:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy thông tin cho mã vận đơn '{clean_code}'. Vui lòng kiểm tra lại."
        )
    return order
