from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import TicketProcessRequest, TicketProcessResponse
from app.clients.supabase import SupabaseConfig, SupabaseTicketsClient
from app.services.ticket_processor import TicketProcessor, LLMClassificationError
from app.services.llm_factory import build_llm
from app.logging import setup_logger


logger = setup_logger(__name__)

app = FastAPI(title=settings.app_name)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Supabase Client
# -------------------------
@lru_cache
def get_supabase_client() -> SupabaseTicketsClient:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase configuration is missing")

    return SupabaseTicketsClient(
        SupabaseConfig(
            url=settings.supabase_url,
            service_role_key=settings.supabase_service_role_key,
        )
    )

# -------------------------
# Ticket Processor
# -------------------------
@lru_cache
def get_ticket_processor() -> TicketProcessor:
    llm = build_llm()
    return TicketProcessor(llm)

# -------------------------
# Health
# -------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.environment,
        "llm_provider": settings.llm_provider,
    }

# -------------------------
# Main Endpoint
# -------------------------
@app.post("/process-ticket", response_model=TicketProcessResponse)
def process_ticket(payload: TicketProcessRequest):
    try:
        processor = get_ticket_processor()
        supabase = get_supabase_client()

        result = processor.classify(payload.description)

        supabase.mark_processed(
            payload.ticket_id,
            category=result.category.value,
            sentiment=result.sentiment.value,
        )

        return TicketProcessResponse(
            ticket_id=payload.ticket_id,
            category=result.category,
            sentiment=result.sentiment,
            processed=True,
        )

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    except LLMClassificationError:
        raise HTTPException(
            status_code=422,
            detail="Ticket could not be processed",
        )

    except RuntimeError:
        logger.exception("Infrastructure failure")
        raise HTTPException(
            status_code=500,
            detail="Internal service error",
        )

    except Exception:
        logger.exception("Unhandled exception in /process-ticket")
        raise HTTPException(
            status_code=500,
            detail="Unexpected server error",
        )
