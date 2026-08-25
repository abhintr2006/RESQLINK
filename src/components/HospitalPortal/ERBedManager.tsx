import React from 'react';
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

  return (
    <div className="double-bezel shadow-2xl">
      <div className="double-bezel-inner p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2.5">
              <Bed className="w-5 h-5 text-indigo-400" />
              <span>Emergency Department Hardware &amp; Bed Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hardware controls broadcast live capacity directly to 108 CAD routing algorithms.
            </p>
          </div>

          <div>
            <span
              className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wide flex items-center gap-2 shadow-lg ${
                status.divertStatus
                  ? 'bg-rose-950/90 border border-rose-800 text-rose-200 animate-pulse'
                  : 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
              }`}
            >
              {status.divertStatus ? (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>DIVERSION PROTOCOL ACTIVE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>INTAKE GATE OPEN (RECEIVING)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 4 Hardware Tactical Controllers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. ICU Beds Controller */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Live ICU Beds
              </span>
              <Bed className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => updateHospitalBeds(hospital.id, -1)}
                disabled={hospital.icuBedsAvailable <= 0}
                className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <Minus className="w-5 h-5" />
              </button>

              <span className="text-4xl font-black text-white font-mono tracking-tight">
                {hospital.icuBedsAvailable}
              </span>

              <button
                onClick={() => updateHospitalBeds(hospital.id, 1)}
                className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold text-center">
              {hospital.icuBedsAvailable <= 2 ? '⚠️ Critical bed bottleneck' : '✓ Standard capacity'}
            </p>
          </div>

          {/* 2. Liquid Oxygen Supply Toggle */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Liquid Oxygen Plant
              </span>
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-sm font-black ${
                  hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hospital.oxygenAvailable ? 'Full Supply (99.5%)' : 'Refill Required'}
              </span>

              <button
                onClick={() => toggleHospitalOxygen(hospital.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer shadow-md active:scale-95 ${
                  hospital.oxygenAvailable
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {hospital.oxygenAvailable ? 'Active' : 'Offline'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold">
              Manifold pressure nominal
            </p>
          </div>

          {/* 3. Trauma Team Standby Toggle */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Trauma Team Standby
              </span>
              <Flame className="w-5 h-5 text-amber-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-sm font-black ${
                  status.traumaTeamStandby ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {status.traumaTeamStandby ? 'Trauma Bay 1 Ready' : 'General Shift'}
              </span>

              <button
                onClick={() => toggleTraumaTeamStandby(hospital.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer shadow-md active:scale-95 ${
                  status.traumaTeamStandby
                    ? 'bg-amber-600 text-white shadow-amber-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.traumaTeamStandby ? 'Standby' : 'Stand Down'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold">
              Anesthetist &amp; Trauma Lead on call
            </p>
          </div>

          {/* 4. Overload Diversion Toggle */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Overload Diversion
              </span>
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-sm font-black ${
                  status.divertStatus ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {status.divertStatus ? 'Diverting CAD' : 'Intake Allowed'}
              </span>

              <button
                onClick={() => toggleEmergencyDivert(hospital.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer shadow-md active:scale-95 ${
                  status.divertStatus
                    ? 'bg-rose-600 text-white shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.divertStatus ? 'Active' : 'Off'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold">
              Reroutes non-critical transports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
