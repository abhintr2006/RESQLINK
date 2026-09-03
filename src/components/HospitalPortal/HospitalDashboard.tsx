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
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Hospital Selector - Double Bezel */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/80 flex items-center justify-center text-indigo-400 shadow-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white tracking-tight">{currentHospital.name}</h1>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/80">
                  TRAUMA LEVEL {currentHospital.traumaLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Emergency Department Terminal &bull; {currentHospital.area} &bull; Hotline: <span className="text-slate-200 font-bold">{currentHospital.contactNumber}</span>
              </p>
            </div>
          </div>

          {/* Hospital Switcher Selector Box */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <div>
              <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500">SELECT FACILITY</div>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-slate-100">
                    {h.name} ({h.area})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                INBOUND TRANSPORTS
              </div>
              <div className="text-xl font-mono font-extrabold text-rose-400 mt-0.5">{totalInbound} ACTIVE</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                AVAILABLE ICU BEDS
              </div>
              <div className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5">
                {currentHospital.icuBedsAvailable} BEDS
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 flex items-center justify-center shadow-md">
              <Bed className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                TRAUMA BAY STATUS
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-300 mt-0.5">
                {currentStatus?.traumaTeamStandby ? 'STANDBY' : 'GENERAL'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center shadow-md">
              <Flame className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ER INTAKE GATE
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                {currentStatus?.divertStatus ? 'DIVERTING' : 'OPEN'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-4 h-4" />
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
