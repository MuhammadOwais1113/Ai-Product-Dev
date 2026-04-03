import React, { useState } from 'react';
import {
    User,
    Bell,
    Moon,
    Sun,
    Globe,
    Building,
    CreditCard,
    ShieldAlert
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="settings-container animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Settings & Preferences</h1>
                <p className="page-subtitle">Manage your personal profile, notifications, and firm workspace preferences.</p>
            </div>

            <div className="settings-layout">
                <div className="settings-nav card">
                    <ul className="settings-menu">
                        <li>
                            <button
                                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User size={18} /> My Profile
                            </button>
                        </li>
                        <li>
                            <button
                                className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <Bell size={18} /> Notifications
                            </button>
                        </li>
                        <li>
                            <button
                                className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appearance')}
                            >
                                <Moon size={18} /> Appearance
                            </button>
                        </li>
                        <li className="menu-divider"></li>
                        <li>
                            <span className="menu-group-label">Workspace Options</span>
                        </li>
                        <li>
                            <button
                                className={`settings-tab ${activeTab === 'firm' ? 'active' : ''}`}
                                onClick={() => setActiveTab('firm')}
                            >
                                <Building size={18} /> Firm Details
                            </button>
                        </li>
                        <li>
                            <button className="settings-tab text-danger">
                                <ShieldAlert size={18} /> High-Risk Actions
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="settings-content card">
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h2 className="settings-section-title">Profile Information</h2>

                            <div className="profile-header-edit">
                                <div className="avatar-lg bg-primary">AK</div>
                                <button className="btn btn-outline btn-sm">Change Photo</button>
                            </div>

                            <div className="form-group mb-6 mt-6">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="input-field" defaultValue="Ahmed Khan" />
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Professional Title / Role</label>
                                <input type="text" className="input-field" defaultValue="Senior Partner" />
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Bar Council Registration #</label>
                                <input type="text" className="input-field" defaultValue="PBC-4921-PWR" />
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Law Specialization Preference (For AI Context)</label>
                                <select className="input-field">
                                    <option value="civil">General Civil Litigation</option>
                                    <option value="family">Family Law</option>
                                    <option value="corporate">Corporate & Commercial</option>
                                    <option value="property" selected>Real Estate & Property Dispute</option>
                                    <option value="criminal">Criminal Defense (Not Optimized)</option>
                                </select>
                                <p className="text-xs text-muted mt-1">This preference tunes the AI's default drafting style and precedent recommendations.</p>
                            </div>

                            <div className="form-actions border-top-light pt-6 mt-6 flex justify-end">
                                <button className="btn btn-primary">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="animate-fade-in">
                            <h2 className="settings-section-title">Appearance & Accessibility</h2>

                            <div className="theme-toggle-section mt-6">
                                <div className="flex justify-between items-center mb-6 border-b border-light pb-6">
                                    <div>
                                        <h4 className="font-semibold text-main mb-1">Dark Mode</h4>
                                        <p className="text-sm text-muted">A dark theme designed to reduce eye strain during long drafting sessions.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="flex justify-between items-center pb-6">
                                    <div>
                                        <h4 className="font-semibold text-main mb-1">High Contrast Mode</h4>
                                        <p className="text-sm text-muted">Increase text contrast for easier reading of legal documents.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mt-6 border-t border-light pt-6">
                                <label className="form-label">Base Font Size</label>
                                <select className="input-field w-64">
                                    <option value="small">Small (12px)</option>
                                    <option value="medium" selected>Default / Medium (14px)</option>
                                    <option value="large">Large (16px)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="animate-fade-in">
                            <h2 className="settings-section-title">Notification Preferences</h2>

                            <div className="mt-6 flex flex-col gap-6">
                                <label className="checkbox-row flex items-start gap-4 cursor-pointer">
                                    <input type="checkbox" className="mt-1 custom-checkbox" defaultChecked />
                                    <div>
                                        <h4 className="text-sm font-semibold text-main">Case Updates</h4>
                                        <p className="text-xs text-muted">Notify me when a case status changes or deadlines approach.</p>
                                    </div>
                                </label>

                                <label className="checkbox-row flex items-start gap-4 cursor-pointer">
                                    <input type="checkbox" className="mt-1 custom-checkbox" defaultChecked />
                                    <div>
                                        <h4 className="text-sm font-semibold text-main">AI Audit Alerts</h4>
                                        <p className="text-xs text-muted">Immediate notifications for High-Risk errors found in my drafts.</p>
                                    </div>
                                </label>

                                <label className="checkbox-row flex items-start gap-4 cursor-pointer">
                                    <input type="checkbox" className="mt-1 custom-checkbox" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-main">Team Comments</h4>
                                        <p className="text-xs text-muted">Notifications for new remarks in the Collaborative Workspace.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'firm' && (
                        <div className="animate-fade-in">
                            <h2 className="settings-section-title">Firm Workspace Details</h2>
                            <p className="text-sm text-muted mb-6">These settings affect all members in your LegalMind organization.</p>

                            <div className="form-group mb-6">
                                <label className="form-label">Firm / Organization Name</label>
                                <input type="text" className="input-field bg-main text-muted" readOnly defaultValue="Shah & Khan Associates" />
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Primary Jurisdiction</label>
                                <select className="input-field">
                                    <option value="punjab" selected>Punjab</option>
                                    <option value="sindh">Sindh</option>
                                    <option value="federal">Federal / Islamabad</option>
                                </select>
                            </div>

                            <div className="form-group mb-6">
                                <label className="form-label">Default Document Margins (High Court STD)</label>
                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <span className="text-xs text-muted block mb-1">Left Margin (inches)</span>
                                        <input type="number" className="input-field" defaultValue="1.5" step="0.1" />
                                    </div>
                                    <div className="w-full">
                                        <span className="text-xs text-muted block mb-1">Right Margin (inches)</span>
                                        <input type="number" className="input-field" defaultValue="0.75" step="0.1" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions border-top-light pt-6 mt-6 flex justify-end">
                                <button className="btn btn-primary">Update Firm Settings</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
