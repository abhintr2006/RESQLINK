import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { CitizenSOSView } from '../CitizenApp/CitizenSOSView';
import { DispatcherPortal } from '../DispatcherCAD/DispatcherPortal';
import { EEGDashboard } from '../EEGDashboard/EEGDashboard';
import { TwilioSMSView } from '../TwilioSimulator/TwilioSMSView';
import { AboutPaperView } from '../AboutPaper/AboutPaperView';
import {
  Radio,
  Smartphone,
  BarChart3,
  MessageSquareCode,
  FileText,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [adminTab, setAdminTab] = useState<'dispatcher' | 'citizen' | 'eeg' | 'twilio' | 'paper'>('dispatcher');
  const { activeAlert, setAdminViewTab } = useResqLink();

  const navItems = [
    {
      id: 'dispatcher' as const,
      label: 'Dispatcher CAD',
      sublabel: 'Command Center',
      icon: Radio,
    },
    {
      id: 'citizen' as const,
      label: 'Citizen SOS Sim',
      sublabel: 'One-Tap Emergency',
      icon: Smartphone,
      badge: activeAlert ? 'ACTIVE' : undefined,
    },
    {
      id: 'eeg' as const,
      label: 'EEG Framework',
      sublabel: 'Equity, Efficacy, Gov',
      icon: BarChart3,
    },
    {
      id: 'twilio' as const,
      label: 'SMS Fallback',
      sublabel: '2G Twilio Engine',
      icon: MessageSquareCode,
    },
    {
      id: 'paper' as const,
      label: 'Research Paper',
      sublabel: 'KSSEM Bengaluru',
      icon: FileText,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Operations Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">
              RESQLINK Central Command &amp; Dispatch Hub
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
              Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bengaluru Metropolitan Emergency CAD, Fleet Dispatch, EEG Metrics &amp; Dual-Engine Multi-Dashboard Control
          </p>
        </div>

        {/* Quick Dashboard Jump buttons for Admin */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold px-2">Preview Role Portals:</span>
          <button
            onClick={() => setAdminViewTab('hospital')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/80 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hospital ER Portal</span>
          </button>

          <button
            onClick={() => setAdminViewTab('patient')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>Patient Portal</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      <div>
        {adminTab === 'dispatcher' && <DispatcherPortal />}
        {adminTab === 'citizen' && <CitizenSOSView />}
        {adminTab === 'eeg' && <EEGDashboard />}
        {adminTab === 'twilio' && <TwilioSMSView />}
        {adminTab === 'paper' && <AboutPaperView />}
      </div>
    </div>
  );
};
