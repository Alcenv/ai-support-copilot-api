from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # -------------------------
    # App
    # -------------------------
    app_name: str = "AI Support Copilot API"
    environment: str = "development"

    # CORS (JSON string → List[str])
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # -------------------------
    # Supabase
    # -------------------------
    supabase_url: str
    supabase_service_role_key: str

    # -------------------------
    # LLM
    # -------------------------
    llm_provider: str = "gemini"  # gemini | openai | huggingface

    # Gemini
    gemini_api_key: str | None = None
    gemini_model: str = "models/gemini-1.5-flash"

    # OpenAI
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str | None = None

    # HuggingFace
    huggingface_api_token: str | None = None
    huggingface_model: str = "mistralai/Mistral-7B-Instruct-v0.2"


settings = Settings()
