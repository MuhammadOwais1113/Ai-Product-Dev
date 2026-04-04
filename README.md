# 📄 LegalDraft Validation Engine

> **⚠️ Disclaimer:** LegalDraft is an AI-powered validation MVP designed to assist property managers and real estate agents. This tool highlights potential logical errors, ghost data, and missing mandatory clauses, but **does not constitute legal advice**. Always have a qualified legal professional review finalized agreements.

LegalDraft is a full-stack, AI-powered compliance and validation tool customized for **Pakistani Rental Agreements** (such as under the Punjab Rented Premises Act and Transfer of Property Act). 

Real estate agents upload a PDF rental agreement, and the engine automatically scans, parses, and validates the entire document using state-of-the-art Large Language Models to check for critical risks, inconsistencies, and legal omissions prior to signing.

---

## ✨ Key Features

- **Automated Validation**: Instant checking of complex, multi-page PDF agreements.
- **Ghost Data Detection**: Advanced logic algorithms track variables across the document (e.g., mismatched rent values, contradictory notice periods, or varying CNIC names/data).
- **Mandatory Clause Auditing**: Automatically identifies if critical terms (Dispute Resolution, Security Deposit parameters, Eviction clauses) are legally missing or poorly defined.
- **Confidence Scoring**: Each parsed agreement receives an AI-assigned compliance confidence score out of 100 representing its overall structural validity.
- **Full Transparency**: Built-in logic tracking ensuring users understand exactly *how* the AI formulated its reasoning across statutory maps.

---

## 🛠️ Technology Stack

**Frontend**
- **Framework:** React 19 + Vite 7
- **Routing:** React Router 7
- **Styling:** Vanilla CSS Custom Variables (Design System tokens) + Lucide React (Icons)

**Backend**
- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn
- **PDF Extraction:** PyMuPDF (`fitz`) - Lightning-fast native binary extraction, heavily preventing context window overflows.
- **AI Integration:** Google GenAI SDK (`gemini-2.0-flash`)
- **Data Validation:** Pydantic (Strict API schema enforcement for the LLM output)

---

## ⚙️ Prerequisites

To run this project, ensure you have the following installed locally:
- **Node.js** (v18+ recommended)
- **npm**, **yarn**, or **pnpm**
- **Python** (v3.10 or higher)
- **A valid Google Gemini API Key** (Free tier available at [Google AI Studio](https://aistudio.google.com/apikey))

---

## 🚀 Getting Started

The system is disconnected into two fully decoupled services running concurrently.

### 1. Starting the Frontend (React / Vite)
Open a terminal at the project root directory:

```bash
# 1. Install Node dependencies
npm install

# 2. Start the Vite development server
npm run dev
```
> The frontend should now be running at: `http://localhost:5173`

### 2. Starting the Backend (FastAPI)
Open a *second* terminal and navigate into the `backend/` directory:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. (Optional but recommended) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file exactly inside the `backend/` directory and structure it as follows (see also `backend/.env.example`):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
# Optional — change if this model hits free-tier limits (see https://ai.google.dev/gemini-api/docs/rate-limits )
GEMINI_MODEL=gemini-2.0-flash
# Strongly recommended on Gemini free tier (one API call per upload instead of N+1):
GEMINI_VALIDATION_MODE=single
# chunked = split document + one merge call (more requests, richer cross-section merge)
# Optional — chunked only: skip merge LLM (saves 1 call); cross-doc contradictions weaker
# SKIP_MERGE_GEMINI=1
# Optional — chunked only: cap chunk count (overflow merged into last chunk)
# MAX_CHUNKS=3
# Optional — delay between chunk requests (default 0.75) to reduce 429 bursts
GEMINI_INTER_CHUNK_DELAY_SEC=0.75
```

```bash
# 4. Start the Uvicorn server in multi-thread reload mode
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
> The backend REST API is now listening at: `http://localhost:8000`

---

## 📡 API Documentation

### `POST /validate`
Main workhorse endpoint. Consumes a raw PDF form-data file and returns the LLM validation payload.

**Request:**
- `Content-Type: multipart/form-data`
- Body: `file` (Binary PDF File)

**Success Summary (200 OK):**  
The PDF text is cleaned. With **`GEMINI_VALIDATION_MODE=single`** (recommended on free tier), one Gemini request analyzes the full text. With **`chunked`** (the default when this variable is omitted or set to `chunked`), the doc is split into chunks, each chunk is analyzed, then results are merged (more API calls). The response includes **legacy fields** (`confidence_score`, `contradictions`, `missing_clauses`) for the UI plus extended analysis when merge/chunking ran:

```json
{
  "document_summary": "2–5 sentence overview of the agreement.",
  "extracted_sections": [{"title": "Rent", "chunk_indices": [0, 2], "summary": "..."}],
  "validation_issues": [{"description": "...", "severity": "Medium", "chunk_index": 1, "chunk_label": "..."}],
  "missing_clauses": [{"clause_name": "Dispute Resolution", "severity": "Critical", "description": "..."}],
  "risky_clauses": [{"clause_or_issue": "...", "risk_description": "...", "chunk_index": 0, "chunk_label": "..."}],
  "recommendations": ["..."],
  "processing_notes": ["Optional pipeline or chunk warnings."],
  "confidence_score": 88,
  "contradictions": [
    {
      "description": "Security deposit differs between sections.",
      "location_1": "Section 2",
      "location_2": "Schedule A"
    }
  ]
}
```

**Quota / 429:** If Google returns rate limits, set **`GEMINI_VALIDATION_MODE=single`**, try another **`GEMINI_MODEL`** with available quota, or enable billing. Chunked mode uses **several requests per upload**; use **`MAX_CHUNKS`** and **`SKIP_MERGE_GEMINI=1`** to reduce calls, or increase **`GEMINI_INTER_CHUNK_DELAY_SEC`**.

### `GET /health`
System viability check used to verify FastAPI initialization.
**Returns:** `{"status": "ok", "service": "LegalDraft Validation API"}`

---

## 📂 Project Structure

```text
Ai-Product-Dev/
├── backend/
│   ├── main.py                  # Entrypoint, FastAPI App & Routing
│   ├── services/
│   │   ├── llm_engine.py        # Chunked Gemini calls, merge, retries, quotas
│   │   ├── text_pipeline.py     # Clean PDF text + semantic / size chunking
│   │   └── pdf_extractor.py     # PyMuPDF page extraction
│   ├── models/
│   │   └── schemas.py           # Pydantic schemas (FullValidationReport + chunk models)
│   ├── prompts/
│   │   ├── chunk_validation_prompt.txt
│   │   ├── merge_validation_prompt.txt
│   │   └── validation_prompt.txt # Legacy single-pass prompt (unused by default)
│   ├── .env                     # Hidden - Stores API Keys
│   └── requirements.txt         # Server-side PyPI dependencies
├── src/
│   ├── components/              # Shared structural UI parts (Header, Sidebar, Layout)
│   ├── pages/                   # Main Views (Dashboard, ValidationEngine, Security, etc.)
│   ├── App.jsx                  # Main React Component Routing
│   └── index.css                # Global Design Tokens & Base resets
├── public/
├── package.json
└── README.md
```

---

## 🚦 Known Challenges & Engine Mitigations

Developing with experimental LLM wrappers presented notable roadblocks which were actively patched via custom architectural decisions in `llm_engine.py`:

**1. Severe Rate Limiting (HTTP 429)**
* **Issue**: The Gemini 2.0 Flash free-tier limits users to exactly `15 RPM`. Exceeding this boundary throws aggressive exceptions which crash standard HTTP services, demanding exponential retry wait times (e.g., `45s`).
* **Solution**: Designed an intelligent parsing interceptor in Python that actively catches `google.api.core.exceptions`, physically extracts the payload's `retryDelay` request, executes a non-blocking `asyncio.sleep()`, and quietly recalculates the submission up to 3 times entirely automatically behind the scenes (invisible to the frontend UI).

**2. Synchronous Blockages**
* **Issue**: The native Google Generative AI Python SDK blocks the main I/O thread. Calling `generate_content()` locks the FastAPI Uvicorn ASGI server, preventing other frontend users from even hitting simple `/health` status endpoints.
* **Solution**: Bound the LLM queries utilizing `await asyncio.to_thread(_client.models.generate_content, ...)`. This isolates the HTTP query into its own pool, keeping the async frontend API wildly responsive.

**3. MIME-Type Conflicts**
* **Issue**: Validation checks explicitly looking for `"application/pdf"` trigger HTTP 422 errors because platforms send variable content types based on origin.
* **Solution**: Refactored away from strict header checking toward programmatic fallback. The app evaluates standard file extensions and hands it to `fitz` (PyMuPDF) immediately, running a zero-dependency validation pass directly against the file's raw payload bytes. 
