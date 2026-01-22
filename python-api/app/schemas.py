from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CategoryEnum(str, Enum):
    TECHNICAL = "Technical"
    BILLING = "Billing"
    COMMERCIAL = "Commercial"


class SentimentEnum(str, Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"


class TicketProcessRequest(BaseModel):
    ticket_id: UUID = Field(..., description="Supabase ticket UUID")
    description: str = Field(..., min_length=3, max_length=20_000)

    @field_validator("description")
    @classmethod
    def strip_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("description cannot be empty")
        return v


class TicketProcessResult(BaseModel):
    category: CategoryEnum
    sentiment: SentimentEnum


class TicketProcessResponse(BaseModel):
    ticket_id: UUID
    category: CategoryEnum
    sentiment: SentimentEnum
    processed: bool = True
