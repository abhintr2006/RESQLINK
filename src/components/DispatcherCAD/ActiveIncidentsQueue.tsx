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
  Zap,
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
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
              INCIDENT QUEUE ({alerts.length})
            </h3>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/80">
            WS LIVE
          </span>
        </div>

        {/* Incidents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2.5 space-y-2">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs font-mono">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="font-bold text-slate-300">NO ACTIVE INCIDENTS IN QUEUE</p>
              <p className="text-[10px] mt-1 text-slate-500 max-w-[220px] mx-auto font-sans">
                Trigger SOS in Citizen Portal or click "+ INJECT INCIDENT" in the top HUD bar.
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
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500 shadow-md shadow-rose-500/20 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Category & Urgency */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-700/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/80'
                      }`}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {alert.category.replace('_', ' ')}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {alert.shortCode}
                    </span>
                  </div>

                  {/* Middle: Location & Patient */}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate text-xs">{alert.equityMetadata.wardName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>STATUS: <strong className="text-slate-300">{alert.status}</strong></span>
                      <span className="font-mono text-emerald-400 font-bold">~{alert.estimatedArrivalMinutes} MIN ETA</span>
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
