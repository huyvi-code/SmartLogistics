from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import (
    IncidentSolutionRequest,
    IncidentSolutionResponse,
    AIChatRequest,
    AIChatResponse,
    DriverRecommendationResponse
)
from app.api.deps import get_current_user_optional, require_quan_ly
from app.services.ai_service import (
    generate_incident_solution,
    chat_with_logistics_ai,
    generate_driver_recommendations
)

router = APIRouter(prefix="/ai", tags=["Artificial Intelligence"])

@router.get("/suggest-driver/{order_id}", response_model=DriverRecommendationResponse)
def get_driver_recommendations(
    order_id: int,
    db: Session = Depends(get_db)
):
    """
    Module 3: AI Gợi ý & Đề xuất phân công tài xế thông minh (AI Driver Assignment)
    """
    try:
        return generate_driver_recommendations(order_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi AI gợi ý phân công tài xế: {str(e)}")

@router.post("/suggest-incident-solution", response_model=IncidentSolutionResponse)
def get_incident_solution(
    req: IncidentSolutionRequest,
    db: Session = Depends(get_db)
):
    """
    Module 1: AI Phân tích & Gợi ý giải quyết sự cố giao hàng (Incident Diagnosis & Resolution Copilot)
    """
    try:
        return generate_incident_solution(req.order_id, req.loai_su_co, req.mo_ta, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi AI phân tích sự cố: {str(e)}")

@router.post("/chat", response_model=AIChatResponse)
def ai_assistant_chat(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Module 2: Chatbot AI Tra cứu Vận đơn & Tư vấn Logistics thông minh
    """
    try:
        return chat_with_logistics_ai(req.message, current_user, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi Trợ lý AI: {str(e)}")
