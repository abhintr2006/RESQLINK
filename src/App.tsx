import React, { useState } from 'react';
import { ResqLinkProvider, useResqLink } from './context/ResqLinkContext';
import { SimulationBar } from './components/SimulationControls/SimulationBar';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { HospitalDashboard } from './components/HospitalPortal/HospitalDashboard';
import { PatientDashboard } from './components/PatientPortal/PatientDashboard';
import { DPDPNoticeModal } from './components/CitizenApp/DPDPNoticeModal';
import { LoginScreen } from './components/Auth/LoginScreen';

export const MainLayout: React.FC = () => {
  const { userRole, adminViewTab, authUser, authLoading, emergencyLaunch, dismissEmergencyLaunch } = useResqLink();
  const [isDPDPOpen, setIsDPDPOpen] = useState<boolean>(false);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">Loading secure session…</div>;
  }

  if (!authUser) {
    return <LoginScreen />;
  }

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

      {emergencyLaunch && (
        <div className="fixed inset-x-0 top-[41px] z-50 mx-auto max-w-3xl px-4 pt-3">
          <div className="rounded-2xl border border-rose-400/50 bg-rose-950/95 px-4 py-3 shadow-2xl shadow-rose-950/50 backdrop-blur-xl" role="alert">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-rose-100">Emergency workflow launched</p>
                <p className="text-xs text-rose-200/80">{emergencyLaunch.patient.name} • AI voice call and hospital locator queued</p>
              </div>
              <button onClick={dismissEmergencyLaunch} className="rounded-xl border border-rose-300/30 px-3 py-1.5 text-xs font-bold text-rose-100 hover:bg-rose-500/20">Acknowledge</button>
            </div>
          </div>
        </div>
      )}

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
