import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Bed,
  Wind,
  Shield,
  AlertOctagon,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

export const ERBedManager: React.FC = () => {
  const {
    selectedHospitalId,
    hospitals,
    hospitalStatuses,
    updateHospitalBeds,
    toggleHospitalOxygen,
    toggleTraumaTeamStandby,
    toggleEmergencyDivert,
  } = useResqLink();

  const hospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  const status = hospitalStatuses[hospital.id] || {
    hospitalId: hospital.id,
    emergencyDepartmentOpen: true,
    traumaTeamStandby: true,
    otReady: true,
    divertStatus: false,
    activeAdmissionsCount: 4,
  };

  const [capacityFilter, setCapacityFilter] = useState<'all' | 'ready' | 'attention'>('all');
  const resourceStatus = {
    beds: hospital.icuBedsAvailable <= 2 ? 'attention' : 'ready',
    oxygen: hospital.oxygenAvailable ? 'ready' : 'attention',
    trauma: status.traumaTeamStandby ? 'ready' : 'attention',
    intake: status.divertStatus ? 'attention' : 'ready',
  } as const;
  const showResource = (resource: keyof typeof resourceStatus) =>
    capacityFilter === 'all' || capacityFilter === resourceStatus[resource];

  return (
    <div className="double-bezel shadow-2xl">
      <div className="double-bezel-inner p-4 sm:p-5 space-y-4 bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Bed className="w-4 h-4 text-indigo-400" />
              <span>ER HARDWARE CONTROLLERS &amp; BED TELEMETRY</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live capacity broadcast to 108 CAD algorithmic dispatch routers.
            </p>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 shadow-sm ${
                status.divertStatus
                  ? 'bg-rose-950/90 border border-rose-800 text-rose-200 animate-pulse'
                  : 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
              }`}
            >
              {status.divertStatus ? (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>DIVERSION PROTOCOL ACTIVE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>INTAKE GATE OPEN (RECEIVING)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Capacity filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Capacity watch</div>
            <p className="mt-0.5 text-[11px] text-slate-600">Filter resources that need attention before the next inbound patient.</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label="Filter hospital capacity resources">
            {(['all', 'ready', 'attention'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setCapacityFilter(filter)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold capitalize transition cursor-pointer ${
                  capacityFilter === filter
                    ? filter === 'attention'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Capacity controllers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. ICU Beds Controller */}
          <div className={`${showResource('beds') ? '' : 'hidden'} bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                LIVE ICU BEDS
              </span>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${resourceStatus.beds === 'attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {resourceStatus.beds === 'attention' ? 'ATTENTION' : 'READY'}
                </span>
                <Bed className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => updateHospitalBeds(hospital.id, -1)}
                disabled={hospital.icuBedsAvailable <= 0}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 transition cursor-pointer active:scale-95 shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {hospital.icuBedsAvailable}
              </span>

              <button
                onClick={() => updateHospitalBeds(hospital.id, 1)}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition cursor-pointer active:scale-95 shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono text-center">
              {hospital.icuBedsAvailable <= 2 ? '⚠️ Critical bottleneck' : '✓ Capacity nominal'}
            </p>
          </div>

          {/* 2. Liquid Oxygen Supply Toggle */}
          <div className={`${showResource('oxygen') ? '' : 'hidden'} bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                OXYGEN PLANT
              </span>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${resourceStatus.oxygen === 'attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {resourceStatus.oxygen === 'attention' ? 'ATTENTION' : 'READY'}
                </span>
                <Wind className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span
                className={`text-xs font-mono font-bold ${
                  hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hospital.oxygenAvailable ? '99.5% PURE' : 'REFILL REQ'}
              </span>

              <button
                onClick={() => toggleHospitalOxygen(hospital.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer active:scale-95 ${
                  hospital.oxygenAvailable
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {hospital.oxygenAvailable ? 'ACTIVE' : 'OFFLINE'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Manifold pressure nominal
            </p>
          </div>

          {/* 3. Trauma Team Standby Toggle */}
          <div className={`${showResource('trauma') ? '' : 'hidden'} bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                TRAUMA TEAM STANDBY
              </span>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${resourceStatus.trauma === 'attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {resourceStatus.trauma === 'attention' ? 'ATTENTION' : 'READY'}
                </span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span
                className={`text-xs font-mono font-bold ${
                  status.traumaTeamStandby ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {status.traumaTeamStandby ? 'BAY 1 READY' : 'ROUTINE'}
              </span>

              <button
                onClick={() => toggleTraumaTeamStandby(hospital.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer active:scale-95 ${
                  status.traumaTeamStandby
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.traumaTeamStandby ? 'STANDBY' : 'DOWN'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Trauma Lead on call
            </p>
          </div>

          {/* 4. Overload Diversion Toggle */}
          <div className={`${showResource('intake') ? '' : 'hidden'} bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                OVERLOAD DIVERT
              </span>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${resourceStatus.intake === 'attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {resourceStatus.intake === 'attention' ? 'ATTENTION' : 'READY'}
                </span>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span
                className={`text-xs font-mono font-bold ${
                  status.divertStatus ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {status.divertStatus ? 'DIVERTING' : 'OPEN'}
              </span>

              <button
                onClick={() => toggleEmergencyDivert(hospital.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer active:scale-95 ${
                  status.divertStatus
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.divertStatus ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Reroutes non-critical CAD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
