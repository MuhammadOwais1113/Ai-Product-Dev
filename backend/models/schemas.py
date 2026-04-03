from pydantic import BaseModel, Field


class Contradiction(BaseModel):
    """A contradiction / ghost data item found in the agreement."""
    description: str = Field(
        ..., description="What is contradictory — describe the mismatch clearly."
    )
    location_1: str = Field(
        ..., description="Where the first value appears (e.g. 'Section 2 - Rent Amount')."
    )
    location_2: str = Field(
        ..., description="Where the conflicting value appears (e.g. 'Appendix A - Payment Schedule')."
    )


class MissingClause(BaseModel):
    """A mandatory clause that is missing from the agreement."""
    clause_name: str = Field(
        ..., description="Name of the missing clause (e.g. 'Dispute Resolution Mechanism')."
    )
    severity: str = Field(
        ..., description="Severity level: 'Critical', 'High', 'Medium', or 'Low'."
    )
    description: str = Field(
        ..., description="Why this clause is required and what risk its absence poses."
    )


class ValidationResult(BaseModel):
    """The complete validation result returned by the LLM engine."""
    confidence_score: int = Field(
        ..., ge=0, le=100,
        description="Overall confidence score from 0-100 reflecting the agreement's compliance level."
    )
    contradictions: list[Contradiction] = Field(
        default_factory=list,
        description="List of contradictions / ghost data found in the document."
    )
    missing_clauses: list[MissingClause] = Field(
        default_factory=list,
        description="List of mandatory clauses missing from the document."
    )
