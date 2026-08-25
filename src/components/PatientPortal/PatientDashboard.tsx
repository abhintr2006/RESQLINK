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
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { activeAlert, patientProfile } = useResqLink();
  const [patientTab, setPatientTab] = useState<'sos' | 'healthCard' | 'hospitals' | 'history'>('sos');

  const tabs = [
    {
      id: 'sos' as const,
      label: 'Emergency SOS',
      icon: AlertOctagon,
      badge: activeAlert ? 'LIVE' : undefined,
    },
    {
      id: 'healthCard' as const,
      label: 'Digital Medical ID',
      icon: CreditCard,
    },
    {
      id: 'hospitals' as const,
      label: 'Nearby ER & ICU Beds',
      icon: Building2,
    },
    {
      id: 'history' as const,
      label: 'My Emergency History',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Patient Portal Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/30 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">Patient Emergency Care Portal</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Citizen Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Welcome, <span className="font-semibold text-slate-200">{patientProfile.name}</span> • One-Tap SOS, Real-Time Ambulance Tracking & Live Hospital Beds
            </p>
          </div>
        </div>

        {/* DPDP Compliance Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DPDP Act 2023 Consent Active</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = patientTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPatientTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {patientTab === 'sos' && <CitizenSOSView />}
        {patientTab === 'healthCard' && <DigitalHealthCard />}
        {patientTab === 'hospitals' && <NearbyHospitalDirectory />}
        {patientTab === 'history' && <PatientHistoryView />}
      </div>
    </div>
  );
};
