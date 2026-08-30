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
  Zap,
} from 'lucide-react';

export const PreArrivalTriageCard: React.FC = () => {
  const { activeAlert, hospitalAdmissions, patientProfile } = useResqLink();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Pre-Arrival Telemetry & Patient Profile Brief */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-4 sm:p-5 space-y-4 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                PRE-ARRIVAL BIOMETRICS (DPDP-DECRYPTED)
              </h3>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded shadow-sm">
              ABHA SYNCED
            </span>
          </div>

          {activeAlert ? (
            <div className="space-y-3.5">
              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">BLOOD GROUP</span>
                  <p className="text-base font-extrabold text-rose-400 mt-0.5">{patientProfile.bloodGroup}</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">TRIAGE PRIORITY</span>
                  <p className="text-base font-extrabold text-amber-400 mt-0.5">
                    {activeAlert.aiTriage.urgencyLevel.split('_')[0]}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">ORGAN DONOR</span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {patientProfile.organDonor ? 'REGISTERED' : 'NO'}
                  </p>
                </div>
              </div>

              {/* Critical Red Flag Allergies */}
              <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-xl space-y-2 shadow-inner">
                <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>CRITICAL ER WARNING: KNOWN ALLERGIES</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patientProfile.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-2.5 py-1 rounded-lg bg-rose-900/80 border border-rose-700 text-rose-100 text-xs font-mono font-bold shadow-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pre-Hospital Care Protocols */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ACTIVE ON-SCENE FIRST-AID PROTOCOLS</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 font-sans">
                  {activeAlert.aiTriage.firstAidInstructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <span className="w-4 h-4 rounded bg-slate-800 text-rose-400 text-[10px] flex items-center justify-center font-mono font-bold mt-0.5 shrink-0 border border-slate-700">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed text-[11px]">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              AWAITING INBOUND EMERGENCY TRANSFER TO STREAM TELEMETRY
            </div>
          )}
        </div>
      </div>

      {/* Right: Hospital ER Admission Log */}
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-4 sm:p-5 space-y-4 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                ER INTAKE &amp; ADMISSION LOG
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold">PAST 24H AUDIT</span>
          </div>

          <div className="space-y-2.5">
            {hospitalAdmissions.map((record) => (
              <div
                key={record.id}
                className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs font-mono">{record.patientName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      {record.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <span className="text-slate-300 font-medium">{record.bedAssigned}</span>
                    <span>&bull;</span>
                    <span>{record.doctorInCharge}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-sm">
                    {record.status}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1">{record.arrivedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
