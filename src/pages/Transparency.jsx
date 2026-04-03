import React from 'react';
import {
    ShieldCheck,
    BookOpen,
    GitMerge,
    BarChart2,
    HelpCircle,
    Link,
    Zap,
    CheckCircle,
    AlertTriangle,
    Info
} from 'lucide-react';
import './Transparency.css';

const Transparency = () => {
    return (
        <div className="transparency-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Explainability & Transparency</h1>
                    <p className="page-subtitle">Understand how LegalDraft's AI formulates reasoning and tracks document provenance.</p>
                </div>
                <div className="confidence-badge">
                    <ShieldCheck size={18} className="text-success" />
                    <span>System Confidence: <strong>High (94%)</strong></span>
                </div>
            </div>

            <div className="transparency-grid">
                {/* Left Column: Traceability */}
                <div className="left-panel">
                    <div className="card h-full">
                        <div className="card-header">
                            <h2><GitMerge className="inline-icon text-primary" /> AI Reasoning Trace</h2>
                            <button className="icon-btn" title="How to read this"><HelpCircle size={16} /></button>
                        </div>

                        <div className="trace-container">
                            <p className="text-sm text-muted mb-4">Tracking logical steps for Draft Inference ID: #LM-924A</p>

                            <div className="logic-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Fact Extraction</h4>
                                    <p>Identified core issue: "Breach of commercial lease due to non-payment of rent for 3 consecutive months."</p>
                                    <div className="step-source"><Zap size={12} /> Extracted from user input notes.</div>
                                </div>
                            </div>

                            <div className="logic-connector"></div>

                            <div className="logic-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Statutory Mapping</h4>
                                    <p>Mapped to Punjab Rented Premises Act, 2009.</p>
                                    <div className="step-source"><Link size={12} /> Referenced: Section 15 (Eviction of Tenant).</div>
                                </div>
                            </div>

                            <div className="logic-connector"></div>

                            <div className="logic-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Precedent Application</h4>
                                    <p>Evaluated defense of "force majeure" due to economic downturn.</p>
                                    <div className="step-source precedent-link text-info">
                                        <Link size={12} /> Applied: 2020 CLC 1422 (Economic hardship is not force majeure in lease agreements).
                                    </div>
                                </div>
                            </div>

                            <div className="logic-connector"></div>

                            <div className="logic-step highlight-step">
                                <div className="step-number"><CheckCircle size={16} /></div>
                                <div className="step-content">
                                    <h4>Conclusion / Draft Generation</h4>
                                    <p>Drafted eviction petition asserting absolute liability of the tenant without equitable relief for financial hardship.</p>
                                    <div className="confidence-meter">
                                        <div className="meter-label">
                                            <span>Inference Confidence</span>
                                            <span>96%</span>
                                        </div>
                                        <div className="meter-bar bg-success-light"><div className="meter-fill bg-success" style={{ width: '96%' }}></div></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Column: Stats and Sources */}
                <div className="right-panel">
                    <div className="card mb-6">
                        <div className="card-header">
                            <h2><BookOpen className="inline-icon text-accent" /> Cited Statutes & Authorities</h2>
                        </div>
                        <div className="citations-list">
                            <div className="citation-item">
                                <span className="citation-badge bg-primary-light text-primary">Statute</span>
                                <span className="citation-name">Punjab Rented Premises Act, 2009 (Sec 15, 19)</span>
                            </div>
                            <div className="citation-item">
                                <span className="citation-badge bg-info-light text-info">Case Law</span>
                                <span className="citation-name">2020 CLC 1422 (Lahore)</span>
                            </div>
                            <div className="citation-item">
                                <span className="citation-badge bg-info-light text-info">Case Law</span>
                                <span className="citation-name">PLD 2018 SC 34</span>
                            </div>
                            <div className="citation-item">
                                <span className="citation-badge bg-warning-light text-warning">Regulation</span>
                                <span className="citation-name">Stamp Act, 1899 (Article 35)</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2><BarChart2 className="inline-icon text-info" /> Historical Outcome Trends</h2>
                        </div>
                        <div className="trends-content">
                            <p className="text-sm text-muted mb-4">Based on 450 similar eviction petitions in Lahore District Courts (2018-2023)</p>

                            <div className="stat-row">
                                <div className="stat-label">Eviction Ordered</div>
                                <div className="stat-bar-container">
                                    <div className="stat-bar bg-primary" style={{ width: '68%' }}></div>
                                    <span className="stat-percent">68%</span>
                                </div>
                            </div>

                            <div className="stat-row">
                                <div className="stat-label">Settled out of Court</div>
                                <div className="stat-bar-container">
                                    <div className="stat-bar bg-success" style={{ width: '24%' }}></div>
                                    <span className="stat-percent">24%</span>
                                </div>
                            </div>

                            <div className="stat-row">
                                <div className="stat-label">Petition Dismissed</div>
                                <div className="stat-bar-container">
                                    <div className="stat-bar bg-danger" style={{ width: '8%' }}></div>
                                    <span className="stat-percent">8%</span>
                                </div>
                            </div>

                            <div className="insight-box mt-4 bg-primary-light">
                                <Zap size={16} className="text-primary mr-2" />
                                <span className="text-sm">Strategic Insight: Cases citing 2020 CLC 1422 explicitly in the initial petition have a 14% higher early settlement rate.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Limitations Section */}
            <div className="card limitations-card" id="technical-limitations">
                <div className="card-header">
                    <h2><AlertTriangle className="inline-icon text-warning" /> Technical Limitations & How It Works</h2>
                </div>
                <div className="limitations-content">
                    <div className="limitation-callout">
                        <Info size={18} className="limitation-callout-icon" />
                        <p>
                            This MVP utilizes LLM-based text extraction and may occasionally produce
                            false positives or miss nuanced contextual clauses. The system is designed
                            to assist — not replace — professional legal review.
                        </p>
                    </div>

                    <div className="limitations-grid">
                        <div className="limitation-item">
                            <h4>📄 Text Extraction</h4>
                            <p>
                                Documents are processed using AI-powered OCR and text parsing.
                                Scanned PDFs or low-quality images may yield incomplete extractions.
                            </p>
                        </div>
                        <div className="limitation-item">
                            <h4>🔍 Clause Matching</h4>
                            <p>
                                The system compares extracted clauses against a statutory checklist.
                                Non-standard clause phrasing may not be recognized accurately.
                            </p>
                        </div>
                        <div className="limitation-item">
                            <h4>⚖️ Contradiction Detection</h4>
                            <p>
                                Ghost data (conflicting values) is detected via contextual comparison.
                                Implicit contradictions may require human judgment to identify.
                            </p>
                        </div>
                        <div className="limitation-item">
                            <h4>📊 Confidence Scoring</h4>
                            <p>
                                Scores reflect statistical confidence in the analysis, not legal validity.
                                A high score does not guarantee compliance with all applicable laws.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transparency;
