import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseManagement from './pages/CaseManagement';
import PrecedentSearch from './pages/PrecedentSearch';
import Drafting from './pages/Drafting';
import Compliance from './pages/Compliance';
import Transparency from './pages/Transparency';
import Workspace from './pages/Workspace';
import Security from './pages/Security';
import Settings from './pages/Settings';

// Pages placeholders

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<CaseManagement />} />
          <Route path="research" element={<PrecedentSearch />} />
          <Route path="drafting" element={<Drafting />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="transparency" element={<Transparency />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
