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
  const { activeAlert, patientProfile } = useResqLink();
  const [patientTab, setPatientTab] = useState<'sos' | 'healthCard' | 'hospitals' | 'history'>('sos');

  const tabs = [
    {
      id: 'sos' as const,
      label: 'EMERGENCY SOS',
      icon: AlertOctagon,
      badge: activeAlert ? 'ACTIVE RADAR' : undefined,
    },
    {
      id: 'healthCard' as const,
      label: 'DIGITAL HEALTH CARD',
      icon: CreditCard,
    },
    {
      id: 'hospitals' as const,
      label: 'NEARBY ER & ICU BEDS',
      icon: Building2,
    },
    {
      id: 'history' as const,
      label: 'EMERGENCY HISTORY',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Patient Hero Double-Bezel Header */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/80 flex items-center justify-center text-rose-400 shadow-md">
              <HeartPulse className="w-5 h-5" />
              {activeAlert && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-mono text-white tracking-tight">PATIENT EMERGENCY LIFELINE</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/80">
                  CITIZEN PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Active Citizen: <strong className="text-slate-100">{patientProfile.name}</strong> &bull; ABHA ID: <span className="text-slate-300">{patientProfile.abhaId}</span> &bull; 108 CAD Synced
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPDP ACT 2023 ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Capsule Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = patientTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPatientTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-bold rounded animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Surface */}
      <div className="animate-in fade-in duration-150">
        {patientTab === 'sos' && <CitizenSOSView />}
        {patientTab === 'healthCard' && <DigitalHealthCard />}
        {patientTab === 'hospitals' && <NearbyHospitalDirectory />}
        {patientTab === 'history' && <PatientHistoryView />}
      </div>
    </div>
  );
};
