import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  Hash,
  Clock,
  User,
  Filter,
} from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedActor, setSelectedActor] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.alertId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cryptographicHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor = selectedActor === 'ALL' || log.actor === selectedActor;
    return matchesSearch && matchesActor;
  });

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `resqlink_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Timestamped Cryptographic Audit Ledger</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                DPDP 2023 Verified
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Immutable hash chain tracking every state change from SOS trigger to responder resolution.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, Event, Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Actor Filter */}
          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Actors</option>
            <option value="CITIZEN">Citizen</option>
            <option value="GEOLOCATION_ENGINE">Geo Engine</option>
            <option value="AI_DISPATCH_ENGINE">AI Dispatch</option>
            <option value="TWILIO_GATEWAY">Twilio SMS</option>
            <option value="DISPATCHER_CAD">Dispatcher CAD</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportAsJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
            title="Download JSON Audit Trail"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No audit entries matching filter.</p>
            <p className="text-[10px] mt-1 text-slate-600">
              Trigger an emergency SOS to generate live hashed event logs.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                <th className="p-2.5">Timestamp (ISO)</th>
                <th className="p-2.5">Alert ID</th>
                <th className="p-2.5">Event Type</th>
                <th className="p-2.5">Actor</th>
                <th className="p-2.5">Details</th>
                <th className="p-2.5">Hash / Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString()}.
                    {new Date(entry.timestamp).getMilliseconds().toString().padStart(3, '0')}
                  </td>
                  <td className="p-2.5 font-bold text-white whitespace-nowrap">
                    {entry.alertId}
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold text-[10px]">
                      {entry.event}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-300 whitespace-nowrap">
                    {entry.actor}
                  </td>
                  <td className="p-2.5 max-w-xs truncate text-slate-400">
                    {JSON.stringify(entry.details)}
                  </td>
                  <td className="p-2.5 text-emerald-400 text-[10px] whitespace-nowrap">
                    {entry.cryptographicHash.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
