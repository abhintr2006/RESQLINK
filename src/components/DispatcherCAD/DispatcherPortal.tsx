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
  Zap,
  Activity,
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
    <div className="space-y-4">
      {/* Top Metrics Ribbon - Double Bezel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                ACTIVE CAD INCIDENTS
              </div>
              <div className="text-xl font-mono font-extrabold text-rose-400 mt-0.5">
                {allAlerts.filter((a) => a.status !== 'RESOLVED' && a.status !== 'CANCELLED').length}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-400 flex items-center justify-center shadow-md">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                AMBULANCES PATROL
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                {availableAmbulanceCount} / {responders.length}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shadow-md">
              <Ambulance className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                TRAUMA ICU BEDS
              </div>
              <div className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5">
                {totalIcuBeds} BEDS
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 flex items-center justify-center shadow-md">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="double-bezel shadow-lg">
          <div className="double-bezel-inner p-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                DISPATCH SLA AVG
              </div>
              <div className="text-xl font-mono font-extrabold text-amber-400 mt-0.5">
                8.4 SEC
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400 flex items-center justify-center shadow-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main CAD Split Screen: Queue + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
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
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          <div className="double-bezel flex-1 min-h-[420px] shadow-2xl">
            <div className="double-bezel-inner p-1.5 h-full overflow-hidden">
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
              <div className="double-bezel-inner p-4 bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-600 text-white shadow-sm">
                      {selectedAlert.shortCode}
                    </span>
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      {selectedAlert.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      &bull; {selectedAlert.equityMetadata.wardName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-rose-300">
                      STATUS: {selectedAlert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ALLOCATED FLEET</span>
                    <p className="font-bold text-white mt-0.5 truncate">
                      {selectedAlert.assignedResponder?.name || 'Searching...'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">DESTINATION TRAUMA</span>
                    <p className="font-bold text-white mt-0.5 truncate">
                      {selectedAlert.assignedHospital?.name || 'Searching...'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ROUTE ETA</span>
                    <p className="font-bold text-amber-400 mt-0.5">
                      ~{selectedAlert.estimatedArrivalMinutes} MIN
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">AI TRIAGE PRIORITY</span>
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
