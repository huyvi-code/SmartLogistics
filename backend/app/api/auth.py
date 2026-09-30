from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, KhachHang, VaiTroNguoiDung
from app.schemas.schemas import UserLogin, UserCreate, UserOut, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản đang bị tạm khóa",
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.vai_tro, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác",
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.vai_tro, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng")
    
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        ho_ten=user_in.ho_ten,
        so_dien_thoai=user_in.so_dien_thoai,
        vai_tro=user_in.vai_tro or VaiTroNguoiDung.KHACH_HANG.value
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if new_user.vai_tro == VaiTroNguoiDung.KHACH_HANG.value:
        cust = KhachHang(
            ten_khach_hang=new_user.ho_ten,
            so_dien_thoai=new_user.so_dien_thoai or "Chưa cập nhật",
            email=new_user.email,
            dia_chi=user_in.dia_chi or "Hà Nội",
            tinh_thanh=user_in.tinh_thanh or "Hà Nội"
        )
        db.add(cust)
        db.commit()

    return new_user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
