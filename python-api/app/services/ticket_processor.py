import json
from typing import Any

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.exceptions import OutputParserException

from app.schemas import TicketProcessResult
from app.prompts import build_prompt
from app.logging import setup_logger


logger = setup_logger(__name__)


class LLMClassificationError(RuntimeError):
    """Raised when LLM output cannot be validated or parsed."""
    pass


def _extract_json(text: str) -> dict[str, Any]:
    """
    Defensive extraction: ensures LLM output is valid JSON.
    """
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("LLM returned invalid JSON", extra={"output": text})
        raise LLMClassificationError("LLM returned invalid JSON response")


class TicketProcessor:
    def __init__(self, llm):
        self.llm = llm
        self.parser = PydanticOutputParser(
            pydantic_object=TicketProcessResult
        )

    def classify(self, description: str) -> TicketProcessResult:
        prompt_text = build_prompt(description)

        try:
            raw = self.llm.invoke(prompt_text)
            content = raw if isinstance(raw, str) else raw.content

            payload = _extract_json(content)
            return TicketProcessResult.model_validate(payload)

        except OutputParserException:
            logger.exception("Failed to parse structured LLM output")
            raise LLMClassificationError(
                "LLM response could not be parsed"
            )

        except LLMClassificationError:
            raise

        except Exception:
            logger.exception("Unexpected error during LLM classification")
            raise LLMClassificationError(
                "Unexpected error during ticket classification"
            )
