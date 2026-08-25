import React, { useState } from 'react';
import { ResqLinkProvider, useResqLink } from './context/ResqLinkContext';
import { SimulationBar } from './components/SimulationControls/SimulationBar';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { HospitalDashboard } from './components/HospitalPortal/HospitalDashboard';
import { PatientDashboard } from './components/PatientPortal/PatientDashboard';
import { DPDPNoticeModal } from './components/CitizenApp/DPDPNoticeModal';

export const MainLayout: React.FC = () => {
  const { userRole, adminViewTab } = useResqLink();
  const [isDPDPOpen, setIsDPDPOpen] = useState<boolean>(false);

  // Determine active view based on role and admin dashboard switcher
  const renderCurrentView = () => {
    if (userRole === 'hospital') {
      return <HospitalDashboard />;
    }

    if (userRole === 'patient') {
      return <PatientDashboard />;
    }

    // Default: Admin can access all 3 dashboards
    if (adminViewTab === 'hospital') {
      return <HospitalDashboard />;
    }
    if (adminViewTab === 'patient') {
      return <PatientDashboard />;
    }
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Floating Evaluation Simulation Bar (Visible across all roles for evaluation) */}
      <SimulationBar />

      {/* Main App Navigation with Role Switcher */}
      <Navigation onOpenDPDPModal={() => setIsDPDPOpen(true)} />

      {/* View Content */}
      <main className="flex-1 pb-16">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RESQLINK</span>
            <span>•</span>
            <span>K S School of Engineering and Management (KSSEM), Bengaluru</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>UN SDG 3 &amp; 11 Aligned</span>
            <span>•</span>
            <button
              onClick={() => setIsDPDPOpen(true)}
              className="hover:text-emerald-400 text-slate-400 transition underline cursor-pointer"
            >
              DPDP Act 2023 Notice
            </button>
            <span>•</span>
            <span>MeitY AI Guidelines 2025</span>
          </div>
        </div>
      </footer>

      {/* DPDP Privacy & Consent Modal */}
      <DPDPNoticeModal isOpen={isDPDPOpen} onClose={() => setIsDPDPOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ResqLinkProvider>
      <MainLayout />
    </ResqLinkProvider>
  );
}
