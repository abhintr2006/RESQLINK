import React from 'react';
import { EEGMetrics } from '../../types';
import {
  ShieldCheck,
  FileCheck,
  Scale,
  Building,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GovernanceSectionProps {
  metrics: EEGMetrics['governance'];
}

export const GovernanceSection: React.FC<GovernanceSectionProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      {/* Governance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* DPDP Act Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">DPDP Act 2023 Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{metrics.dpdpConsentCompliancePct}%</span>
            <span className="text-xs text-slate-400">Data Minimization</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-400">
            Ephemeral location retention; zero non-essential citizen profiling
          </p>
        </div>

        {/* Audit Trail Completeness */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Audit Trail Completeness</span>
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400">{metrics.auditTrailCompletenessPct}%</span>
            <span className="text-xs text-slate-400">Hashed Ledger</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-400">
            Every trigger, GPS sample, and dispatch is cryptographically chained
          </p>
        </div>

        {/* Algorithmic Bias Audit Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Algorithmic Bias Audit</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.algorithmicBiasAuditScorePct}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Fair Allocation</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${metrics.algorithmicBiasAuditScorePct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Ward-parity weighting prevents neglect of peripheral urban zones
          </p>
        </div>
      </div>

      {/* Institutional Accountability Mapping Matrix (Section 3.4.3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Institutional Accountability Mapping (MeitY AI Governance 2025)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Paper Section 3.4.3 &amp; 5.3</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To prevent opaque responsibility diffusion in AI emergency systems, liability and oversight are clearly assigned across four operational tiers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-white">1. Client Application &amp; UI Layer</strong>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                RESQLINK Engineering
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Responsible for accessible zero-barrier triggers, offline state management, high-contrast usability, and DPDP consent notices.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-white">2. AI Dispatch &amp; Geolocation Engine</strong>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                RESQLINK Algorithm &amp; MeitY
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Responsible for Location-Lock safety protocol, fairness weighting, bias mitigation across BBMP wards, and triage scoring.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-white">3. Third-Party Infrastructure (Twilio / Maps)</strong>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                Service Level Agreements (SLA)
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Contractual carrier uptime for 2G SMS delivery (Twilio) and Places API geocoding resolution. Fallback triggers handle API outages.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-white">4. Physical Responder Crew &amp; Hospitals</strong>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                108 Emergency &amp; Hospitals
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Responsible for physical vehicular navigation, ALS medical resuscitation on scene, and trauma hospital admission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
