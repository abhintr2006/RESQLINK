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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
            CAD Incident Queue ({alerts.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Live Real-Time WebSocket</span>
      </div>

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No active emergencies in queue.</p>
            <p className="text-[10px] mt-1 text-slate-600">
              Trigger SOS in Citizen View or click "+ Inject SOS" above.
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
                className={`p-3 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-slate-800/90 border-rose-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                {/* Top: Category & Urgency */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {alert.category.replace('_', ' ')}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {alert.id}
                  </span>
                </div>

                {/* Ward and Location */}
                <div className="text-xs text-white font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{alert.equityMetadata.wardName}</span>
                </div>

                {/* Network & SMS fallback flag */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {alert.fallbackSMSUsed ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800 font-mono">
                        <MessageSquare className="w-2.5 h-2.5" />
                        2G SMS Fallback
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/80">
                        Broadband 4G/5G
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {alert.estimatedArrivalMinutes} min ETA
                  </span>
                </div>

                {/* Assigned Responder */}
                {alert.assignedResponder && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Ambulance className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[140px] font-medium">
                        {alert.assignedResponder.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {alert.status === 'DISPATCHED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(alert.id, 'EN_ROUTE');
                          }}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                        >
                          En Route
                        </button>
                      )}
                      {alert.status === 'EN_ROUTE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(alert.id, 'ON_SCENE');
                          }}
                          className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold"
                        >
                          On Scene
                        </button>
                      )}
                      {alert.status === 'ON_SCENE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(alert.id, 'RESOLVED');
                          }}
                          className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
