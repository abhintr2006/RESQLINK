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
    <div className="double-bezel shadow-2xl">
      <div className="double-bezel-inner p-4 sm:p-5 space-y-3 bg-slate-950">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/80 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>TIMESTAMPED CRYPTOGRAPHIC AUDIT LEDGER</span>
                <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                  DPDP 2023 VERIFIED
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Immutable SHA-256 hash chain tracking all state transitions from SOS trigger to completion.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search ID, Event, Hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-48"
              />
            </div>

            {/* Actor Filter */}
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL ACTORS</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="GEOLOCATION_ENGINE">GEO ENGINE</option>
              <option value="AI_DISPATCH_ENGINE">AI DISPATCH</option>
              <option value="TWILIO_GATEWAY">TWILIO SMS</option>
              <option value="DISPATCHER_CAD">DISPATCHER CAD</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportAsJSON}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-mono font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer active:scale-95"
              title="Download JSON Audit Trail"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
              <p>NO AUDIT ENTRIES MATCHING FILTER</p>
              <p className="text-[10px] mt-0.5 text-slate-600 font-sans">
                Trigger an emergency SOS to generate live hashed event logs.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-mono sticky top-0 z-10">
                  <th className="p-2">TIMESTAMP</th>
                  <th className="p-2">ALERT ID</th>
                  <th className="p-2">EVENT</th>
                  <th className="p-2">ACTOR</th>
                  <th className="p-2">PAYLOAD SUMMARY</th>
                  <th className="p-2">SHA-256 PROOF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/60">
                    <td className="p-2 text-slate-400 whitespace-nowrap text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}.
                      {new Date(entry.timestamp).getMilliseconds().toString().padStart(3, '0')}
                    </td>
                    <td className="p-2 font-bold text-white whitespace-nowrap text-[10px]">
                      {entry.alertId}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold text-[9px]">
                        {entry.event}
                      </span>
                    </td>
                    <td className="p-2 text-slate-300 whitespace-nowrap text-[10px]">
                      {entry.actor}
                    </td>
                    <td className="p-2 max-w-xs truncate text-slate-400 text-[10px]">
                      {JSON.stringify(entry.details)}
                    </td>
                    <td className="p-2 text-emerald-400 text-[10px] whitespace-nowrap">
                      {entry.cryptographicHash.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
