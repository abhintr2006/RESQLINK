import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Truck,
  Phone,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const InboundAmbulanceRadar: React.FC = () => {
  const {
    activeAlert,
    selectedHospitalId,
    hospitals,
    acknowledgeHospitalInbound,
    prepareTraumaBay,
  } = useResqLink();

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Check if active alert is assigned to this hospital or in transit
  const isInbound =
    activeAlert &&
    (activeAlert.status === 'DISPATCHED' ||
      activeAlert.status === 'EN_ROUTE' ||
      activeAlert.status === 'ON_SCENE');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Inbound Emergency Transports &amp; CAD Radar
              {isInbound && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  INCOMING (1)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Live telemetry streamed directly from RESQLINK CAD Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Receiving ER: <strong className="text-slate-200">{currentHospital.name}</strong></span>
        </div>
      </div>

      {/* Inbound Alert Card */}
      {isInbound && activeAlert ? (
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border border-rose-800/80 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse"></div>

          {/* Alert Top Meta */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-600 text-white shadow-md">
                  {activeAlert.shortCode}
                </span>
                <h3 className="text-base font-extrabold text-slate-100">
                  {activeAlert.category.replace('_', ' ')}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {activeAlert.aiTriage.urgencyLevel.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient: <span className="font-semibold text-white">{activeAlert.citizenName || 'Verified Citizen'}</span> • Location: <span className="font-semibold text-rose-300">{activeAlert.equityMetadata.wardName}</span>
              </p>
            </div>

            {/* Live ETA Box */}
            <div className="bg-rose-950/80 border border-rose-700/80 px-4 py-2 rounded-xl text-center shadow-inner">
              <div className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Estimated ER Arrival</div>
              <div className="text-2xl font-black text-white animate-pulse">
                ~{activeAlert.estimatedArrivalMinutes} MIN
              </div>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Responder Unit */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-rose-400" /> Assigned Ambulance
              </span>
              <p className="font-bold text-slate-100">{activeAlert.assignedResponder?.name || 'ALS Mobile ICU #01'}</p>
              <p className="font-mono text-[11px] text-slate-400">
                {activeAlert.assignedResponder?.vehicleNumber} • Driver: {activeAlert.assignedResponder?.driverName}
              </p>
              <a
                href={`tel:${activeAlert.assignedResponder?.contactNumber}`}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline pt-1"
              >
                <Phone className="w-3 h-3" /> Call Paramedic Crew
              </a>
            </div>

            {/* AI Triage Urgency */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Pre-Hospital AI Triage
              </span>
              <p className="font-bold text-amber-300">
                Severity Score: {activeAlert.aiTriage.triageScore}/100
              </p>
              <p className="text-[11px] text-slate-400">
                ALS Protocol: {activeAlert.aiTriage.suggestedALS ? 'Advanced Life Support Mandated' : 'Basic Life Support'}
              </p>
            </div>

            {/* First Aid Instructions Stream */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> On-Scene AI Care Active
              </span>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                {activeAlert.aiTriage.firstAidInstructions[0] || 'Continuous vital monitoring in progress'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => acknowledgeHospitalInbound(activeAlert.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Intake</span>
              </button>

              <button
                onClick={() => prepareTraumaBay(activeAlert.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Pre-Activate Trauma Bay</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 italic">
              Auto-syncs with CAD Dispatch Engine
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-300">No Inbound Emergency Transports Active</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Emergency room intake radar is clear. You can trigger an incident from the top Simulation Bar or Patient Portal to test live hospital ingestion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
