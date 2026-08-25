import React, { useState } from 'react';
import { ResqLinkProvider } from './context/ResqLinkContext';
import { SimulationBar } from './components/SimulationControls/SimulationBar';
import { Navigation } from './components/Navigation';
import { CitizenSOSView } from './components/CitizenApp/CitizenSOSView';
import { DispatcherPortal } from './components/DispatcherCAD/DispatcherPortal';
import { EEGDashboard } from './components/EEGDashboard/EEGDashboard';
import { TwilioSMSView } from './components/TwilioSimulator/TwilioSMSView';
import { AboutPaperView } from './components/AboutPaper/AboutPaperView';
import { DPDPNoticeModal } from './components/CitizenApp/DPDPNoticeModal';

export const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'citizen' | 'dispatcher' | 'eeg' | 'twilio' | 'paper'>('citizen');
  const [isDPDPOpen, setIsDPDPOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Floating Evaluation Simulation Bar */}
      <SimulationBar />

      {/* Main App Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenDPDPModal={() => setIsDPDPOpen(true)}
      />

      {/* View Content */}
      <main className="flex-1 pb-16">
        {currentTab === 'citizen' && <CitizenSOSView />}
        {currentTab === 'dispatcher' && <DispatcherPortal />}
        {currentTab === 'eeg' && <EEGDashboard />}
        {currentTab === 'twilio' && <TwilioSMSView />}
        {currentTab === 'paper' && <AboutPaperView />}
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
