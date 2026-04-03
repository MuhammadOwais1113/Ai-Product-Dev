import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2,
    CheckSquare,
    ShieldCheck,
    Lock,
    Settings,
    Menu,
    FileCheck
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: Building2, label: 'Dashboard' },
    { path: '/validation-engine', icon: FileCheck, label: 'Validation Engine' },
    { path: '/transparency', icon: ShieldCheck, label: 'Transparency' },
    { path: '/security', icon: Lock, label: 'Security & Audit' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <FileCheck className="logo-icon" size={28} />
                    <h1 className="logo-text">LegalDraft</h1>
                </div>
                <button className="mobile-toggle">
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
                                >
                                    <Icon size={20} className="nav-icon" />
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-role-badge">
                    Property Agent
                </div>
                <p className="system-status">System secure: AES-256</p>
            </div>
        </aside>
    );
};

export default Sidebar;
