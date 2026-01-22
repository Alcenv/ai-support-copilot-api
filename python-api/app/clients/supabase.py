from dataclasses import dataclass
from uuid import UUID

from supabase import create_client, Client

from app.logging import setup_logger


logger = setup_logger(__name__)


@dataclass(frozen=True)
class SupabaseConfig:
    url: str
    service_role_key: str


class SupabaseTicketsClient:
    def __init__(self, cfg: SupabaseConfig):
        if not cfg.url or not cfg.service_role_key:
            raise ValueError("SupabaseConfig is invalid")

        try:
            self._client: Client = create_client(
                cfg.url,
                cfg.service_role_key,
            )
        except Exception:
            logger.exception("Failed to initialize Supabase client")
            raise RuntimeError("Supabase initialization failed")

    def mark_processed(
        self,
        ticket_id: UUID,
        *,
        category: str,
        sentiment: str,
    ) -> None:
        resp = (
            self._client
            .table("tickets")
            .update(
                {
                    "category": category,
                    "sentiment": sentiment,
                    "processed": True,
                }
            )
            .eq("id", str(ticket_id))
            .execute()
        )

        data = getattr(resp, "data", None)
        if not data:
            logger.info(
                "Ticket not found during update",
                extra={"ticket_id": str(ticket_id)},
            )
            raise ValueError("Ticket not found")
