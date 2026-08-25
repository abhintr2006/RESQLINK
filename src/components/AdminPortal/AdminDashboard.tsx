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
  Sparkles,
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
      label: 'SMS Fallback Engine',
      sublabel: '2G Twilio Protocol',
      icon: MessageSquareCode,
    },
    {
      id: 'paper' as const,
      label: 'KSSEM Research Paper',
      sublabel: 'Academic Architecture',
      icon: FileText,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Operations Banner - Double Bezel */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Central Emergency Command &amp; CAD Dispatch Hub
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Superuser CAD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bengaluru Metropolitan Fleet Dispatch, EEG Metrics, Twilio 2G Failover &amp; Multi-Role Terminal Control
            </p>
          </div>

          {/* Quick Dashboard Jump buttons for Admin */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">Role Portals:</span>
            <button
              onClick={() => setAdminViewTab('hospital')}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-800/80 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hospital ER Portal</span>
            </button>

            <button
              onClick={() => setAdminViewTab('patient')}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/80 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Patient Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide flex items-center gap-2.5 transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xl shadow-rose-600/30 ring-1 ring-white/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full animate-pulse shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      <div className="transition-all duration-300">
        {adminTab === 'dispatcher' && <DispatcherPortal />}
        {adminTab === 'citizen' && <CitizenSOSView />}
        {adminTab === 'eeg' && <EEGDashboard />}
        {adminTab === 'twilio' && <TwilioSMSView />}
        {adminTab === 'paper' && <AboutPaperView />}
      </div>
    </div>
  );
};
