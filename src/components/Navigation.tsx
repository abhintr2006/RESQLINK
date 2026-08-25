import React from 'react';
import { useResqLink } from '../context/ResqLinkContext';
import { LanguageCode } from '../types';
import {
  ShieldAlert,
  Smartphone,
  Radio,
  BarChart3,
  MessageSquareCode,
  FileText,
  Languages,
  ShieldCheck,
} from 'lucide-react';

interface NavigationProps {
  currentTab: 'citizen' | 'dispatcher' | 'eeg' | 'twilio' | 'paper';
  setCurrentTab: (tab: 'citizen' | 'dispatcher' | 'eeg' | 'twilio' | 'paper') => void;
  onOpenDPDPModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenDPDPModal,
}) => {
  const { language, setLanguage, activeAlert } = useResqLink();

  const navItems = [
    {
      id: 'citizen' as const,
      label: 'Citizen SOS',
      sublabel: 'One-Tap Emergency',
      icon: Smartphone,
      badge: activeAlert ? 'ACTIVE' : undefined,
    },
    {
      id: 'dispatcher' as const,
      label: 'Dispatcher CAD',
      sublabel: 'Command Center',
      icon: Radio,
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
    <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800/80 sticky top-[41px] z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('citizen')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/25">
            <ShieldAlert className="w-6 h-6" />
            {activeAlert && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
                RESQLINK
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                Urban India
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              AI Emergency Assistance & Dispatch • Bengaluru
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-extrabold rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: DPDP Compliance & Language Selector */}
        <div className="flex items-center gap-2">
          {/* DPDP 2023 Consent Button */}
          <button
            onClick={onOpenDPDPModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/40 transition"
            title="DPDP Act 2023 & MeitY AI Governance Notice"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP 2023 Compliant</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  language === lang
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
