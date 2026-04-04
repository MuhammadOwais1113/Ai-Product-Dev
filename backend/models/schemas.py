from pydantic import BaseModel, Field


class Contradiction(BaseModel):
    """A contradiction / ghost data item found in the agreement."""

    description: str = Field(
        ...,
        description="What is contradictory — describe the mismatch clearly.",
    )
    location_1: str = Field(
        ...,
        description="Where the first value appears (e.g. 'Section 2 - Rent Amount').",
    )
    location_2: str = Field(
        ...,
        description="Where the conflicting value appears (e.g. 'Appendix A - Payment Schedule').",
    )


class MissingClause(BaseModel):
    """A mandatory clause that is missing from the agreement."""

    clause_name: str = Field(
        ...,
        description="Name of the missing clause (e.g. 'Dispute Resolution Mechanism').",
    )
    severity: str = Field(
        ...,
        description="Severity level: 'Critical', 'High', 'Medium', or 'Low'.",
    )
    description: str = Field(
        ...,
        description="Why this clause is required and what risk its absence poses.",
    )


class ValidationResult(BaseModel):
    """Legacy flat validation result (subset of FullValidationReport)."""

    confidence_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall confidence score from 0-100 reflecting the agreement's compliance level.",
    )
    contradictions: list[Contradiction] = Field(
        default_factory=list,
        description="List of contradictions / ghost data found in the document.",
    )
    missing_clauses: list[MissingClause] = Field(
        default_factory=list,
        description="List of mandatory clauses missing from the document.",
    )


# --- Chunk pipeline models ---


class ChunkSuspiciousItem(BaseModel):
    """Missing or suspicious clause reference from a chunk-level pass."""

    clause_name: str = Field(default="", description="Short name of clause or gap.")
    severity: str = Field(default="Medium", description="Critical, High, Medium, or Low.")
    description: str = Field(..., description="What is missing or suspicious.")


class ChunkComplianceIssue(BaseModel):
    description: str
    severity: str = Field(default="Medium")


class ChunkAmbiguity(BaseModel):
    description: str


class ChunkLLMResult(BaseModel):
    """Structured JSON returned by Gemini for one chunk (before we attach indices)."""

    detected_clauses: list[str] = Field(default_factory=list)
    missing_or_suspicious: list[ChunkSuspiciousItem] = Field(default_factory=list)
    compliance_issues: list[ChunkComplianceIssue] = Field(default_factory=list)
    ambiguities: list[ChunkAmbiguity] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    confidence: int = Field(..., ge=0, le=100)


class ValidationIssue(BaseModel):
    """Unified issue with chunk provenance for the final report."""

    description: str
    severity: str = Field(default="Medium")
    chunk_index: int = Field(default=-1, ge=-1)
    chunk_label: str = Field(default="")


class RiskyClause(BaseModel):
    clause_or_issue: str
    risk_description: str
    chunk_index: int = Field(default=-1, ge=-1)
    chunk_label: str = Field(default="")


class ExtractedSection(BaseModel):
    title: str = Field(default="")
    chunk_indices: list[int] = Field(default_factory=list)
    summary: str = Field(default="")


class FullValidationReport(BaseModel):
    """
    Full API response: extended fields plus legacy keys for the React UI.
    """

    document_summary: str = Field(default="", description="High-level summary of the agreement.")
    extracted_sections: list[ExtractedSection] = Field(default_factory=list)
    validation_issues: list[ValidationIssue] = Field(default_factory=list)
    missing_clauses: list[MissingClause] = Field(default_factory=list)
    risky_clauses: list[RiskyClause] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    processing_notes: list[str] = Field(default_factory=list)
    confidence_score: int = Field(..., ge=0, le=100)
    contradictions: list[Contradiction] = Field(default_factory=list)
