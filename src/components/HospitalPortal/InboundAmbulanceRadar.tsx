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
  Building2,
} from 'lucide-react';

export const InboundAmbulanceRadar: React.FC = () => {
  const {
    activeAlert,
    selectedHospitalId,
    setSelectedHospitalId,
    hospitals,
    acknowledgeHospitalInbound,
    prepareTraumaBay,
    simulateExternalIncident,
  } = useResqLink();

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const isInbound =
    activeAlert &&
    (activeAlert.status === 'DISPATCHED' ||
      activeAlert.status === 'EN_ROUTE' ||
      activeAlert.status === 'ON_SCENE');

  const isAssignedToThisHospital =
    activeAlert?.assignedHospital?.id === currentHospital.id;

  return (
    <div className="double-bezel shadow-2xl">
      <div className="double-bezel-inner p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-600/20">
              <Radio className="w-6 h-6 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30 animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-white">Inbound Emergency Radar &amp; CAD Telemetry</h2>
                {isInbound && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse shadow-md">
                    INCOMING TRANSPORT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live pre-arrival stream from 108 CAD • Facility: <strong className="text-slate-200">{currentHospital.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Telemetry Mode: <strong className="text-emerald-400 font-mono">MIL-STD 100ms Sync</strong></span>
          </div>
        </div>

        {/* Hospital Routing Notification if assigned elsewhere */}
        {isInbound && activeAlert && !isAssignedToThisHospital && activeAlert.assignedHospital && (
          <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Active inbound ambulance is currently routed to <strong>{activeAlert.assignedHospital.name}</strong> ({activeAlert.assignedHospital.area}).
              </span>
            </div>
            <button
              onClick={() => setSelectedHospitalId(activeAlert.assignedHospital?.id || 'HOSP-01')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition cursor-pointer shadow-md"
            >
              Switch to {activeAlert.assignedHospital.name.split(' ')[0]} ➔
            </button>
          </div>
        )}

        {/* Inbound Alert Telemetry Card */}
        {isInbound && activeAlert ? (
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border border-rose-800/80 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse"></div>

            {/* Top Meta Details */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-rose-600 text-white shadow-md">
                    {activeAlert.shortCode}
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {activeAlert.category.replace('_', ' ')}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {activeAlert.aiTriage.urgencyLevel.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Citizen: <strong className="text-white">{activeAlert.citizenName || 'Verified Citizen'}</strong> • Location: <strong className="text-rose-300">{activeAlert.equityMetadata?.wardName || 'Bengaluru Urban'}</strong>
                </p>
              </div>

              {/* ETA Display Capsule */}
              <div className="bg-rose-950/90 border border-rose-600/80 px-6 py-3 rounded-2xl text-center shadow-2xl">
                <div className="text-[10px] uppercase font-black tracking-widest text-rose-300">Estimated ER Arrival</div>
                <div className="text-3xl font-black text-white tracking-tight mt-0.5 animate-pulse">
                  ~{activeAlert.estimatedArrivalMinutes} MIN
                </div>
              </div>
            </div>

            {/* Telemetry 3-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Ambulance Details */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-400" /> Dispatched Unit
                </span>
                <div className="font-bold text-white text-sm">
                  {activeAlert.assignedResponder?.name || '108 Advanced Life Support Unit'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Driver: <span className="text-slate-200 font-bold">{activeAlert.assignedResponder?.driverName || ' Anthony Das'}</span> • Veh: {activeAlert.assignedResponder?.vehicleNumber || 'KA-02-ICU-8822'}
                </div>
                {activeAlert.assignedResponder?.contactNumber && (
                  <a
                    href={`tel:${activeAlert.assignedResponder.contactNumber}`}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3" /> Call Paramedic Crew
                  </a>
                )}
              </div>

              {/* Triage & Urgency */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Clinical Severity
                </span>
                <p className="font-black text-amber-300 text-sm">
                  Severity Score: {activeAlert.aiTriage.triageScore} / 100
                </p>
                <p className="text-[11px] text-slate-400">
                  Protocol: {activeAlert.aiTriage.suggestedALS ? 'Advanced Life Support (ALS) Mandated' : 'Basic Life Support (BLS)'}
                </p>
              </div>

              {/* Paramedic Active Instructions */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-400" /> On-Scene Clinical Protocol
                </span>
                <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                  {activeAlert.aiTriage.firstAidInstructions[0] || 'Patient airway secured; continuous cardiac monitoring.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => acknowledgeHospitalInbound(activeAlert.id)}
                  className="flex items-center gap-3 pl-5 pr-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black tracking-wide shadow-xl shadow-emerald-600/30 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span>Acknowledge Intake</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </button>

                <button
                  onClick={() => prepareTraumaBay(activeAlert.id)}
                  className="flex items-center gap-3 pl-5 pr-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black tracking-wide shadow-xl shadow-rose-600/30 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span>Pre-Activate Trauma Bay</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </button>
              </div>

              <span className="text-xs text-slate-400 italic">
                Auto-synchronized with Bengaluru Metro CAD
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-200">No Inbound Emergency Transports in Progress</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Emergency room intake radar is active and monitoring all dispatched ambulances across Bengaluru. Trigger a test emergency incident to stream live telemetry.
              </p>
            </div>

            <div>
              <button
                onClick={() => simulateExternalIncident()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Simulate Inbound Emergency Transport</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
