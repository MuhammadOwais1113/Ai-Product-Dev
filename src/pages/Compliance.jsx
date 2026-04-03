import React from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    ChevronRight,
    ShieldAlert,
    FileCheck
} from 'lucide-react';
import './Compliance.css';

const Compliance = () => {
    return (
        <div className="compliance-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Validation & Compliance</h1>
                    <p className="page-subtitle">Automated procedural and statutory verification for drafted documents.</p>
                </div>
                <button className="btn btn-primary">
                    <FileCheck size={16} /> Run Full Audit
                </button>
            </div>

            <div className="compliance-overview">
                <div className="card overview-card text-center">
                    <div className="score-ring high-risk">
                        <span className="score-value">72</span>
                        <span className="score-max">/100</span>
                    </div>
                    <h3 className="mt-4">Overall Compliance Score</h3>
                    <p className="text-muted text-sm mt-2">Document: Final_Plaint_v3.docx</p>
                    <div className="risk-indicator mt-4 bg-danger-light text-danger border-danger">
                        <ShieldAlert size={16} /> High Risk Detected
                    </div>
                </div>

                <div className="overview-stats">
                    <div className="stat-box">
                        <div className="stat-icon bg-success-light text-success"><CheckCircle size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-num">18</span>
                            <span className="stat-label">Checks Passed</span>
                        </div>
                    </div>
                    <div className="stat-box border-warning-left">
                        <div className="stat-icon bg-warning-light text-warning"><AlertTriangle size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-num">3</span>
                            <span className="stat-label">Warnings</span>
                        </div>
                    </div>
                    <div className="stat-box border-danger-left">
                        <div className="stat-icon bg-danger-light text-danger"><XCircle size={24} /></div>
                        <div className="stat-details">
                            <span className="stat-num">2</span>
                            <span className="stat-label">Critical Errors</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="compliance-grid">
                <div className="card audit-list-card">
                    <div className="card-header">
                        <h2><ShieldAlert className="inline-icon text-danger" /> Critical Statutory Errors (Must Fix)</h2>
                    </div>
                    <div className="audit-items">
                        <div className="audit-item error">
                            <div className="audit-meta">
                                <h4>Missing Court Fee Calculation</h4>
                                <p>Section 7 of Court Fees Act, 1870</p>
                            </div>
                            <div className="audit-desc">
                                <p>The plaint claims recovery of Rs. 5,000,000 but does not explicitly state the ad-valorem court fee paid or attach the schedule.</p>
                                <div className="ai-correction">
                                    <strong>AI Suggestion:</strong> Add paragraph: "That the value of the suit for purposes of court fee and jurisdiction is Rs. 5,000,000/- upon which a maximum court fee of Rs. 15,000/- has been affixed."
                                    <button className="btn btn-sm btn-outline mt-2">Apply Fix</button>
                                </div>
                            </div>
                        </div>

                        <div className="audit-item error">
                            <div className="audit-meta">
                                <h4>Incorrect Limitation Period Cited</h4>
                                <p>Limitation Act, 1908 (Article 14)</p>
                            </div>
                            <div className="audit-desc">
                                <p>Draft incorrectly cites a 3-year limitation for setting aside an act of a statutory body. The correct period is 1 year.</p>
                                <div className="ai-correction">
                                    <strong>AI Suggestion:</strong> Revise paragraph 8 to reflect the 1-year limitation under Article 14.
                                    <button className="btn btn-sm btn-outline mt-2">Apply Fix</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card audit-list-card">
                    <div className="card-header">
                        <h2><AlertTriangle className="inline-icon text-warning" /> Procedural Warnings (Review Recommended)</h2>
                    </div>
                    <div className="audit-items">
                        <div className="audit-item warning">
                            <div className="audit-meta">
                                <h4>Verification Clause Structure</h4>
                                <p>Order VI, Rule 15 CPC</p>
                            </div>
                            <div className="audit-desc">
                                <p>Verification clause does not strictly demarcate which paragraphs are verified on personal knowledge vs. information/belief.</p>
                                <button className="text-link text-sm mt-1">View standard template</button>
                            </div>
                        </div>
                        <div className="audit-item warning">
                            <div className="audit-meta">
                                <h4>Ambiguous Prayer</h4>
                                <p>General Drafting Practice</p>
                            </div>
                            <div className="audit-desc">
                                <p>Prayer clause (c) asks for "any other relief" but lacks the phrase "which this Honorable Court deems fit and proper."</p>
                                <button className="text-link text-sm mt-1">Auto-correct</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card audit-list-card">
                    <div className="card-header">
                        <h2><CheckCircle className="inline-icon text-success" /> Passed Checks (Sample)</h2>
                    </div>
                    <div className="audit-items">
                        <div className="audit-item success">
                            <div className="audit-meta">
                                <h4>Jurisdiction Clause</h4>
                                <p>Section 15-20 CPC</p>
                            </div>
                        </div>
                        <div className="audit-item success">
                            <div className="audit-meta">
                                <h4>Parties Identification</h4>
                                <p>Order I CPC</p>
                            </div>
                        </div>
                        <div className="audit-item success">
                            <div className="audit-meta">
                                <h4>Format and Margins</h4>
                                <p>High Court Rules and Orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compliance;
