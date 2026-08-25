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
  Lock,
} from 'lucide-react';

export const PatientHistoryView: React.FC = () => {
  const { alertHistory } = useResqLink();

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
      hash: 'sha256:7f92b...e4a1',
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
      hash: 'sha256:1a84c...b982',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner - Double Bezel */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Emergency Incident &amp; Care History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end encrypted incident logs audited under DPDP Act 2023 &amp; MeitY AI Guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 rounded-2xl shadow-sm">
            <Lock className="w-4 h-4" />
            <span>Cryptographically Verified Trail</span>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-5">
        {/* Dynamic Alerts from this session */}
        {alertHistory.map((alert) => (
          <div key={alert.id} className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-rose-950 border border-rose-800 text-rose-300 shadow-sm">
                    {alert.shortCode}
                  </span>
                  <span className="text-base font-black text-white">{alert.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 border border-emerald-800 text-emerald-300">
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                  <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hospital Receiving</div>
                    <div className="font-bold text-slate-100 mt-0.5">{alert.assignedHospital?.name || 'Assigned ER'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                  <Truck className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Paramedic Unit</div>
                    <div className="font-bold text-slate-100 mt-0.5">{alert.assignedResponder?.name || 'ALS Unit'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Data Privacy Audit</div>
                    <div className="font-bold text-emerald-300 mt-0.5">DPDP Consent Sealed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Static Historical Incidents */}
        {samplePastIncidents.map((incident) => (
          <div key={incident.id} className="double-bezel opacity-90">
            <div className="double-bezel-inner p-6 space-y-4 bg-slate-950/70">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
                    {incident.shortCode}
                  </span>
                  <span className="text-sm font-bold text-slate-200">{incident.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {incident.date}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                    {incident.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400">{incident.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Hospital Receiving</div>
                    <div className="font-semibold text-slate-300">{incident.hospital}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl">
                  <Truck className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Response Duration</div>
                    <div className="font-semibold text-slate-300">{incident.dispatchTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Cryptographic Proof</div>
                    <div className="font-mono text-[11px] text-emerald-400">{incident.hash}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
