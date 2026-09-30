from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import KhachHang
from app.schemas.schemas import KhachHangOut, KhachHangCreate

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[KhachHangOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(KhachHang).order_by(KhachHang.id.desc()).all()

@router.post("", response_model=KhachHangOut)
def create_customer(customer_in: KhachHangCreate, db: Session = Depends(get_db)):
    customer = KhachHang(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
