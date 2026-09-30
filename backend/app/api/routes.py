from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import TuyenGiao
from app.schemas.schemas import TuyenGiaoOut, TuyenGiaoCreate

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get("", response_model=List[TuyenGiaoOut])
def get_routes(db: Session = Depends(get_db)):
    return db.query(TuyenGiao).filter(TuyenGiao.dang_hoat_dong == True).all()

@router.post("", response_model=TuyenGiaoOut)
def create_route(route_in: TuyenGiaoCreate, db: Session = Depends(get_db)):
    route = TuyenGiao(**route_in.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route
