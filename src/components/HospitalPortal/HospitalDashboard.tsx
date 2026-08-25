import React from 'react';
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
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const {
    hospitals,
    selectedHospitalId,
    setSelectedHospitalId,
    hospitalStatuses,
    activeAlert,
  } = useResqLink();

  const currentHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  const currentStatus = hospitalStatuses[currentHospital.id];

  const totalInbound =
    activeAlert &&
    (activeAlert.status === 'DISPATCHED' ||
      activeAlert.status === 'EN_ROUTE' ||
      activeAlert.status === 'ON_SCENE')
      ? 1
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner with Hospital Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100">{currentHospital.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Level {currentHospital.traumaLevel} Trauma Center
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Emergency Department &amp; Trauma Intake Terminal • {currentHospital.area} • {currentHospital.contactNumber}
            </p>
          </div>
        </div>

        {/* Hospital Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Switch Branch:</span>
          <select
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id} className="bg-slate-900 text-slate-100">
                {h.name} ({h.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inbound Transports
            </div>
            <div className="text-xl font-extrabold text-slate-100">{totalInbound} Active</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Available ICU Beds
            </div>
            <div className="text-xl font-extrabold text-indigo-400">
              {currentHospital.icuBedsAvailable} Beds
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trauma Bay Status
            </div>
            <div className="text-xl font-extrabold text-amber-300">
              {currentStatus?.traumaTeamStandby ? 'Standby' : 'General'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ER Intake Status
            </div>
            <div className="text-xl font-extrabold text-emerald-400">
              {currentStatus?.divertStatus ? 'Diverting' : 'Open'}
            </div>
          </div>
        </div>
      </div>

      {/* Inbound Radar */}
      <InboundAmbulanceRadar />

      {/* Bed & Resource Manager */}
      <ERBedManager />

      {/* Pre-Arrival Triage & Past Admissions */}
      <PreArrivalTriageCard />
    </div>
  );
};
