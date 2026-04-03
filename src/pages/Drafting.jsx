import React, { useState } from 'react';
import {
    PenTool,
    Settings,
    FileText,
    Download,
    Save,
    MessageSquare,
    History,
    Check,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import './Drafting.css';

const Drafting = () => {
    const [tone, setTone] = useState('formal');
    const [template, setTemplate] = useState('plaint');

    const [clauses, setClauses] = useState({
        jurisdiction: true,
        costs: true,
        arbitration: false,
        injunction: true
    });

    const toggleClause = (key) => setClauses(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="drafting-container animate-fade-in">
            <div className="drafting-header">
                <div>
                    <h1 className="page-title">AI Drafting Studio</h1>
                    <p className="page-subtitle">Generate and refine legal documents with trained AI assistance.</p>
                </div>
                <div className="drafting-actions">
                    <button className="btn btn-outline">
                        <History size={16} /> Version History
                    </button>
                    <button className="btn btn-outline">
                        <Save size={16} /> Save to Case
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} /> Export (DOCX/PDF)
                    </button>
                </div>
            </div>

            <div className="split-screen-layout">
                {/* Left Panel: Configuration */}
                <div className="config-panel card">
                    <div className="panel-header">
                        <h3><Settings size={18} className="inline-icon" /> Configuration</h3>
                    </div>

                    <div className="config-body">
                        <div className="form-group">
                            <label className="form-label">Template Selection</label>
                            <select
                                className="input-field"
                                value={template}
                                onChange={e => setTemplate(e.target.value)}
                            >
                                <option value="plaint">Civil Plaint (Suit for Recovery)</option>
                                <option value="ws">Written Statement (Defense)</option>
                                <option value="appeal">Memorandum of Appeal</option>
                                <option value="notice">Legal Notice (Defamation)</option>
                                <option value="family">Family Suit (Maintenance)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Legal Tone</label>
                            <div className="tone-selector">
                                {['aggressive', 'formal', 'conciliatory'].map(t => (
                                    <button
                                        key={t}
                                        className={`tone-btn ${tone === t ? 'active' : ''}`}
                                        onClick={() => setTone(t)}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group mt-6">
                            <label className="form-label">Smart Clause Toggles</label>
                            <div className="clause-list">
                                <label className="clause-toggle">
                                    <input type="checkbox" checked={clauses.jurisdiction} onChange={() => toggleClause('jurisdiction')} />
                                    <span className="toggle-slider"></span>
                                    <span className="clause-label">Jurisdictional Paragraph</span>
                                </label>
                                <label className="clause-toggle">
                                    <input type="checkbox" checked={clauses.costs} onChange={() => toggleClause('costs')} />
                                    <span className="toggle-slider"></span>
                                    <span className="clause-label">Prayer for Costs</span>
                                </label>
                                <label className="clause-toggle">
                                    <input type="checkbox" checked={clauses.arbitration} onChange={() => toggleClause('arbitration')} />
                                    <span className="toggle-slider"></span>
                                    <span className="clause-label">Arbitration Reference</span>
                                </label>
                                <label className="clause-toggle">
                                    <input type="checkbox" checked={clauses.injunction} onChange={() => toggleClause('injunction')} />
                                    <span className="toggle-slider"></span>
                                    <span className="clause-label">Prayer for Temporary Injunction</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group mt-6">
                            <label className="form-label">Additional Instructions to AI</label>
                            <textarea
                                className="input-field"
                                rows="4"
                                placeholder="E.g., Emphasize the defendant's repeated failure to respond to the legal notices sent on Oct 12 and Nov 5..."
                            ></textarea>
                        </div>

                        <button className="btn btn-accent w-full mt-4">
                            <RefreshCw size={16} /> Generate Draft
                        </button>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className="preview-panel card">
                    <div className="panel-header preview-header">
                        <h3><FileText size={18} className="inline-icon" /> Live Preview</h3>
                        <div className="preview-status">
                            <span className="badge badge-success"><Check size={12} className="mr-1" /> Draft Generated</span>
                        </div>
                    </div>

                    <div className="editor-workspace">
                        <div className="document-page">
                            <div className="doc-header center-align">
                                <p><strong>IN THE COURT OF THE SENIOR CIVIL JUDGE, LAHORE</strong></p>
                                <p>Suit No. _______ of 2023</p>
                            </div>

                            <div className="doc-parties">
                                <p><strong>Ahmed Khan</strong>, son of Tariq Khan, resident of House 42, Block B, Model Town, Lahore.</p>
                                <p className="party-role text-right">...Plaintiff</p>
                                <p className="center-align my-2">VERSUS</p>
                                <p><strong>Ali Corporation (Pvt) Ltd.</strong>, through its Chief Executive, having its registered office at 15-A, Gulberg III, Lahore.</p>
                                <p className="party-role text-right">...Defendant</p>
                            </div>

                            <div className="doc-title center-align my-4">
                                <h4>SUIT FOR RECOVERY OF RS. 5,000,000/- (RUPEES FIVE MILLION ONLY) ALONG WITH MENSE PROFITS</h4>
                            </div>

                            <div className="doc-body">
                                <p>Respectfully Sheweth:</p>
                                <ol className="doc-list">
                                    <li>That the Plaintiff is a law-abiding citizen of Pakistan and a reputed businessman engaged in the supply of textile machinery.</li>
                                    <li className="ai-highlight">
                                        That on 15.03.2023, the Defendant approached the Plaintiff for the purchase of machinery
                                        <button className="inline-comment-btn" title="AI Suggestion: Specify machinery details">
                                            <MessageSquare size={12} />
                                        </button>
                                        worth Rs. 5,000,000. An agreement in writing was executed between the parties.
                                    </li>
                                    <li>That the Plaintiff delivered the machinery on 20.03.2023, fulfilling all contractual obligations.</li>
                                    {clauses.injunction && (
                                        <li className="ai-highlight-inserted">
                                            That the Plaintiff apprehends the Defendant may alienate its assets, hence a temporary injunction is necessary to prevent the frustration of this decree.
                                        </li>
                                    )}
                                    {clauses.jurisdiction && (
                                        <li>That the cause of action accrued in Lahore, where the agreement was executed and machinery was delivered. Therefore, this Honorable Court has the jurisdiction to adjudicate upon this matter.</li>
                                    )}
                                </ol>

                                <p className="mt-4"><strong>PRAYER:</strong></p>
                                <p>In view of the above, it is respectfully prayed that a decree for the recovery of Rs. 5,000,000/- may be passed in favor of the Plaintiff against the Defendant.</p>
                                {clauses.costs && <p>It is further prayed that the costs of the suit may also be awarded.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Drafting;
