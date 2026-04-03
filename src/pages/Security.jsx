import React from 'react';
import {
    Shield,
    Key,
    Eye,
    Lock,
    Database,
    Server,
    Download,
    Search
} from 'lucide-react';
import './Security.css';

const Security = () => {
    return (
        <div className="security-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Security & Audit Center</h1>
                    <p className="page-subtitle">Monitor access logs, data encryption status, and firm-wide permissions.</p>
                </div>
                <button className="btn btn-outline">
                    <Download size={16} /> Export Audit Log
                </button>
            </div>

            <div className="security-overview-grid">
                <div className="card text-center flex flex-col items-center justify-center p-6">
                    <Shield size={48} className="text-success mb-4" />
                    <h3>System Status: Secure</h3>
                    <p className="text-muted text-sm mt-2">All data is encrypted in transit and at rest.</p>
                </div>

                <div className="security-stats-card card">
                    <div className="sec-stat">
                        <div className="sec-icon bg-primary-light text-primary"><Database size={20} /></div>
                        <div>
                            <p className="text-sm text-muted">Encryption Standard</p>
                            <p className="font-semibold">AES-256-GCM</p>
                        </div>
                    </div>
                    <div className="sec-stat">
                        <div className="sec-icon bg-info-light text-info"><Server size={20} /></div>
                        <div>
                            <p className="text-sm text-muted">Data Residency</p>
                            <p className="font-semibold">Pakistan (Local Region)</p>
                        </div>
                    </div>
                    <div className="sec-stat">
                        <div className="sec-icon bg-warning-light text-warning"><Key size={20} /></div>
                        <div>
                            <p className="text-sm text-muted">Active Sessions</p>
                            <p className="font-semibold">24 Firm Members</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="security-main-grid">
                <div className="card col-span-2">
                    <div className="card-header flex justify-between items-center">
                        <h2><Eye className="inline-icon text-primary" /> Comprehensive Access Logs</h2>
                        <div className="input-with-icon w-64">
                            <Search size={16} className="input-icon" />
                            <input type="text" placeholder="Search logs..." className="input-field icon-pad py-1" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User / Role</th>
                                    <th>Action Event</th>
                                    <th>Target Resource</th>
                                    <th>IP / Device</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>24-Oct-23 14:32:01</td>
                                    <td><strong>Adv. Sarah Tariq</strong><br /><span className="text-xs text-muted">Lawyer</span></td>
                                    <td><span className="badge badge-info">DOCUMENT_VIEW</span></td>
                                    <td>Client_Contract_v2.pdf</td>
                                    <td>192.168.1.105<br /><span className="text-xs text-muted">MacBook Pro</span></td>
                                    <td><span className="text-success flex items-center gap-1"><Shield size={12} /> Allowed</span></td>
                                </tr>
                                <tr>
                                    <td>24-Oct-23 13:15:44</td>
                                    <td><strong>System AI Agent</strong><br /><span className="text-xs text-muted">Internal</span></td>
                                    <td><span className="badge badge-primary">INFERENCE_RUN</span></td>
                                    <td>Case Draft #2023-F492</td>
                                    <td>Internal Server Network<br /><span className="text-xs text-muted">Cluster A</span></td>
                                    <td><span className="text-success flex items-center gap-1"><Shield size={12} /> Allowed</span></td>
                                </tr>
                                <tr>
                                    <td>24-Oct-23 10:05:12</td>
                                    <td><strong>Hassan</strong><br /><span className="text-xs text-muted">Paralegal</span></td>
                                    <td><span className="badge badge-neutral">LOGIN_SUCCESS</span></td>
                                    <td>Authentication Service</td>
                                    <td>39.40.12.88 (External)<br /><span className="text-xs text-muted">Windows 11</span></td>
                                    <td><span className="text-success flex items-center gap-1"><Shield size={12} /> Allowed</span></td>
                                </tr>
                                <tr className="bg-danger-light">
                                    <td>23-Oct-23 23:45:00</td>
                                    <td><strong>Unknown User</strong><br /><span className="text-xs text-muted">Unauthenticated</span></td>
                                    <td><span className="badge badge-danger">LOGIN_FAILED</span></td>
                                    <td>Authentication Service</td>
                                    <td>185.15.54.21 (VPN User)<br /><span className="text-xs text-muted">Unknown Device</span></td>
                                    <td><span className="text-danger flex items-center gap-1"><Lock size={12} /> Denied</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2><Lock className="inline-icon text-accent" /> Role Permissions Overview</h2>
                    </div>

                    <div className="permission-list">
                        <div className="permission-item">
                            <div className="flex justify-between items-center mb-1">
                                <h4>Firm Administrator</h4>
                                <span className="text-xs text-muted">2 Users</span>
                            </div>
                            <p className="text-sm text-success mb-2">Full Access (Billing, Users, All Cases)</p>
                            <div className="progress-bar"><div className="progress-fill bg-success w-full"></div></div>
                        </div>

                        <div className="permission-item mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <h4>Senior Partner</h4>
                                <span className="text-xs text-muted">5 Users</span>
                            </div>
                            <p className="text-sm text-info mb-2">Can assign cases, override AI drafts</p>
                            <div className="progress-bar"><div className="progress-fill bg-info" style={{ width: '80%' }}></div></div>
                        </div>

                        <div className="permission-item mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <h4>Lawyer / Advocate</h4>
                                <span className="text-xs text-muted">12 Users</span>
                            </div>
                            <p className="text-sm text-warning mb-2">Access to assigned cases only</p>
                            <div className="progress-bar"><div className="progress-fill bg-warning" style={{ width: '50%' }}></div></div>
                        </div>

                        <button className="btn btn-outline w-full mt-6 text-sm">Manage Role Matrix</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
