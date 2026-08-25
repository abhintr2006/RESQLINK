import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  FileText,
  HeartPulse,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';

export const PreArrivalTriageCard: React.FC = () => {
  const { activeAlert, hospitalAdmissions, patientProfile } = useResqLink();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Pre-Arrival Telemetry & Patient Profile Brief */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Incoming Patient Pre-Arrival Profile (DPDP Decrypted)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
            ABHA Connected
          </span>
        </div>

        {activeAlert ? (
          <div className="space-y-4">
            {/* Vitals Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500">Blood Group</span>
                <p className="text-base font-extrabold text-rose-400 mt-0.5">{patientProfile.bloodGroup}</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500">Triage Priority</span>
                <p className="text-base font-extrabold text-amber-400 mt-0.5">
                  {activeAlert.aiTriage.urgencyLevel.split('_')[0]}
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500">Organ Donor</span>
                <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {patientProfile.organDonor ? 'Registered' : 'No'}
                </p>
              </div>
            </div>

            {/* Red Flag Allergies */}
            <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Critical ER Warning: Known Allergies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patientProfile.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-2.5 py-1 rounded bg-rose-900/70 border border-rose-700 text-rose-200 text-xs font-bold"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Pre-Hospital Care Notes */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI First Aid &amp; Paramedic Protocols Active</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {activeAlert.aiTriage.firstAidInstructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Awaiting inbound emergency transfer to stream real-time biometric and triage data.
          </div>
        )}
      </div>

      {/* Right: Hospital ER Admission Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Emergency Department Patient Intake Log
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Past 24 Hours</span>
        </div>

        <div className="space-y-3">
          {hospitalAdmissions.map((record) => (
            <div
              key={record.id}
              className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{record.patientName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                    {record.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{record.bedAssigned}</span>
                  <span>•</span>
                  <span>{record.doctorInCharge}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  {record.status}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{record.arrivedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
