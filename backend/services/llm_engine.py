"""LLM validation engine: chunked Gemini calls, merge, retries, and rate-limit handling."""

from __future__ import annotations

import asyncio
import json
import logging
import math
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

from models.schemas import (
    ChunkLLMResult,
    Contradiction,
    ExtractedSection,
    FullValidationReport,
    MissingClause,
    RiskyClause,
    ValidationIssue,
    ValidationResult,
)
from services.text_pipeline import DocumentChunk

logger = logging.getLogger(__name__)

_backend_dir = Path(__file__).resolve().parent.parent
_env_path = _backend_dir / ".env"
load_dotenv(_env_path, override=True)

_api_key = (os.getenv("GEMINI_API_KEY") or "").strip().strip('"').strip("'")
if not _api_key:
    raise RuntimeError(
        "GEMINI_API_KEY not found. "
        "Please set it in backend/.env (e.g. GEMINI_API_KEY=AIza...)"
    )

_client = genai.Client(api_key=_api_key)
# Default to a widely available Flash model; override with GEMINI_MODEL (lighter tier in .env).
_MODEL = (os.getenv("GEMINI_MODEL") or "gemini-2.0-flash").strip()
logger.info("Gemini model: %s", _MODEL)

_chunk_prompt_path = _backend_dir / "prompts" / "chunk_validation_prompt.txt"
_merge_prompt_path = _backend_dir / "prompts" / "merge_validation_prompt.txt"
_single_prompt_path = _backend_dir / "prompts" / "validation_prompt.txt"
_CHUNK_PROMPT_TEMPLATE = _chunk_prompt_path.read_text(encoding="utf-8")
_MERGE_PROMPT_TEMPLATE = _merge_prompt_path.read_text(encoding="utf-8")
_SINGLE_PROMPT_TEMPLATE = _single_prompt_path.read_text(encoding="utf-8")

_gemini_semaphore = asyncio.Semaphore(1)

MAX_RETRIES = 3
RETRY_DELAY = 10
_MAX_RETRY_WAIT_S = 300
_INTER_CHUNK_DELAY_SEC = float(os.getenv("GEMINI_INTER_CHUNK_DELAY_SEC", "0.75"))
_MERGE_JSON_MAX_CHARS = int(os.getenv("MERGE_INPUT_MAX_CHARS", "100000"))

# chunked = N chunk calls + merge; single = one full-document call (best for tight free-tier quotas).
_VALIDATION_MODE = (os.getenv("GEMINI_VALIDATION_MODE") or "chunked").strip().lower()
_MAX_CHUNKS_RAW = os.getenv("MAX_CHUNKS", "").strip()
_MAX_CHUNKS = int(_MAX_CHUNKS_RAW) if _MAX_CHUNKS_RAW.isdigit() else 0
_SKIP_MERGE_GEMINI = os.getenv("SKIP_MERGE_GEMINI", "").lower() in ("1", "true", "yes")

logger.info(
    "Validation mode: %s (set GEMINI_VALIDATION_MODE=single for fewer API calls)",
    _VALIDATION_MODE,
)
if _MAX_CHUNKS > 0:
    logger.info("MAX_CHUNKS=%s (chunked path only)", _MAX_CHUNKS)
if _SKIP_MERGE_GEMINI:
    logger.info("SKIP_MERGE_GEMINI enabled (chunked path: no merge LLM call)")


class GeminiQuotaError(RuntimeError):
    """Quota / rate-limit errors the user must resolve outside the app."""


class GeminiAuthError(RuntimeError):
    """API key missing, revoked, or expired — must not be swallowed per-chunk."""


class GeminiInvalidModelError(RuntimeError):
    """Model name not accepted by the API."""


_QUOTA_EXHAUSTED_MSG = (
    "Gemini API quota exceeded for this project or model (often free-tier limits). "
    "Try again after a few minutes, enable billing in Google AI Studio, or set GEMINI_MODEL "
    "in backend/.env to another model that still has quota. "
    "Details: https://ai.google.dev/gemini-api/docs/rate-limits"
)


def _parse_retry_seconds(error_str: str) -> int | None:
    m = re.search(r"Please retry in ([\d.]+)\s*s", error_str, re.IGNORECASE)
    if m:
        return max(1, min(_MAX_RETRY_WAIT_S, math.ceil(float(m.group(1)))))
    m = re.search(r"retryDelay['\"]?\s*[:=]\s*['\"]?(\d+)\s*s", error_str, re.IGNORECASE)
    if m:
        return max(1, min(_MAX_RETRY_WAIT_S, int(m.group(1))))
    m = re.search(r"retryDelay.*?'(\d+)s'", error_str)
    if m:
        return max(1, min(_MAX_RETRY_WAIT_S, int(m.group(1))))
    return None


def _is_hard_quota_exhausted(error_str: str) -> bool:
    lower = error_str.lower()
    return "limit: 0" in lower and (
        "429" in error_str
        or "resource_exhausted" in lower
        or "quota exceeded" in lower
    )


def _is_invalid_model_error(error_str: str) -> bool:
    lower = error_str.lower()
    return (
        ("is not found" in lower and "model" in lower)
        or "not a valid model" in lower
        or "invalid model" in lower
        or "invalid model id" in lower
    )


def _is_auth_key_error(error_str: str) -> bool:
    """Expired, revoked, or wrong API key (400/401/403 from Google)."""
    lower = error_str.lower()
    return (
        "api_key_invalid" in lower
        or "api key expired" in lower
        or "invalid api key" in lower
        or ("api key" in lower and ("invalid" in lower or "expired" in lower))
        or "401" in error_str
        or "403" in error_str
        or ("permission denied" in lower and "key" in lower)
    )


_AUTH_HELP_MSG = (
    "Gemini API key is missing, invalid, or expired. Create or renew a key at "
    "https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env"
)


def _log_usage(operation: str, response) -> None:
    """Log token usage when the SDK exposes it; otherwise log response size."""
    meta = getattr(response, "usage_metadata", None)
    if meta is not None:
        logger.info(
            "%s usage: prompt_tokens=%s candidates_tokens=%s total=%s",
            operation,
            getattr(meta, "prompt_token_count", None),
            getattr(meta, "candidates_token_count", None),
            getattr(meta, "total_token_count", None),
        )
    else:
        txt = getattr(response, "text", None) or ""
        logger.info("%s: response length %s chars (no usage_metadata)", operation, len(txt))


# JSON schemas for Gemini structured output
_CHUNK_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "detected_clauses": {"type": "array", "items": {"type": "string"}},
        "missing_or_suspicious": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "clause_name": {"type": "string"},
                    "severity": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["description"],
            },
        },
        "compliance_issues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "severity": {"type": "string"},
                },
                "required": ["description"],
            },
        },
        "ambiguities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"description": {"type": "string"}},
                "required": ["description"],
            },
        },
        "recommendations": {"type": "array", "items": {"type": "string"}},
        "confidence": {"type": "integer"},
    },
    "required": [
        "detected_clauses",
        "missing_or_suspicious",
        "compliance_issues",
        "ambiguities",
        "recommendations",
        "confidence",
    ],
}

_MERGE_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "document_summary": {"type": "string"},
        "extracted_sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "chunk_indices": {"type": "array", "items": {"type": "integer"}},
                    "summary": {"type": "string"},
                },
                "required": ["title", "chunk_indices", "summary"],
            },
        },
        "validation_issues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "severity": {"type": "string"},
                    "chunk_index": {"type": "integer"},
                    "chunk_label": {"type": "string"},
                },
                "required": ["description", "severity", "chunk_index", "chunk_label"],
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
        "risky_clauses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "clause_or_issue": {"type": "string"},
                    "risk_description": {"type": "string"},
                    "chunk_index": {"type": "integer"},
                    "chunk_label": {"type": "string"},
                },
                "required": [
                    "clause_or_issue",
                    "risk_description",
                    "chunk_index",
                    "chunk_label",
                ],
            },
        },
        "recommendations": {"type": "array", "items": {"type": "string"}},
        "processing_notes": {"type": "array", "items": {"type": "string"}},
        "confidence_score": {"type": "integer"},
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
    },
    "required": [
        "document_summary",
        "extracted_sections",
        "validation_issues",
        "missing_clauses",
        "risky_clauses",
        "recommendations",
        "processing_notes",
        "confidence_score",
        "contradictions",
    ],
}

# Legacy single-pass schema (matches validation_prompt.txt output shape).
_LEGACY_RESPONSE_SCHEMA: dict = {
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


async def _generate_json(
    prompt: str,
    response_schema: dict,
    operation: str,
) -> dict:
    """
    Run Gemini with structured JSON output, retries, 429 handling, and exponential backoff
    for other transient errors.
    """
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("%s (attempt %s/%s)", operation, attempt, MAX_RETRIES)
            response = await asyncio.to_thread(
                _client.models.generate_content,
                model=_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=0.2,
                ),
            )
            _log_usage(operation, response)
            raw_text = response.text
            if not raw_text:
                raise RuntimeError("Gemini returned an empty response.")
            return json.loads(raw_text)

        except json.JSONDecodeError as e:
            last_error = f"Failed to parse Gemini response as JSON: {e}"
            logger.error(last_error)
            break

        except Exception as e:
            error_str = str(e)
            last_error = error_str
            logger.error("%s error (attempt %s): %s", operation, attempt, error_str)

            if _is_invalid_model_error(error_str):
                raise GeminiInvalidModelError(
                    f"Invalid or unavailable Gemini model '{_MODEL}'. "
                    "Set GEMINI_MODEL in backend/.env to a model listed in Google AI Studio."
                ) from e

            if _is_auth_key_error(error_str):
                raise GeminiAuthError(_AUTH_HELP_MSG) from e

            if "429" in error_str or "resource exhausted" in error_str.lower():
                if _is_hard_quota_exhausted(error_str):
                    raise GeminiQuotaError(_QUOTA_EXHAUSTED_MSG) from e
                if attempt < MAX_RETRIES:
                    wait = _parse_retry_seconds(error_str) or RETRY_DELAY * attempt
                    wait = max(1, min(wait, _MAX_RETRY_WAIT_S))
                    logger.info("Rate limited. Waiting %ss...", wait)
                    await asyncio.sleep(wait)
                    continue
                raise GeminiQuotaError(_QUOTA_EXHAUSTED_MSG) from e

            if attempt < MAX_RETRIES:
                exp = min(60, RETRY_DELAY * (2 ** (attempt - 1)))
                logger.info("Transient error. Exponential backoff %ss...", exp)
                await asyncio.sleep(exp)
                continue

    if last_error and (
        "429" in last_error
        or "RESOURCE_EXHAUSTED" in last_error
        or "resource exhausted" in last_error.lower()
    ):
        raise GeminiQuotaError(_QUOTA_EXHAUSTED_MSG)

    raise RuntimeError(f"Gemini API error after {MAX_RETRIES} attempts: {last_error}")


async def validate_chunk(chunk: DocumentChunk) -> ChunkLLMResult:
    """Single-chunk validation (structured JSON)."""
    prompt = (
        _CHUNK_PROMPT_TEMPLATE.replace("{chunk_index}", str(chunk.index))
        .replace("{chunk_label}", chunk.label)
        .replace("{chunk_text}", chunk.text)
    )
    data = await _generate_json(prompt, _CHUNK_RESPONSE_SCHEMA, f"chunk_{chunk.index}")
    return ChunkLLMResult(**data)


async def validate_agreement_single(document_text: str) -> FullValidationReport:
    """
    One Gemini call over the full cleaned document (legacy prompt).
    Minimizes API usage for free-tier / low quota projects.
    """
    async with _gemini_semaphore:
        prompt = _SINGLE_PROMPT_TEMPLATE.replace("{document_text}", document_text)
        data = await _generate_json(
            prompt, _LEGACY_RESPONSE_SCHEMA, "single_validation"
        )
        legacy = ValidationResult(**data)
        return _legacy_result_to_full_report(legacy, [])


def _normalize_key(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").lower().strip())[:200]


def _cap_chunks(
    chunks: list[DocumentChunk],
    max_n: int,
    processing_notes: list[str],
) -> list[DocumentChunk]:
    """
    Limit how many Gemini chunk calls run: keep the first max_n-1 chunks and merge
    the rest into one overflow chunk (reindexed).
    """
    if max_n <= 0 or len(chunks) <= max_n:
        return chunks
    processing_notes.append(
        f"Chunk list reduced from {len(chunks)} to {max_n} (MAX_CHUNKS={max_n})."
    )
    head = chunks[: max_n - 1]
    tail = chunks[max_n - 1 :]
    merged_text = "\n\n".join(c.text for c in tail)
    out: list[DocumentChunk] = []
    for i, c in enumerate(head):
        out.append(DocumentChunk(index=i, label=c.label, text=c.text))
    out.append(
        DocumentChunk(
            index=len(out),
            label=f"Merged overflow ({len(tail)} sections)",
            text=merged_text,
        )
    )
    return out


def _legacy_result_to_full_report(
    legacy: ValidationResult,
    processing_notes: list[str],
) -> FullValidationReport:
    """Map single-pass ValidationResult into FullValidationReport for one API shape."""
    notes = list(processing_notes)
    notes.append("validation_mode=single (one Gemini request per upload).")
    return FullValidationReport(
        document_summary=(
            "Full-document analysis in a single API request. "
            "Best for strict free-tier quotas; very long PDFs may omit tail content "
            "if truncated during extraction."
        ),
        extracted_sections=[],
        validation_issues=[],
        missing_clauses=list(legacy.missing_clauses),
        risky_clauses=[],
        recommendations=[],
        processing_notes=notes,
        confidence_score=legacy.confidence_score,
        contradictions=list(legacy.contradictions),
    )


def _python_merge_fallback(
    chunk_records: list[dict],
    processing_notes: list[str],
    *,
    merge_reason: str | None = None,
) -> FullValidationReport:
    """Build a report without a merge LLM call if merge fails or is skipped."""
    notes = list(processing_notes)
    notes.append(
        merge_reason
        or "Merge step used local aggregation (Gemini merge call failed or skipped)."
    )
    all_missing: list[MissingClause] = []
    seen_m = set()
    confidences: list[int] = []
    recommendations: list[str] = []
    validation_issues: list[ValidationIssue] = []
    risky: list[RiskyClause] = []
    sections_map: dict[str, list[int]] = {}

    for rec in chunk_records:
        idx = rec.get("chunk_index", 0)
        label = rec.get("chunk_label", "")
        cr = rec.get("result") or {}
        confidences.append(int(cr.get("confidence", 50)))
        for item in cr.get("missing_or_suspicious") or []:
            key = _normalize_key(
                item.get("clause_name", "") + item.get("description", "")
            )
            if key in seen_m:
                continue
            seen_m.add(key)
            all_missing.append(
                MissingClause(
                    clause_name=item.get("clause_name") or "Unspecified gap",
                    severity=item.get("severity") or "Medium",
                    description=item.get("description") or "",
                )
            )
        for r in cr.get("recommendations") or []:
            if r and r not in recommendations:
                recommendations.append(r)
        for issue in cr.get("compliance_issues") or []:
            validation_issues.append(
                ValidationIssue(
                    description=issue.get("description", ""),
                    severity=issue.get("severity") or "Medium",
                    chunk_index=idx,
                    chunk_label=label,
                )
            )
        for amb in cr.get("ambiguities") or []:
            validation_issues.append(
                ValidationIssue(
                    description="Ambiguity: " + amb.get("description", ""),
                    severity="Low",
                    chunk_index=idx,
                    chunk_label=label,
                )
            )
        for dc in cr.get("detected_clauses") or []:
            if dc:
                sections_map.setdefault(dc, []).append(idx)

    extracted = [
        ExtractedSection(title=k, chunk_indices=sorted(set(v)), summary="Detected in chunk analysis.")
        for k, v in sections_map.items()
    ]
    score = max(0, min(100, sum(confidences) // max(1, len(confidences))))
    return FullValidationReport(
        document_summary="Aggregated chunk-level analysis (merge model unavailable).",
        extracted_sections=extracted[:50],
        validation_issues=validation_issues[:100],
        missing_clauses=all_missing[:100],
        risky_clauses=risky,
        recommendations=recommendations[:50],
        processing_notes=notes,
        confidence_score=score,
        contradictions=[],
    )


async def validate_document_chunks(chunks: list[DocumentChunk]) -> FullValidationReport:
    """
    Validate each chunk sequentially, delay between calls, then merge with Gemini
    (Python fallback on failure, or skip merge if SKIP_MERGE_GEMINI is set).
    """
    if not chunks:
        raise RuntimeError("No document chunks to validate (empty text).")

    processing_notes: list[str] = []
    if _MAX_CHUNKS > 0:
        chunks = _cap_chunks(chunks, _MAX_CHUNKS, processing_notes)

    chunk_records: list[dict] = []

    async with _gemini_semaphore:
        for i, chunk in enumerate(chunks):
            try:
                result = await validate_chunk(chunk)
                chunk_records.append(
                    {
                        "chunk_index": chunk.index,
                        "chunk_label": chunk.label,
                        "result": result.model_dump(),
                    }
                )
            except GeminiAuthError:
                raise
            except GeminiInvalidModelError:
                raise
            except GeminiQuotaError:
                raise
            except Exception as e:
                msg = f"Chunk {chunk.index} failed: {e}"
                logger.warning(msg)
                processing_notes.append(msg)
            if i < len(chunks) - 1:
                await asyncio.sleep(_INTER_CHUNK_DELAY_SEC)

        if not chunk_records:
            raise RuntimeError(
                "All chunks failed validation. Check API key, quota, and PDF text extraction."
            )

        merge_input = json.dumps(chunk_records, ensure_ascii=False)
        if len(merge_input) > _MERGE_JSON_MAX_CHARS:
            merge_input = merge_input[: _MERGE_JSON_MAX_CHARS] + "\n...truncated..."
            processing_notes.append("Merge input truncated for size limits.")

        if _SKIP_MERGE_GEMINI:
            return _python_merge_fallback(
                chunk_records,
                processing_notes,
                merge_reason=(
                    "SKIP_MERGE_GEMINI: merge synthesis skipped to save one API request."
                ),
            )

        merge_prompt = _MERGE_PROMPT_TEMPLATE.replace(
            "{chunk_results_json}", merge_input
        )

        try:
            data = await _generate_json(
                merge_prompt, _MERGE_RESPONSE_SCHEMA, "merge_synthesis"
            )
            try:
                return FullValidationReport(**data)
            except Exception as conv_err:
                logger.warning("Merge JSON invalid for schema: %s", conv_err)
                processing_notes.append(f"Merge response validation: {conv_err}")
                return _python_merge_fallback(
                    chunk_records,
                    processing_notes,
                    merge_reason=None,
                )
        except GeminiAuthError:
            raise
        except GeminiInvalidModelError:
            raise
        except GeminiQuotaError:
            raise
        except Exception as e:
            logger.warning("Merge LLM failed, using Python fallback: %s", e)
            processing_notes.append(f"Merge LLM error: {e}")
            return _python_merge_fallback(
                chunk_records,
                processing_notes,
                merge_reason=None,
            )


async def validate_agreement(document_text: str) -> FullValidationReport:
    """
    Entry point: ``GEMINI_VALIDATION_MODE=single`` uses one full-document Gemini call.
    Default ``chunked`` splits text, validates each chunk, then merges (higher API usage).
    """
    if _VALIDATION_MODE == "single":
        return await validate_agreement_single(document_text)

    from services.text_pipeline import split_into_chunks

    chunks = split_into_chunks(document_text)
    if not chunks:
        raise RuntimeError("No text content after cleaning; cannot validate.")
    return await validate_document_chunks(chunks)
