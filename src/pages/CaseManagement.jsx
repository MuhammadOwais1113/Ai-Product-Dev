import React, { useState } from 'react';
import {
    Briefcase,
    MapPin,
    Scale,
    Users,
    AlignLeft,
    Paperclip,
    CheckCircle,
    Clock,
    MessageSquare,
    Plus
} from 'lucide-react';
import './CaseManagement.css';

const CaseManagement = () => {
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'view'

    return (
        <div className="case-management-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Case Management</h1>
                    <p className="page-subtitle">Create new dockets and track active suit proceedings.</p>
                </div>
                <div className="header-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create New Case
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                    >
                        Active Cases (14)
                    </button>
                </div>
            </div>

            {activeTab === 'create' ? (
                <div className="case-form-card card">
                    <h2 className="form-section-title"><Briefcase size={20} className="inline-icon text-primary" /> Case Details</h2>
                    <form className="case-form">
                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label className="form-label">Case Title</label>
                                <input type="text" className="input-field" placeholder="e.g., Khan vs. Ali Corporation" />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Legal Domain</label>
                                <div className="input-with-icon">
                                    <Scale size={18} className="input-icon" />
                                    <select className="input-field icon-pad">
                                        <option value="civil">General Civil Law</option>
                                        <option value="family">Family Law</option>
                                        <option value="corporate">Corporate / Commercial</option>
                                        <option value="property">Property Dispute</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Jurisdiction / Court</label>
                                <div className="input-with-icon">
                                    <MapPin size={18} className="input-icon" />
                                    <select className="input-field icon-pad">
                                        <option value="lhc">Lahore High Court</option>
                                        <option value="shc">Sindh High Court</option>
                                        <option value="ihc">Islamabad High Court</option>
                                        <option value="scp">Supreme Court of Pakistan</option>
                                        <option value="district">District Court</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Case Status</label>
                                <select className="input-field">
                                    <option value="research">Pre-Litigation / Research</option>
                                    <option value="drafting">Drafting Pleadings</option>
                                    <option value="validation">Validation & Internal Review</option>
                                    <option value="filed">Filed in Court</option>
                                </select>
                            </div>
                        </div>

                        <h2 className="form-section-title mt-6"><Users size={20} className="inline-icon text-info" /> Party Details</h2>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Plaintiff / Petitioner</label>
                                <input type="text" className="input-field" placeholder="Full Name or Entity" />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Defendant / Respondent</label>
                                <input type="text" className="input-field" placeholder="Full Name or Entity" />
                            </div>
                        </div>

                        <h2 className="form-section-title mt-6"><AlignLeft size={20} className="inline-icon text-accent" /> Structured Facts & Notes</h2>
                        <div className="form-group">
                            <label className="form-label">Initial Case Facts</label>
                            <textarea
                                className="input-field textarea-field"
                                rows="4"
                                placeholder="Briefly state the foundational facts of the dispute to prime the AI assistant..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Document Attachments</label>
                            <div className="file-upload-zone">
                                <Paperclip size={24} className="text-muted mb-2" />
                                <p>Drag and drop legal documents, or <strong>click to browse</strong></p>
                                <p className="text-xs text-muted">Supports PDF, DOCX, JPG (Max 50MB)</p>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-outline">Cancel</button>
                            <button type="button" className="btn btn-primary">Create & Initialize Workspace</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="case-view-grid">
                    {/* Mocked Active Case View */}
                    <div className="card case-detail-card">
                        <div className="case-header">
                            <div className="case-header-title">
                                <h2>Zafar Family Property Settlement</h2>
                                <span className="badge badge-warning">Drafting Pleadings</span>
                            </div>
                            <p className="text-sm text-muted">Family Law • Lahore High Court • Suit #2023-F492</p>
                        </div>

                        <div className="case-metrics">
                            <div className="metric">
                                <span className="metric-label">Assigned Lawyers</span>
                                <span className="metric-value">Adv. A. Khan, Adv. S. Tariq</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Next Deadline</span>
                                <span className="metric-value text-danger">Oct 28 (Filing)</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">AI Health Score</span>
                                <span className="metric-value text-success">94% Solid</span>
                            </div>
                        </div>

                        <div className="case-notes-section">
                            <h3 className="section-subtitle"><MessageSquare size={16} className="inline-icon" /> Case Notes</h3>
                            <div className="notes-list">
                                <div className="note-card">
                                    <p className="note-text">Ensure we attach the property valuation report obtained last month as Annexure A.</p>
                                    <span className="note-author">Adv. S. Tariq • 2 hrs ago</span>
                                </div>
                            </div>
                            <button className="btn btn-outline btn-sm mt-3"><Plus size={14} /> Add Note</button>
                        </div>
                    </div>

                    <div className="card case-timeline-card">
                        <h3 className="section-subtitle mb-4"><Clock size={16} className="inline-icon text-accent" /> Case Timeline</h3>
                        <div className="timeline">
                            <div className="timeline-item completed">
                                <div className="timeline-marker"><CheckCircle size={16} /></div>
                                <div className="timeline-content">
                                    <h4>Initial Client Consultation</h4>
                                    <p>Oct 12, 2023</p>
                                </div>
                            </div>
                            <div className="timeline-item completed">
                                <div className="timeline-marker"><CheckCircle size={16} /></div>
                                <div className="timeline-content">
                                    <h4>Precedents Researched</h4>
                                    <p>Oct 14, 2023 • 3 Relevant cases found</p>
                                </div>
                            </div>
                            <div className="timeline-item active">
                                <div className="timeline-marker"><span className="pulse-dot"></span></div>
                                <div className="timeline-content">
                                    <h4>Drafting Plaint</h4>
                                    <p>In Progress • 80% Completed</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <h4>Internal Validation</h4>
                                    <p>Pending Draft Completion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseManagement;
