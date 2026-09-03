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
    <div className="space-y-4 font-mono">
      {/* Header Banner - Double Bezel */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>EMERGENCY INCIDENT &amp; CARE HISTORY</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Encrypted incident logs audited under DPDP Act 2023 &amp; MeitY AI Guidelines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-xl shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>CRYPTOGRAPHICALLY VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {/* Dynamic Alerts from this session */}
        {alertHistory.map((alert) => (
          <div key={alert.id} className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-950 border border-rose-800 text-rose-300 shadow-sm">
                    {alert.shortCode}
                  </span>
                  <span className="text-sm font-bold text-white">{alert.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">HOSPITAL RECEIVING</div>
                    <div className="font-bold text-slate-100 mt-0.5">{alert.assignedHospital?.name || 'Assigned ER'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                  <Truck className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">PARAMEDIC UNIT</div>
                    <div className="font-bold text-slate-100 mt-0.5">{alert.assignedResponder?.name || 'ALS Unit'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">PRIVACY AUDIT</div>
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
            <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300">
                    {incident.shortCode}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{incident.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {incident.date}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                    {incident.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans">{incident.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/60 p-2.5 rounded-xl">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">HOSPITAL RECEIVING</div>
                    <div className="font-bold text-slate-300">{incident.hospital}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/60 p-2.5 rounded-xl">
                  <Truck className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">RESPONSE DURATION</div>
                    <div className="font-bold text-slate-300">{incident.dispatchTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/60 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">CRYPTOGRAPHIC PROOF</div>
                    <div className="font-mono text-[10px] text-emerald-400">{incident.hash}</div>
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
