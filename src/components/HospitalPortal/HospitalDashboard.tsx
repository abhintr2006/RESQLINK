import React, { useEffect } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { InboundAmbulanceRadar } from './InboundAmbulanceRadar';
import { ERBedManager } from './ERBedManager';
import { PreArrivalTriageCard } from './PreArrivalTriageCard';
import {
  Building2,
  Bed,
  Shield,
  Activity,
  Phone,
  Flame,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const {
    hospitals,
    selectedHospitalId,
    setSelectedHospitalId,
    hospitalStatuses,
    activeAlert,
    simulateExternalIncident,
  } = useResqLink();

  const currentHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0] || {
      id: 'HOSP-01',
      name: 'KSSEM Medical & Emergency Center',
      area: 'Kanakapura Road',
      traumaLevel: 1,
      icuBedsAvailable: 8,
      oxygenAvailable: true,
      contactNumber: '+91 80 2842 5012',
    };

  const currentStatus = hospitalStatuses[currentHospital.id] || {
    hospitalId: currentHospital.id,
    emergencyDepartmentOpen: true,
    traumaTeamStandby: true,
    otReady: true,
    divertStatus: false,
    activeAdmissionsCount: 4,
  };

  const totalInbound =
    activeAlert &&
    (activeAlert.status === 'DISPATCHED' ||
      activeAlert.status === 'EN_ROUTE' ||
      activeAlert.status === 'ON_SCENE')
      ? 1
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner with Hospital Selector - Double Bezel */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">{currentHospital.name}</h1>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Level {currentHospital.traumaLevel} Trauma Center
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Emergency Department &amp; Trauma Intake Terminal • {currentHospital.area} • Direct Hotline: <span className="font-mono text-slate-200 font-bold">{currentHospital.contactNumber}</span>
              </p>
            </div>
          </div>

          {/* Hospital Switcher Selector Box */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="pr-2">
              <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Selected Facility</div>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-black focus:outline-none cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-slate-100 font-bold">
                    {h.name} ({h.area})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-400 shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Inbound Transports
              </div>
              <div className="text-2xl font-black text-white mt-0.5">{totalInbound} Active</div>
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 shadow-md">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Available ICU Beds
              </div>
              <div className="text-2xl font-black text-indigo-400 mt-0.5">
                {currentHospital.icuBedsAvailable} Beds
              </div>
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-400 shadow-md">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Trauma Bay Status
              </div>
              <div className="text-2xl font-black text-amber-300 mt-0.5">
                {currentStatus.traumaTeamStandby ? 'Standby (Ready)' : 'General Shift'}
              </div>
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                ER Intake Gate
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {currentStatus.divertStatus ? 'Diverting CAD' : 'Receiving'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inbound Radar & Telemetry Stream */}
      <InboundAmbulanceRadar />

      {/* Bed & Emergency Resources Controller */}
      <ERBedManager />

      {/* Pre-Arrival Triage Card & Admission Logs */}
      <PreArrivalTriageCard />
    </div>
  );
};
