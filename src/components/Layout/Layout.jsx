import React from 'react';
import { Outlet } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="layout-main">
                <Topbar />
                <main className="layout-content">
                    <Outlet />
                </main>
                <div className="legal-disclaimer-banner" id="legal-disclaimer">
                    <AlertTriangle size={16} className="disclaimer-icon" />
                    <p>
                        <strong>⚠️ LegalDraft is an AI-powered validation tool, not a lawyer.</strong>{' '}
                        This report highlights potential logical errors but does not constitute legal advice.
                        Always have a qualified legal professional review your finalized agreements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Layout;
