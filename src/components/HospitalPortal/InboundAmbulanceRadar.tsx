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
  Flame,
  Radio,
  Zap,
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

  const isInbound =
    activeAlert &&
    (activeAlert.status === 'DISPATCHED' ||
      activeAlert.status === 'EN_ROUTE' ||
      activeAlert.status === 'ON_SCENE');

  return (
    <div className="double-bezel shadow-2xl">
      <div className="double-bezel-inner p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 rounded-xl border-2 border-rose-500/30 animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold text-white uppercase">INBOUND EMERGENCY RADAR &amp; TELEMETRY</h2>
                {isInbound && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600 text-white animate-pulse shadow-sm">
                    INCOMING TRANSPORT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Live pre-arrival stream from 108 CAD &bull; Facility: <strong className="text-slate-200">{currentHospital.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-300 bg-slate-900 border border-slate-700/80 px-3 py-1 rounded-xl shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>SYNC: <strong className="text-emerald-400">100ms CAD STREAM</strong></span>
          </div>
        </div>

        {/* Inbound Alert Telemetry Card */}
        {isInbound && activeAlert ? (
          <div className="bg-slate-950/90 border border-rose-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse"></div>

            {/* Top Meta Details */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-600 text-white shadow-sm">
                    {activeAlert.shortCode}
                  </span>
                  <h3 className="text-base font-mono font-bold text-white uppercase">
                    {activeAlert.category.replace('_', ' ')}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-700/80">
                    {activeAlert.aiTriage.urgencyLevel.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Citizen: <strong className="text-white">{activeAlert.citizenName || 'Verified Bengaluru Citizen'}</strong> &bull; Ward: <strong className="text-rose-300">{activeAlert.equityMetadata.wardName}</strong>
                </p>
              </div>

              {/* ETA Display Capsule */}
              <div className="bg-rose-950/90 border border-rose-600/80 px-4 py-2 rounded-xl text-center shadow-lg">
                <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-rose-300">ESTIMATED ARRIVAL</div>
                <div className="text-2xl font-mono font-extrabold text-white tracking-tight mt-0.5 animate-pulse">
                  ~{activeAlert.estimatedArrivalMinutes} MIN
                </div>
              </div>
            </div>

            {/* Telemetry 3-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              {/* Ambulance Details */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-rose-400" /> ASSIGNED UNIT
                </span>
                <p className="font-bold text-slate-100 text-xs">{activeAlert.assignedResponder?.name || 'ALS Mobile ICU'}</p>
                <p className="text-[10px] text-slate-400">
                  Veh: {activeAlert.assignedResponder?.vehicleNumber} &bull; Driver: {activeAlert.assignedResponder?.driverName}
                </p>
                <a
                  href={`tel:${activeAlert.assignedResponder?.contactNumber}`}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline pt-0.5"
                >
                  <Phone className="w-3 h-3" /> Call Paramedic Crew
                </a>
              </div>

              {/* AI Triage Urgency */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> PRE-HOSPITAL AI TRIAGE
                </span>
                <p className="font-bold text-amber-300 text-xs">
                  Severity Score: {activeAlert.aiTriage.triageScore} / 100
                </p>
                <p className="text-[10px] text-slate-400">
                  Protocol: {activeAlert.aiTriage.suggestedALS ? 'ALS Mandated (Defib+O2)' : 'BLS Unit Sufficient'}
                </p>
              </div>

              {/* Paramedic Active Instructions */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> ON-SCENE PROTOCOL
                </span>
                <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
                  {activeAlert.aiTriage.firstAidInstructions[0] || 'Airway secured; continuous cardiac telemetry enabled.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => acknowledgeHospitalInbound(activeAlert.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold tracking-wide shadow-md shadow-emerald-600/30 transition cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACKNOWLEDGE INTAKE</span>
                </button>

                <button
                  onClick={() => prepareTraumaBay(activeAlert.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold tracking-wide shadow-md shadow-rose-600/30 transition cursor-pointer active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>PRE-ACTIVATE TRAUMA BAY</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono italic">
                Auto-synchronized with Bengaluru Metro CAD
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto shadow-inner">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">NO INBOUND EMERGENCY TRANSPORTS IN PROGRESS</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md mx-auto leading-relaxed">
                Intake radar is active and monitoring all dispatched ambulances across Bengaluru. Trigger an incident from the Simulation Bar to test telemetry ingestion.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
