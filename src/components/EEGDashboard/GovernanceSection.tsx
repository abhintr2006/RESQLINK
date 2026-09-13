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
    <div className="space-y-4">
      {/* Governance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* DPDP Act Compliance */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">DPDP ACT 2023 COMPLIANCE</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-emerald-400">{metrics.dpdpConsentCompliancePct}%</span>
              <span className="text-[10px] font-mono text-slate-400">DATA MINIMIZED</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full w-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Ephemeral location retention; zero citizen profiling
            </p>
          </div>
        </div>

        {/* Audit Trail Completeness */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">AUDIT TRAIL COMPLETENESS</span>
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-cyan-400">{metrics.auditTrailCompletenessPct}%</span>
              <span className="text-[10px] font-mono text-slate-400">HASHED LEDGER</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-cyan-500 h-full rounded-full w-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Every trigger &amp; dispatch is cryptographically chained
            </p>
          </div>
        </div>

        {/* Algorithmic Bias Audit Score */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">ALGORITHMIC BIAS AUDIT</span>
              <Scale className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.algorithmicBiasAuditScorePct}%</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">FAIR ALLOCATION</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${metrics.algorithmicBiasAuditScorePct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Ward parity weighting mitigates spatial neglect
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Accountability Mapping Matrix (Section 3.4.3) */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                INSTITUTIONAL ACCOUNTABILITY MAPPING (MEITY AI GOVERNANCE 2025)
              </h3>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">PAPER SEC 3.4.3 &bull; 5.3</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            To prevent opaque liability diffusion in AI emergency systems, responsibilities are mapped across 4 operational tiers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono text-xs">1. Client Application &amp; UI Layer</strong>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                  RESQLINK TEAM
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Accessible zero-barrier SOS triggers, offline caching, high-contrast usability, and DPDP consent telemetry.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono text-xs">2. AI Dispatch &amp; Geolocation Engine</strong>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800">
                  ALGORITHM &amp; MEITY
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Location-Lock dual verification, ward equity weighting, bias mitigation across BBMP wards, and triage scoring.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono text-xs">3. Third-Party Telecom &amp; Maps Gateway</strong>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                  CARRIER SLA (TWILIO)
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Contractual carrier uptime for 2G SMS delivery and GNSS geocoding resolution with automatic network fallback.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono text-xs">4. First Responders &amp; Hospital Trauma</strong>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                  108 FLEET &amp; ER
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Physical ambulance navigation, ALS paramedic clinical protocols on-scene, and ER trauma bed admissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
