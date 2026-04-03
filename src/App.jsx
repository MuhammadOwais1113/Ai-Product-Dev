import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Removed: CaseManagement, PrecedentSearch, Drafting, Workspace (out of MVP scope)
import Compliance from './pages/Compliance'; // Renamed to "Validation Engine"
import Transparency from './pages/Transparency';
import Security from './pages/Security';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* Removed: cases, research, drafting, workspace */}
          <Route path="validation-engine" element={<Compliance />} />
          <Route path="transparency" element={<Transparency />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
