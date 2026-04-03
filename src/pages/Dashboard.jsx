import React from 'react';
import {
    Briefcase,
    FileText,
    Search,
    PlusCircle,
    Zap,
    Users,
    AlertCircle,
    Clock
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="welcome-text">Welcome back, Ahmed Khan</h1>
                    <p className="welcome-subtext">Here is your daily rental agreement overview and validation status.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <PlusCircle size={18} />
                        New Agreement
                    </button>
                </div>
            </div>

            <div className="quick-actions-row">
                <button className="quick-action-btn">
                    <PlusCircle className="action-icon text-primary" />
                    <span>New Agreement</span>
                </button>
                <button className="quick-action-btn">
                    <FileText className="action-icon text-accent" />
                    <span>Validate Draft</span>
                </button>
                <button className="quick-action-btn">
                    <Search className="action-icon text-info" />
                    <span>Search Agreements</span>
                </button>
                <button className="quick-action-btn">
                    <Users className="action-icon text-success" />
                    <span>Tenant Directory</span>
                </button>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon-wrap bg-primary-light">
                        <Briefcase className="text-primary" />
                    </div>
                    <div className="summary-info">
                        <h3>14</h3>
                        <p>Active Agreements</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon-wrap bg-accent-light">
                        <FileText className="text-accent" />
                    </div>
                    <div className="summary-info">
                        <h3>8</h3>
                        <p>Drafts in Progress</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon-wrap bg-success-light">
                        <Clock className="text-success" />
                    </div>
                    <div className="summary-info">
                        <h3>3</h3>
                        <p>Renewals This Week</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon-wrap bg-danger-light">
                        <AlertCircle className="text-danger" />
                    </div>
                    <div className="summary-info">
                        <h3>2</h3>
                        <p>Pending Validations</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="grid-col-2">
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h2>Recent Rental Agreements</h2>
                            <button className="text-link">View All</button>
                        </div>
                        <div className="precedent-list">
                            {[
                                { title: 'Khan Residence — Model Town', court: 'Residential Lease', date: 'Oct 12, 2023', match: '94%' },
                                { title: 'Gulberg III Commercial Space', court: 'Commercial Lease', date: 'Sep 28, 2022', match: '88%' },
                                { title: 'DHA Phase 5 Apartment', court: 'Residential Lease', date: 'Jan 15, 2021', match: '81%' }
                            ].map((item, idx) => (
                                <div key={idx} className="precedent-item">
                                    <div className="precedent-content">
                                        <h4>{item.title}</h4>
                                        <p>{item.court} • {item.date}</p>
                                    </div>
                                    <div className="precedent-match">
                                        <span className="badge badge-success">{item.match} Valid</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h2><Zap className="inline-icon text-accent" /> AI Insights & Alerts</h2>
                        </div>
                        <div className="insights-content">
                            <div className="insight-item">
                                <div className="insight-indicator bg-warning"></div>
                                <div className="insight-text">
                                    <strong>Renewal Alert:</strong> The rental agreement for "Gulberg III Commercial Space" expires in 4 days.
                                </div>
                            </div>
                            <div className="insight-item">
                                <div className="insight-indicator bg-success"></div>
                                <div className="insight-text">
                                    <strong>Validation Complete:</strong> "DHA Phase 5 Apartment" lease passed all Punjab Rented Premises Act checks, compliance score 92%.
                                </div>
                            </div>
                            <div className="insight-item">
                                <div className="insight-indicator bg-info"></div>
                                <div className="insight-text">
                                    <strong>Market Insight:</strong> 78% of similar residential leases in Lahore include a 5% annual rent escalation clause this quarter.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-col-1">
                    <div className="card dashboard-card h-full">
                        <div className="card-header">
                            <h2>Notifications & Updates</h2>
                        </div>
                        <div className="notification-list">
                            <div className="notification-item">
                                <AlertCircle className="notif-icon text-danger" size={18} />
                                <div className="notif-content">
                                    <p className="notif-title">Validation Error</p>
                                    <p className="notif-desc">Missing Tenant signature field in Rental Agreement #402.</p>
                                    <span className="notif-time">10 mins ago</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <FileText className="notif-icon text-info" size={18} />
                                <div className="notif-content">
                                    <p className="notif-title">Agreement Analyzed</p>
                                    <p className="notif-desc">AI analysis complete for 'Gulberg_Lease_v2.pdf'.</p>
                                    <span className="notif-time">2 hours ago</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <Users className="notif-icon text-success" size={18} />
                                <div className="notif-content">
                                    <p className="notif-title">New Comment</p>
                                    <p className="notif-desc">Sarah added a comment to 'Model Town Lease Draft'.</p>
                                    <span className="notif-time">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
