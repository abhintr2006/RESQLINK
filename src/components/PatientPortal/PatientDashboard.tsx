import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { CitizenSOSView } from '../CitizenApp/CitizenSOSView';
import { DigitalHealthCard } from './DigitalHealthCard';
import { NearbyHospitalDirectory } from './NearbyHospitalDirectory';
import { PatientHistoryView } from './PatientHistoryView';
import {
  AlertOctagon,
  CreditCard,
  Building2,
  Clock,
  ShieldCheck,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { activeAlert, patientProfile, cancelSOS } = useResqLink();
  const [patientTab, setPatientTab] = useState<'sos' | 'healthCard' | 'hospitals' | 'history'>('sos');


  const tabs = [
    {
      id: 'sos' as const,
      label: 'Emergency SOS',
      icon: AlertOctagon,
      badge: activeAlert ? 'ACTIVE RADAR' : undefined,
    },
    {
      id: 'healthCard' as const,
      label: 'Digital Health Card',
      icon: CreditCard,
    },
    {
      id: 'hospitals' as const,
      label: 'Nearby ER & ICU Beds',
      icon: Building2,
    },
    {
      id: 'history' as const,
      label: 'Emergency History',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Patient Hero Double-Bezel Header */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 ring-1 ring-white/20">
              <HeartPulse className="w-7 h-7" />
              {activeAlert && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">Patient Emergency Lifeline</h1>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner">
                  Citizen Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active Citizen: <strong className="text-slate-100">{patientProfile.name}</strong> • ABHA ID: <span className="font-mono text-slate-300">{patientProfile.abhaId}</span> • Direct 108 Urban CAD Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeAlert && (
              <button
                onClick={() => cancelSOS(activeAlert.id)}
                className="px-3.5 py-2 bg-rose-900/90 hover:bg-rose-800 text-rose-100 hover:text-white rounded-2xl text-xs font-black border border-rose-600 shadow-lg transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>✕ Start New SOS</span>
              </button>
            )}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DPDP Act 2023 End-to-End Encrypted</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Capsule Navigation Bar */}
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = patientTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPatientTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide flex items-center gap-2.5 transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xl shadow-rose-600/30 ring-1 ring-white/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full animate-pulse shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Surface */}
      <div className="transition-all duration-300">
        {patientTab === 'sos' && <CitizenSOSView />}
        {patientTab === 'healthCard' && <DigitalHealthCard />}
        {patientTab === 'hospitals' && <NearbyHospitalDirectory />}
        {patientTab === 'history' && <PatientHistoryView />}
      </div>
    </div>
  );
};
