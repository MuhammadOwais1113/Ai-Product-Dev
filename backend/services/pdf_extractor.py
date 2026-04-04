"""PDF text extraction service using PyMuPDF."""

import fitz  # PyMuPDF


def extract_page_contents(file_bytes: bytes) -> list[tuple[int, str]]:
    """
    Extract text per PDF page as (1-based page number, text). Skips pages with no text.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Could not open PDF file: {str(e)}") from e

    if doc.page_count == 0:
        raise ValueError("The PDF file contains no pages.")

    pages: list[tuple[int, str]] = []
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        if text and text.strip():
            pages.append((page_num + 1, text.strip()))
    doc.close()

    if not pages:
        raise ValueError(
            "No extractable text found in the PDF. "
            "This may be a scanned document — please upload a text-based PDF."
        )
    return pages


def extract_text(file_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the PDF file.

    Returns:
        Extracted text with page markers.

    Raises:
        ValueError: If the PDF contains no extractable text.
    """
    raw_pages = extract_page_contents(file_bytes)
    pages_text = [f"--- Page {n} ---\n{t}" for n, t in raw_pages]

    full_text = "\n\n".join(pages_text)

    # Truncate extremely long documents to stay within LLM context limits
    max_chars = 80_000  # ~20k tokens, well within Gemini's limits
    if len(full_text) > max_chars:
        full_text = full_text[:max_chars] + "\n\n[... Document truncated due to length ...]"

    return full_text
