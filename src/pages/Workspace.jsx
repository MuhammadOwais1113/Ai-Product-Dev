import React from 'react';
import {
    Users,
    MessageCircle,
    Activity,
    Paperclip,
    CheckSquare,
    Send,
    MoreVertical,
    Clock,
    UserPlus
} from 'lucide-react';
import './Workspace.css';

const Workspace = () => {
    return (
        <div className="workspace-container animate-fade-in">
            <div className="page-header workspace-header">
                <div>
                    <div className="flex-align-center mb-2">
                        <span className="badge badge-neutral mr-2">Case #2023-F492</span>
                        <span className="badge badge-warning">Drafting Phase</span>
                    </div>
                    <h1 className="page-title">Zafar Family Property Settlement</h1>
                    <p className="page-subtitle">Collaborative workspace for assigned legal team members.</p>
                </div>
                <div className="team-avatars">
                    <div className="avatar bg-primary" title="Adv. Ahmed Khan">AK</div>
                    <div className="avatar bg-accent" title="Adv. Sarah Tariq">ST</div>
                    <div className="avatar bg-info" title="Hassan (Paralegal)">H</div>
                    <button className="avatar add-member" title="Add Team Member"><UserPlus size={16} /></button>
                </div>
            </div>

            <div className="workspace-grid">
                {/* Main Conversation & Files */}
                <div className="workspace-main card">
                    <div className="workspace-tabs">
                        <button className="tab active"><MessageCircle size={16} /> Discussion</button>
                        <button className="tab"><Paperclip size={16} /> Case Files (12)</button>
                        <button className="tab"><Activity size={16} /> Activity Log</button>
                    </div>

                    <div className="chat-container">
                        <div className="message-list">
                            <div className="message-group">
                                <div className="message-date-divider"><span>Yesterday</span></div>

                                <div className="message">
                                    <div className="avatar-sm bg-accent">ST</div>
                                    <div className="message-content">
                                        <div className="message-meta">
                                            <span className="sender">Adv. Sarah Tariq</span>
                                            <span className="time">10:42 AM</span>
                                        </div>
                                        <div className="bubble">
                                            <p>I've reviewed the initial AI draft for the plaint. The jurisdiction clause looks solid, but we need to attach the original mutation register copy for the DHA property.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="message">
                                    <div className="avatar-sm bg-info">H</div>
                                    <div className="message-content">
                                        <div className="message-meta">
                                            <span className="sender">Hassan</span>
                                            <span className="time">11:15 AM</span>
                                        </div>
                                        <div className="bubble">
                                            <p>Will retrieve that from the Patwari records tomorrow morning.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="message-group">
                                <div className="message-date-divider"><span>Today</span></div>

                                <div className="message system-message">
                                    <Activity size={14} className="mr-2 text-info" />
                                    <span><strong>AI Assistant</strong> generated a new drafting version (v2.1) emphasizing the recent Supreme Court precedent on inherited property.</span>
                                    <span className="time ml-auto">9:00 AM</span>
                                </div>

                                <div className="message system-message">
                                    <CheckSquare size={14} className="mr-2 text-success" />
                                    <span><strong>Adv. Ahmed Khan</strong> completed task: Review plaintiff's CNIC and marriage certificate.</span>
                                    <span className="time ml-auto">10:30 AM</span>
                                </div>

                                <div className="message own-message">
                                    <div className="message-content">
                                        <div className="message-meta justify-end">
                                            <span className="time">11:05 AM</span>
                                            <span className="sender">You (Adv. A. Khan)</span>
                                        </div>
                                        <div className="bubble flex-col">
                                            <p>Great. Hassan, upload the mutation document here once you have it. I'll finalize the draft this evening.</p>
                                            <div className="attachment-preview">
                                                <Paperclip size={14} /> <span>Draft_v2.1_Review.pdf</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="avatar-sm bg-primary">AK</div>
                                </div>
                            </div>
                        </div>

                        <div className="chat-input-area">
                            <button className="icon-btn text-muted"><Paperclip size={20} /></button>
                            <input type="text" placeholder="Type a message to the team... (Use @ to tag)" className="chat-input" />
                            <button className="btn btn-primary btn-icon"><Send size={18} /></button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Tasks & Details */}
                <div className="workspace-sidebar">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h2><CheckSquare className="inline-icon text-accent" /> Active Tasks</h2>
                            <button className="icon-btn"><MoreVertical size={16} /></button>
                        </div>
                        <div className="task-list">
                            <label className="task-item">
                                <input type="checkbox" className="custom-checkbox" />
                                <div className="task-details">
                                    <span className="task-title">Retrieve Patwari records for DHA property</span>
                                    <span className="task-assignee text-info">Assigned: Hassan (Due: Today)</span>
                                </div>
                            </label>
                            <label className="task-item">
                                <input type="checkbox" className="custom-checkbox" />
                                <div className="task-details">
                                    <span className="task-title">Review compliance audit for Drafting v2.1</span>
                                    <span className="task-assignee text-primary">Assigned: A. Khan (Due: Tomorrow)</span>
                                </div>
                            </label>
                            <label className="task-item">
                                <input type="checkbox" className="custom-checkbox" />
                                <div className="task-details">
                                    <span className="task-title">Draft application for interim injunction</span>
                                    <span className="task-assignee text-accent">Assigned: S. Tariq</span>
                                </div>
                            </label>
                            <button className="text-link text-sm mt-2">+ Add Subtask</button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2><Clock className="inline-icon text-muted" /> Recent Activity</h2>
                        </div>
                        <div className="mini-timeline">
                            <div className="mini-timeline-item">
                                <div className="mini-marker bg-info"></div>
                                <div className="mini-content">
                                    <p><strong>S. Tariq</strong> commented on Draft v2.1</p>
                                    <span className="time">2 hours ago</span>
                                </div>
                            </div>
                            <div className="mini-timeline-item">
                                <div className="mini-marker bg-success"></div>
                                <div className="mini-content">
                                    <p>System flagged 0 critical compliance issues</p>
                                    <span className="time">5 hours ago</span>
                                </div>
                            </div>
                            <div className="mini-timeline-item">
                                <div className="mini-marker bg-warning"></div>
                                <div className="mini-content">
                                    <p><strong>A. Khan</strong> changed status to Drafting</p>
                                    <span className="time">1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
