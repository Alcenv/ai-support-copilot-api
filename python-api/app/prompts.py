from app.schemas import CategoryEnum, SentimentEnum


def build_prompt(description: str) -> str:
    categories = ", ".join([c.value for c in CategoryEnum])
    sentiments = ", ".join([s.value for s in SentimentEnum])

    # Strict and deterministic prompt (avoids extra text)
    return f"""
You are a support ticket classifier.

Return ONLY a valid JSON object with the exact keys:
- category
- sentiment

Allowed values:
- category: [{categories}]
- sentiment: [{sentiments}]

Rules:
- Do NOT add any extra keys.
- Do NOT include explanations.
- Output must be strict JSON (no markdown, no code fences).

Ticket description:
\"\"\"{description}\"\"\"
""".strip()
