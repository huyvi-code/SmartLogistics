import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartLogistics TMS"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "smart-logistics-super-secret-key-graduation-project-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite Database URI (Absolute path to ensure it works from any CWD)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'smart_logistics.db')).replace(os.sep, '/')}"
    )
    
    # Optional Gemini / Generative AI Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True
        extra = "ignore"

settings = Settings()
