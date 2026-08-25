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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              ACTIVE SOS QUEUE
            </div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">
              {allAlerts.filter((a) => a.status !== 'RESOLVED' && a.status !== 'CANCELLED').length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              AMBULANCES PATROL
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {availableAmbulanceCount} / {responders.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <Ambulance className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              HOSPITAL ICU BEDS
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-0.5">
              {totalIcuBeds} Beds
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              DISPATCH SLA AVG
            </div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              8.4 sec
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: CAD Queue on Left + CAD Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incidents List + Selected Incident Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-[360px]">
            <ActiveIncidentsQueue
              alerts={allAlerts}
              selectedAlertId={selectedAlert?.id || null}
              onSelectAlert={(a) => setSelectedAlert(a)}
              onUpdateStatus={updateAlertStatus}
            />
          </div>

          {/* Selected Incident Drilldown Card */}
          {selectedAlert && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      Incident #{selectedAlert.id}
                    </span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-bold">
                      {selectedAlert.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Triggered: {new Date(selectedAlert.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-1 rounded">
                    Status: {selectedAlert.status}
                  </span>
                </div>
              </div>

              {/* Patient & Location info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">
                    Citizen / Reporter
                  </span>
                  <div className="font-bold text-white truncate">
                    {selectedAlert.citizenName || 'Citizen'}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedAlert.citizenPhone || '+91 98450 00000'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">
                    Ward &amp; Pincode
                  </span>
                  <div className="font-bold text-white truncate">
                    {selectedAlert.equityMetadata.wardName}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {selectedAlert.equityMetadata.isPeripheralWard ? 'Outer Bengaluru' : 'Central Ward'}
                  </span>
                </div>
              </div>

              {/* AI Triage Rationale */}
              <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/40 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Triage Assessment (Score: {selectedAlert.aiTriage.triageScore}/100)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Recommended response: {selectedAlert.aiTriage.suggestedALS ? 'ALS (Advanced Life Support) Unit' : 'BLS Unit'}. Pre-hospital resuscitation protocol active.
                </p>
              </div>

              {/* Assigned Responder Bar */}
              {selectedAlert.assignedResponder && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Ambulance className="w-4 h-4 text-emerald-400" />
                    <div>
                      <strong className="text-white block">{selectedAlert.assignedResponder.name}</strong>
                      <span className="text-[11px] text-slate-400">
                        Driver: {selectedAlert.assignedResponder.driverName} • ETA: ~{selectedAlert.estimatedArrivalMinutes} min
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${selectedAlert.assignedResponder.contactNumber}`}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Driver</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: CAD Fleet Map */}
        <div className="lg:col-span-7">
          <LiveFleetMap
            alerts={allAlerts}
            responders={responders}
            hospitals={hospitals}
            selectedAlert={selectedAlert}
          />
        </div>
      </div>
    </div>
  );
};
