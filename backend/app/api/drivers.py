from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import TaiXe, User, VaiTroNguoiDung
from app.core.security import get_password_hash
from app.schemas.schemas import TaiXeOut, TaiXeCreate

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("", response_model=List[TaiXeOut])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(TaiXe).all()

@router.post("", response_model=TaiXeOut)
def create_driver(driver_in: TaiXeCreate, db: Session = Depends(get_db)):
    user_id = driver_in.user_id

    # If email is provided, create or link a User account for this driver
    if driver_in.email:
        existing_user = db.query(User).filter(User.email == driver_in.email).first()
        if existing_user:
            user_id = existing_user.id
        else:
            new_user = User(
                email=driver_in.email,
                password_hash=get_password_hash(driver_in.password or "driver123"),
                ho_ten=driver_in.ho_ten,
                so_dien_thoai=driver_in.so_dien_thoai,
                vai_tro=VaiTroNguoiDung.TAI_XE.value
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_id = new_user.id

    data = driver_in.model_dump(exclude={"email", "password"})
    data["user_id"] = user_id
    driver = TaiXe(**data)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.patch("/{driver_id}/status", response_model=TaiXeOut)
def update_driver_status(driver_id: int, status: str, db: Session = Depends(get_db)):
    driver = db.query(TaiXe).filter(TaiXe.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài xế")
    driver.trang_thai_hoat_dong = status
    db.commit()
    db.refresh(driver)
    return driver
