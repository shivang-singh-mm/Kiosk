from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sales Kiosk Application API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # SQLite async default for easy local zero-config execution; postgres async compatible
    DATABASE_URL: str = "sqlite+aiosqlite:///./kiosk.db"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
