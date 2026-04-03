import React from 'react';
import { Bell, Search, UserCircle, ChevronDown } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
    return (
        <header className="topbar">
            <div className="topbar-search">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search cases, precedents, or clients..."
                    className="search-input"
                />
            </div>

            <div className="topbar-actions">
                <button className="icon-btn notification-btn">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                <div className="profile-dropdown">
                    <UserCircle size={24} className="profile-icon" />
                    <div className="profile-info">
                        <span className="profile-name">Adv. A. Khan</span>
                        <span className="profile-role">Senior Partner</span>
                    </div>
                    <ChevronDown size={16} className="dropdown-icon" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
