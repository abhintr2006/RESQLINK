import React from 'react';
import { EmergencyAlert, AlertStatus } from '../../types';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Ambulance,
  Phone,
  MessageSquare,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface ActiveIncidentsQueueProps {
  alerts: EmergencyAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (alert: EmergencyAlert) => void;
  onUpdateStatus: (alertId: string, status: AlertStatus) => void;
}

export const ActiveIncidentsQueue: React.FC<ActiveIncidentsQueueProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  onUpdateStatus,
}) => {
  return (
    <div className="double-bezel h-full shadow-2xl">
      <div className="double-bezel-inner flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white">
              CAD Incident Queue ({alerts.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold">WebSocket Sync</span>
        </div>

        {/* Incidents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-3 space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="font-bold text-slate-400">No active emergencies in queue.</p>
              <p className="text-[10px] mt-1 text-slate-500 max-w-[200px] mx-auto">
                Trigger an SOS in Citizen View or click "+ Inject Incident" in the top bar.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isSelected = selectedAlertId === alert.id;
              const isCritical = alert.aiTriage.urgencyLevel === 'CRITICAL_RED';

              return (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500 shadow-xl shadow-rose-500/10 ring-1 ring-rose-500/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Category & Urgency */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {alert.category.replace('_', ' ')}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {alert.shortCode}
                    </span>
                  </div>

                  {/* Middle: Location & Patient */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{alert.equityMetadata.wardName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Status: <strong className="text-slate-300">{alert.status}</strong></span>
                      <span className="font-mono text-emerald-400">~{alert.estimatedArrivalMinutes} min ETA</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
