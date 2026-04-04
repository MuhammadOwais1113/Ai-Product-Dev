"""
PDF text cleaning and semantic-ish chunking for chunked LLM validation.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

from services.pdf_extractor import extract_page_contents

# Tunable via environment (optional)
CHUNK_TARGET_CHARS = int(os.getenv("CHUNK_TARGET_CHARS", "5000"))
CHUNK_HARD_MAX_CHARS = int(os.getenv("CHUNK_HARD_MAX_CHARS", "7500"))
CHUNK_OVERLAP_CHARS = int(os.getenv("CHUNK_OVERLAP_CHARS", "400"))
MAX_PIPELINE_CHARS = int(os.getenv("MAX_PIPELINE_CHARS", "120000"))


@dataclass
class DocumentChunk:
    """One chunk of document text sent to the LLM."""

    index: int
    label: str
    text: str


def _strip_boilerplate_lines(page_bodies: list[str], page_count: int) -> list[str]:
    """Remove lines that repeat across many pages (headers/footers/page numbers)."""
    if page_count < 2:
        return page_bodies

    line_counts: dict[str, int] = {}
    for body in page_bodies:
        seen_local: set[str] = set()
        for line in body.split("\n"):
            s = line.strip()
            if len(s) < 2 or len(s) > 120:
                continue
            if re.fullmatch(r"\d{1,4}", s):
                continue
            if s not in seen_local:
                seen_local.add(s)
                line_counts[s] = line_counts.get(s, 0) + 1

    threshold = max(2, int(page_count * 0.4))
    boilerplate = {line for line, c in line_counts.items() if c >= threshold}

    cleaned: list[str] = []
    for body in page_bodies:
        lines_out = []
        for line in body.split("\n"):
            s = line.strip()
            if s in boilerplate:
                continue
            if re.fullmatch(r"Page\s+\d+\s+of\s+\d+", s, re.I):
                continue
            lines_out.append(line)
        cleaned.append("\n".join(lines_out))
    return cleaned


def clean_extracted_text(marked_document: str) -> str:
    """
    Remove repeated headers/footers, collapse whitespace, fix hyphenation line breaks.
    Input uses --- Page N --- markers between page bodies (already joined).
    """
    rx = re.compile(r"--- Page (\d+) ---\n*", re.MULTILINE)
    matches = list(rx.finditer(marked_document))
    if not matches:
        text = marked_document
    else:
        page_bodies: list[str] = []
        markers: list[str] = []
        for i, m in enumerate(matches):
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(marked_document)
            page_bodies.append(marked_document[start:end].strip())
            markers.append(m.group(1))
        cleaned_bodies = _strip_boilerplate_lines(page_bodies, len(page_bodies))
        rebuilt = [
            f"--- Page {markers[j]} ---\n{cleaned_bodies[j]}"
            for j in range(len(cleaned_bodies))
        ]
        text = "\n\n".join(rebuilt)

    # Hyphenated line breaks: wor-\n d -> word
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _split_oversized_paragraph(para: str, max_size: int, overlap: int) -> list[str]:
    """Split a single huge block with character overlap at word boundaries."""
    if len(para) <= max_size:
        return [para]
    out: list[str] = []
    start = 0
    step = max_size - overlap
    while start < len(para):
        end = min(start + max_size, len(para))
        if end < len(para):
            cut = para.rfind(" ", start + max_size // 2, end)
            if cut > start:
                end = cut
        piece = para[start:end].strip()
        if piece:
            out.append(piece)
        if end >= len(para):
            break
        start = max(start + 1, end - overlap)
    return out or [para[:max_size]]


def _semantic_pre_split(text: str) -> list[str]:
    """
    Prefer splits at numbered clauses, ALL-CAPS headings, or page breaks.
    """
    # Page markers always start a new segment
    text = re.sub(r"(\n--- Page \d+ ---\n)", r"\n\1\n", text)
    segments: list[str] = []
    # Split on clause-like starts at line beginning
    pattern = r"(?m)(?=^(?:\d{1,3}[\.\)]\s+[A-Za-z]|\d{1,3}[\.\)]\s*\([a-z]\)|Clause\s+\d+|ARTICLE\s+[IVX\d]+|SCHEDULE\s+[A-Z]))"
    raw_parts = re.split(pattern, text)
    buf = ""
    for p in raw_parts:
        if not p.strip():
            continue
        if len(buf) + len(p) < CHUNK_TARGET_CHARS // 2:
            buf += ("\n\n" if buf else "") + p.strip()
        else:
            if buf:
                segments.append(buf.strip())
            buf = p.strip()
    if buf:
        segments.append(buf.strip())
    return segments if segments else [text]


def split_into_chunks(clean_text: str) -> list[DocumentChunk]:
    """
    Build chunks: semantic pre-split, then merge/split by character budget with overlap.
    """
    if not clean_text.strip():
        return []

    pre = _semantic_pre_split(clean_text)
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    def flush() -> None:
        nonlocal current, current_len
        if current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0

    for seg in pre:
        paras = [p.strip() for p in re.split(r"\n\s*\n+", seg) if p.strip()]
        for para in paras:
            pieces = _split_oversized_paragraph(para, CHUNK_HARD_MAX_CHARS, CHUNK_OVERLAP_CHARS)
            for piece in pieces:
                plen = len(piece) + 2
                if current_len + plen > CHUNK_TARGET_CHARS and current:
                    flush()
                if len(piece) > CHUNK_HARD_MAX_CHARS:
                    for sp in _split_oversized_paragraph(
                        piece, CHUNK_HARD_MAX_CHARS, CHUNK_OVERLAP_CHARS
                    ):
                        if current_len + len(sp) + 2 > CHUNK_TARGET_CHARS and current:
                            flush()
                        current.append(sp)
                        current_len += len(sp) + 2
                    continue
                current.append(piece)
                current_len += plen
                if current_len >= CHUNK_HARD_MAX_CHARS:
                    flush()
    flush()

    doc_chunks: list[DocumentChunk] = []
    for i, body in enumerate(chunks):
        first_line = body.split("\n", 1)[0].strip()[:80]
        label = first_line if first_line else f"Chunk {i}"
        doc_chunks.append(DocumentChunk(index=i, label=label, text=body))
    return doc_chunks


def parse_pdf_text(file_bytes: bytes) -> str:
    """
    Extract PDF text with page markers, clean, and cap total size for the pipeline.
    """
    pages = extract_page_contents(file_bytes)
    marked = "\n\n".join(f"--- Page {n} ---\n{t}" for n, t in pages)
    if len(marked) > MAX_PIPELINE_CHARS:
        marked = (
            marked[:MAX_PIPELINE_CHARS]
            + "\n\n[... Document truncated due to length ...]"
        )
    return clean_extracted_text(marked)
