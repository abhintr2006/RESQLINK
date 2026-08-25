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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-400" />
            Emergency Department Resource &amp; Bed Controller
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry broadcasted to 108 CAD and nearest ambulances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              status.divertStatus
                ? 'bg-rose-950/80 border border-rose-800 text-rose-300 animate-pulse'
                : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
            }`}
          >
            {status.divertStatus ? (
              <>
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>ER DIVERSION ACTIVE</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RECEIVING INBOUND AMBULANCES</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Control Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ICU Beds Controller */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Available ICU Beds
            </span>
            <Bed className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => updateHospitalBeds(hospital.id, -1)}
              disabled={hospital.icuBedsAvailable <= 0}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-3xl font-black text-white font-mono">
              {hospital.icuBedsAvailable}
            </span>

            <button
              onClick={() => updateHospitalBeds(hospital.id, 1)}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            {hospital.icuBedsAvailable <= 2 ? '⚠️ Critical bed shortage' : 'Optimal capacity'}
          </p>
        </div>

        {/* 2. Liquid Oxygen Supply Toggle */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Liquid Oxygen Plant
            </span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-sm font-bold ${
                hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {hospital.oxygenAvailable ? 'Full Supply (99.5%)' : 'Refill Mandated'}
            </span>

            <button
              onClick={() => toggleHospitalOxygen(hospital.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                hospital.oxygenAvailable
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {hospital.oxygenAvailable ? 'Active' : 'Offline'}
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Telemetry connected to Central Gas Manifold
          </p>
        </div>

        {/* 3. Trauma Team Standby Toggle */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trauma Team Standby
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-sm font-bold ${
                status.traumaTeamStandby ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              {status.traumaTeamStandby ? 'Bay 1 & 2 Ready' : 'On General Duty'}
            </span>

            <button
              onClick={() => toggleTraumaTeamStandby(hospital.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                status.traumaTeamStandby
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status.traumaTeamStandby ? 'Standby' : 'Stand Down'}
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Anesthetist, Surgeon &amp; ER Nurse on call
          </p>
        </div>

        {/* 4. Emergency Diversion Protocol */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overload Diversion
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-sm font-bold ${
                status.divertStatus ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {status.divertStatus ? 'Diverting to Tier 1' : 'Normal Intake'}
            </span>

            <button
              onClick={() => toggleEmergencyDivert(hospital.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                status.divertStatus
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status.divertStatus ? 'Active' : 'Off'}
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Re-routes ambulances to next nearest facility
          </p>
        </div>
      </div>
    </div>
  );
};
