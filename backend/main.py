"""LegalDraft Backend — FastAPI application."""

import logging
import sys
from pathlib import Path

# Ensure the backend directory is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Configure logging to show in console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("legaldraft")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services import pdf_extractor, llm_engine
from models.schemas import ValidationResult

app = FastAPI(
    title="LegalDraft Validation API",
    description="AI-powered rental agreement validation for Pakistani real estate agents.",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "LegalDraft Validation API"}


@app.post("/validate", response_model=ValidationResult)
async def validate_agreement(file: UploadFile = File(...)):
    """
    Validate a rental agreement PDF.

    1. Accepts a PDF file upload
    2. Extracts text using PyMuPDF
    3. Sends text to Gemini for analysis
    4. Returns structured validation results
    """
    # --- File validation ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    logger.info(f"Received file: '{file.filename}' (content_type={file.content_type})")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF document.",
        )

    # --- Read file bytes ---
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(file_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(
            status_code=400, detail="File too large. Maximum size is 20MB."
        )

    # --- Extract text from PDF ---
    try:
        document_text = pdf_extractor.extract_text(file_bytes)
        logger.info(f"Extracted {len(document_text)} chars from '{file.filename}'")
    except ValueError as e:
        logger.warning(f"PDF extraction failed: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    # --- Send to LLM for validation ---
    try:
        result = await llm_engine.validate_agreement(document_text)
        logger.info(f"Validation successful for '{file.filename}' — score: {result.confidence_score}")
    except RuntimeError as e:
        logger.error(f"LLM validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
