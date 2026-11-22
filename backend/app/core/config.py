import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend root if available
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")


class Settings:
    PROJECT_NAME: str = "ArthaFlow AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "arthaflow-super-secret-key-development-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    
    # Database (PostgreSQL with SQLite fallback for local/test)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/arthaflow.db")
    
    # Fix for Heroku/Render Postgres URL starting with postgres:// instead of postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    # AI / Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Limits
    MAX_CSV_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10MB
    DEFAULT_SAFETY_BUFFER: float = 40000.0  # ₹40,000 baseline reserve


settings = Settings()
