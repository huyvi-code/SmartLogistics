from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.models import *
from app.services.seed_data import init_db_data

from app.api.auth import router as auth_router
from app.api.orders import router as orders_router
from app.api.tracking import router as tracking_router
from app.api.drivers import router as drivers_router
from app.api.routes import router as routes_router
from app.api.customers import router as customers_router
from app.api.incidents import router as incidents_router
from app.api.stats import router as stats_router
from app.api.ai import router as ai_router

# Initialize Database tables
Base.metadata.create_all(bind=engine)

# Seed Initial Demo Data
db = SessionLocal()
try:
    init_db_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Hệ thống Quản lý Vận tải Giao hàng Thông minh (SmartLogistics TMS) - Backend API",
    version="1.0.0"
)

# Enable CORS for Frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(tracking_router, prefix=settings.API_V1_STR)
app.include_router(drivers_router, prefix=settings.API_V1_STR)
app.include_router(routes_router, prefix=settings.API_V1_STR)
app.include_router(customers_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "Online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
