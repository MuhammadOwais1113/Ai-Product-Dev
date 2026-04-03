"""LLM validation engine using Google Gemini API."""

import asyncio
import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

from models.schemas import ValidationResult

logger = logging.getLogger(__name__)

# Load environment variables from backend/.env
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")

# Load the prompt template
_prompt_path = _backend_dir / "prompts" / "validation_prompt.txt"
_PROMPT_TEMPLATE = _prompt_path.read_text(encoding="utf-8")

# Initialize Gemini client
_api_key = os.getenv("GEMINI_API_KEY")
if not _api_key:
    raise RuntimeError(
        "GEMINI_API_KEY not found. "
        "Please set it in backend/.env (e.g. GEMINI_API_KEY=AIza...)"
    )

_client = genai.Client(api_key=_api_key)
_MODEL = "gemini-2.0-flash"

# JSON schema for structured output
_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "confidence_score": {
            "type": "integer",
            "description": "Overall compliance confidence score from 0 to 100",
        },
        "contradictions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "location_1": {"type": "string"},
                    "location_2": {"type": "string"},
                },
                "required": ["description", "location_1", "location_2"],
            },
        },
        "missing_clauses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "clause_name": {"type": "string"},
                    "severity": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["clause_name", "severity", "description"],
            },
        },
    },
    "required": ["confidence_score", "contradictions", "missing_clauses"],
}

MAX_RETRIES = 3
RETRY_DELAY = 10  # seconds (Gemini rate limit can ask for 45s, so we use longer waits)


async def validate_agreement(document_text: str) -> ValidationResult:
    """
    Send the extracted document text to Gemini for validation analysis.
    Includes retry logic for transient API errors.
    """
    prompt = _PROMPT_TEMPLATE.replace("{document_text}", document_text)

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"Calling Gemini API (attempt {attempt}/{MAX_RETRIES})...")

            # Run the synchronous Gemini call in a thread pool
            # to avoid blocking the async event loop
            response = await asyncio.to_thread(
                _client.models.generate_content,
                model=_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=_RESPONSE_SCHEMA,
                    temperature=0.2,
                ),
            )

            raw_text = response.text
            if not raw_text:
                raise RuntimeError("Gemini returned an empty response.")

            logger.info(f"Gemini response received ({len(raw_text)} chars)")

            data = json.loads(raw_text)
            result = ValidationResult(**data)

            logger.info(
                f"Validation complete — score: {result.confidence_score}, "
                f"contradictions: {len(result.contradictions)}, "
                f"missing_clauses: {len(result.missing_clauses)}"
            )
            return result

        except json.JSONDecodeError as e:
            last_error = f"Failed to parse Gemini response as JSON: {e}"
            logger.error(last_error)
            # Don't retry JSON parse errors — the response is malformed
            break

        except Exception as e:
            error_str = str(e)
            last_error = error_str
            logger.error(f"Gemini API error (attempt {attempt}): {error_str}")

            # Check for auth errors — don't retry those
            if "api key" in error_str.lower() or "403" in error_str or "401" in error_str:
                raise RuntimeError(
                    "Gemini API authentication failed. "
                    "Please check your API key in backend/.env"
                )

            # Check for rate limit — wait and retry
            if "429" in error_str or "resource exhausted" in error_str.lower():
                if attempt < MAX_RETRIES:
                    # Try to extract Gemini's requested delay
                    import re
                    delay_match = re.search(r"retryDelay.*?'(\d+)s'", error_str)
                    wait = int(delay_match.group(1)) if delay_match else RETRY_DELAY * attempt
                    logger.info(f"Rate limited by Gemini. Waiting {wait}s before retry...")
                    await asyncio.sleep(wait)
                    continue

            # For other transient errors, retry with backoff
            if attempt < MAX_RETRIES:
                wait = RETRY_DELAY * attempt
                logger.info(f"Transient error. Retrying in {wait}s...")
                await asyncio.sleep(wait)
                continue

    raise RuntimeError(f"Gemini API error after {MAX_RETRIES} attempts: {last_error}")
