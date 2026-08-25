import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { EmergencyAlert } from '../../types';
import { ActiveIncidentsQueue } from './ActiveIncidentsQueue';
import { LiveFleetMap } from './LiveFleetMap';
import {
  Radio,
  Ambulance,
  Building2,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export const DispatcherPortal: React.FC = () => {
  const {
    activeAlert,
    alertHistory,
    responders,
    hospitals,
    updateAlertStatus,
  } = useResqLink();

  // Combine activeAlert + past alerts
  const allAlerts = activeAlert
    ? [activeAlert, ...alertHistory.filter((a) => a.id !== activeAlert.id)]
    : alertHistory;

  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(
    activeAlert || (allAlerts.length > 0 ? allAlerts[0] : null)
  );

  const availableAmbulanceCount = responders.filter((r) => r.isAvailable).length;
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Ribbon - Double Bezel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                ACTIVE SOS QUEUE
              </div>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {allAlerts.filter((a) => a.status !== 'RESOLVED' && a.status !== 'CANCELLED').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                AMBULANCES PATROL
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {availableAmbulanceCount} / {responders.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow-md">
              <Ambulance className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                HOSPITAL ICU BEDS
              </div>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {totalIcuBeds} Beds
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                DISPATCH SLA AVG
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                8.4 sec
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main CAD Split Screen: Queue + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left Col: Incidents Queue */}
        <div className="lg:col-span-4 h-full">
          <ActiveIncidentsQueue
            alerts={allAlerts}
            selectedAlertId={selectedAlert?.id || null}
            onSelectAlert={(a) => setSelectedAlert(a)}
            onUpdateStatus={updateAlertStatus}
          />
        </div>

        {/* Right Col: Live Fleet Map & Incident Telemetry */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="double-bezel flex-1 min-h-[400px] shadow-2xl">
            <div className="double-bezel-inner p-2 h-full overflow-hidden">
              <LiveFleetMap
                alerts={allAlerts}
                selectedAlert={selectedAlert}
                responders={responders}
                hospitals={hospitals}
              />
            </div>
          </div>


          {/* Selected Incident Telemetry Inspector */}
          {selectedAlert && (
            <div className="double-bezel shadow-xl">
              <div className="double-bezel-inner p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-rose-600 text-white shadow-md">
                      {selectedAlert.shortCode}
                    </span>
                    <span className="text-sm font-black text-white">
                      {selectedAlert.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      • {selectedAlert.equityMetadata.wardName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-rose-400">
                      STATUS: {selectedAlert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Allocated Ambulance</span>
                    <p className="font-bold text-white mt-0.5">
                      {selectedAlert.assignedResponder?.name || 'Searching...'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Assigned Hospital</span>
                    <p className="font-bold text-white mt-0.5">
                      {selectedAlert.assignedHospital?.name || 'Searching...'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Estimated ETA</span>
                    <p className="font-bold text-amber-400 mt-0.5">
                      ~{selectedAlert.estimatedArrivalMinutes} min
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">AI Triage Priority</span>
                    <p className="font-bold text-rose-400 mt-0.5">
                      {selectedAlert.aiTriage.urgencyLevel.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
