import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2,
    Scale,
    Search,
    PenTool,
    CheckSquare,
    ShieldCheck,
    Users,
    Lock,
    Settings,
    Menu
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: Building2, label: 'Dashboard' },
    { path: '/cases', icon: Scale, label: 'Case Management' },
    { path: '/research', icon: Search, label: 'Precedent Search' },
    { path: '/drafting', icon: PenTool, label: 'AI Drafting' },
    { path: '/compliance', icon: CheckSquare, label: 'Compliance' },
    { path: '/transparency', icon: ShieldCheck, label: 'Transparency' },
    { path: '/workspace', icon: Users, label: 'Workspace' },
    { path: '/security', icon: Lock, label: 'Security & Audit' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <Scale className="logo-icon" size={28} />
                    <h1 className="logo-text">LegalMind</h1>
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
                    Senior Lawyer
                </div>
                <p className="system-status">System secure: AES-256</p>
            </div>
        </aside>
    );
};

export default Sidebar;
