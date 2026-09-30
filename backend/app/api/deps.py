from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, VaiTroNguoiDung

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    email: str = payload.get("sub")
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_quan_ly(current_user: User = Depends(get_current_user)) -> User:
    if current_user.vai_tro != VaiTroNguoiDung.QUAN_LY.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Thao tác này chỉ dành riêng cho Điều phối viên / Quản lý"
        )
    return current_user

def require_tai_xe(current_user: User = Depends(get_current_user)) -> User:
    if current_user.vai_tro != VaiTroNguoiDung.TAI_XE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Thao tác này chỉ dành riêng cho Tài xế"
        )
    return current_user

def require_khach_hang(current_user: User = Depends(get_current_user)) -> User:
    if current_user.vai_tro != VaiTroNguoiDung.KHACH_HANG.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Thao tác này chỉ dành riêng cho Khách hàng"
        )
    return current_user
