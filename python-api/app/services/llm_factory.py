from app.config import settings
from app.clients.huggingface import HuggingFaceLLM
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI


def build_llm():
    provider = settings.llm_provider.lower()

    if provider == "huggingface":
        if not settings.huggingface_api_token:
            raise RuntimeError("HUGGINGFACE_API_TOKEN is required")

        return HuggingFaceLLM(
            token=settings.huggingface_api_token,
            model=settings.huggingface_model,
        )

    if provider == "openai":
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0,
        )

    if provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0,
        )

    raise RuntimeError(f"Unsupported llm_provider: {provider}")
