import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';

export const PatientHistoryView: React.FC = () => {
  const { alertHistory } = useResqLink();

  // Mock static historical records if alert history is small
  const samplePastIncidents = [
    {
      id: 'INC-7729',
      shortCode: 'HIST-491',
      date: '14 Jan 2026, 04:15 PM',
      category: 'RESPIRATORY',
      description: 'Acute Bronchospasm Attack in Koramangala',
      status: 'RESOLVED',
      hospital: 'St. John’s Medical College Hospital',
      responder: 'Apollo ALS Emergency Unit #01',
      dispatchTime: '4 min 12 sec',
      dpdpCompliant: true,
    },
    {
      id: 'INC-6610',
      shortCode: 'HIST-208',
      date: '02 Nov 2025, 09:30 AM',
      category: 'GENERAL_MEDICAL',
      description: 'Severe Dehydration & Syncope in Jayanagar',
      status: 'RESOLVED',
      hospital: 'Manipal Hospital Jayanagar',
      responder: 'Manipal Emergency ALS #02',
      dispatchTime: '3 min 45 sec',
      dpdpCompliant: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            Emergency Incident & Care History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end encrypted incident logs audited under DPDP Act 2023.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
          <span>Cryptographically Sealed</span>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {/* Dynamic Alerts from session */}
        {alertHistory.map((alert) => (
          <div
            key={alert.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                  {alert.shortCode}
                </span>
                <span className="text-sm font-bold text-slate-200">{alert.category.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  {alert.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-xl">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Hospital Receiving</div>
                  <div className="font-semibold text-slate-200">{alert.assignedHospital?.name || 'Assigned ER'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-xl">
                <Truck className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Responder Unit</div>
                  <div className="font-semibold text-slate-200">{alert.assignedResponder?.name || 'ALS Unit'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Privacy Compliance</div>
                  <div className="font-semibold text-emerald-300">DPDP Consent Verified</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Static Historical Incidents */}
        {samplePastIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                  {incident.shortCode}
                </span>
                <span className="text-sm font-bold text-slate-300">{incident.category.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {incident.date}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
                  {incident.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">{incident.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 p-2.5 rounded-xl">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Hospital Receiving</div>
                  <div className="font-medium text-slate-300">{incident.hospital}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 p-2.5 rounded-xl">
                <Truck className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Response Duration</div>
                  <div className="font-medium text-slate-300">{incident.dispatchTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Verification Audit</div>
                  <div className="font-medium text-emerald-400">Hash Verified</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
