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
  Sparkles,
} from 'lucide-react';

export const PreArrivalTriageCard: React.FC = () => {
  const { activeAlert, hospitalAdmissions, patientProfile } = useResqLink();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Pre-Arrival Telemetry & Patient Profile Brief */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                Pre-Arrival Patient Telemetry (DPDP Decrypted)
              </h3>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full shadow-sm">
              ABHA SYNCED
            </span>
          </div>

          {activeAlert ? (
            <div className="space-y-5">
              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Blood Group</span>
                  <p className="text-lg font-black text-rose-400 mt-1">{patientProfile.bloodGroup}</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Triage Priority</span>
                  <p className="text-lg font-black text-amber-400 mt-1">
                    {activeAlert.aiTriage.urgencyLevel.split('_')[0]}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Organ Donor</span>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {patientProfile.organDonor ? 'Registered' : 'No'}
                  </p>
                </div>
              </div>

              {/* Critical Red Flag Allergies */}
              <div className="bg-rose-950/40 border border-rose-800/80 p-5 rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Critical ER Warning: Known Allergies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientProfile.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-3 py-1.5 rounded-xl bg-rose-900/80 border border-rose-700 text-rose-100 text-xs font-black shadow-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pre-Hospital Care Protocols */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs">
                <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Active AI First Aid &amp; Paramedic Care Steps</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  {activeAlert.aiTriage.firstAidInstructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-slate-800 text-rose-400 text-xs flex items-center justify-center font-black mt-0.5 shrink-0 border border-slate-700">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 font-medium">
              Awaiting inbound emergency transfer to stream real-time biometric and triage data.
            </div>
          )}
        </div>
      </div>

      {/* Right: Hospital ER Admission Log */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                Emergency Department Intake Log
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">Past 24 Hours</span>
          </div>

          <div className="space-y-3.5">
            {hospitalAdmissions.map((record) => (
              <div
                key={record.id}
                className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs hover:border-slate-700 transition-all duration-300"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-white text-sm">{record.patientName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-300">
                      {record.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-slate-300 font-medium">{record.bedAssigned}</span>
                    <span>•</span>
                    <span>{record.doctorInCharge}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm">
                    {record.status}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{record.arrivedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
