import React from 'react';
import { EEGMetrics } from '../../types';
import {
  Timer,
  Crosshair,
  ShieldAlert,
  Radio,
  Zap,
  CheckCircle2,
  Table as TableIcon,
} from 'lucide-react';

interface EfficacySectionProps {
  metrics: EEGMetrics['efficacy'];
}

export const EfficacySection: React.FC<EfficacySectionProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* Efficacy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* SOS-to-Confirmation Latency */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">SOS-TO-CONFIRM LATENCY</span>
              <Timer className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-emerald-400">{metrics.avgSosToConfirmSeconds}s</span>
              <span className="text-[10px] font-mono text-rose-400 line-through">vs 195s (Voice 108)</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              <strong className="text-emerald-400">23x faster</strong> dispatch confirmation than verbal 108 CAD
            </p>
          </div>
        </div>

        {/* GPS Acquisition Mean */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">GNSS ACQUISITION MEAN</span>
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.gpsAcquisitionMeanSeconds}s</span>
              <span className="text-[10px] font-mono text-slate-400">Accuracy &lt;15m</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-cyan-500 h-full rounded-full w-[92%]" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Dual-lock temporal GNSS stabilization
            </p>
          </div>
        </div>

        {/* False Dispatch Rejection Rate */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">FALSE ALARM REJECTION</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.falseDispatchRejectionRatePct}%</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">PROTECTED</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${metrics.falseDispatchRejectionRatePct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Rejects accidental taps &amp; coordinate jitter
            </p>
          </div>
        </div>

        {/* SMS Fallback Reliability */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">2G SMS RELIABILITY</span>
              <Radio className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.smsFallbackDeliverySuccessPct}%</span>
              <span className="text-[10px] font-mono text-slate-400">TWILIO GATEWAY</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${metrics.smsFallbackDeliverySuccessPct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Tested under simulated 2G conditions
            </p>
          </div>
        </div>
      </div>

      {/* TABLE 1 BENCHMARK COMPARISON from Research Paper */}
      <div className="double-bezel">
        <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                TABLE 1: QUALITATIVE COMPARISON OF RESQLINK VS TRADITIONAL CAD PLATFORMS
              </h3>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">PAPER SECTION 5.1</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-mono">
                  <th className="p-2.5">DIMENSION</th>
                  <th className="p-2.5">DISPATCHER-FACING CAD (TRADITIONAL 108)</th>
                  <th className="p-2.5 text-emerald-400 font-bold">RESQLINK (PROPOSED AI SYSTEM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Trigger Point</td>
                  <td className="p-2.5 text-slate-400">Requires voice call to operator; prone to panic delay</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">Single-tap citizen-initiated SOS from mobile / web</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Location Capture</td>
                  <td className="p-2.5 text-slate-400">Verbal address description; inaccurate in unfamiliar/stressful zones</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">Automated GPS capture with fallback and location-lock verification</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Low-Connectivity Behaviour</td>
                  <td className="p-2.5 text-slate-400">Not addressed at citizen app layer; relies on active voice channel</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">SMS-based fallback dispatch via Twilio Gateway</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Accessibility Focus</td>
                  <td className="p-2.5 text-slate-400">General public dispatcher-mediated; difficult for speech/hearing-impaired</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">Zero-learning-curve interface with multilingual voice guidance (EN/KN/HI)</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Accountability &amp; Traceability</td>
                  <td className="p-2.5 text-slate-400">Varies by vendor; fragmented voice logs</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">Built-in cryptographically hashed timestamped audit trail</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-2.5 font-mono font-bold text-white">Equity &amp; Governance Evaluation</td>
                  <td className="p-2.5 text-slate-400">Not formalized; no digital divide tracking</td>
                  <td className="p-2.5 text-emerald-300 font-medium bg-emerald-950/20">Structured EEG Framework aligned with MeitY AI Guidelines &amp; DPDP 2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
