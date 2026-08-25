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
    <div className="space-y-6">
      {/* Efficacy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SOS-to-Confirmation Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">SOS-to-Confirm Latency</span>
            <Timer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{metrics.avgSosToConfirmSeconds}s</span>
            <span className="text-xs text-rose-400 font-semibold line-through">vs 195s (Voice 108)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
          </div>
          <p className="text-[10px] text-slate-400">
            <strong>23x faster</strong> dispatch confirmation than verbal 108 CAD call
          </p>
        </div>

        {/* GPS Acquisition Mean */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">GPS Acquisition Mean</span>
            <Crosshair className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.gpsAcquisitionMeanSeconds}s</span>
            <span className="text-xs text-slate-400">Accuracy &lt;15m</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-[92%]" />
          </div>
          <p className="text-[10px] text-slate-400">
            Dual-sample Location-Lock temporal stabilization
          </p>
        </div>

        {/* False Dispatch Rejection Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">False Alarm Rejection</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.falseDispatchRejectionRatePct}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Protected</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${metrics.falseDispatchRejectionRatePct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Rejects accidental taps and jittery GPS coordinates
          </p>
        </div>

        {/* SMS Fallback Reliability */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">2G SMS Reliability</span>
            <Radio className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.smsFallbackDeliverySuccessPct}%</span>
            <span className="text-xs text-slate-400">Twilio Gateway</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${metrics.smsFallbackDeliverySuccessPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Tested under simulated 2G / zero-broadband conditions
          </p>
        </div>
      </div>

      {/* TABLE 1 BENCHMARK COMPARISON from Research Paper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Table 1: Qualitative Comparison of RESQLINK vs Traditional CAD Platforms
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Paper Section 5.1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-3">Dimension</th>
                <th className="p-3">Dispatcher-Facing CAD (Traditional 108)</th>
                <th className="p-3 text-emerald-400">RESQLINK (Proposed AI System)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Trigger Point</td>
                <td className="p-3 text-slate-400">Requires voice call to operator; prone to panic delay</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">Single-tap citizen-initiated SOS from mobile / web</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Location Capture</td>
                <td className="p-3 text-slate-400">Verbal address description; inaccurate in unfamiliar/stressful zones</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">Automated GPS capture with fallback and location-lock verification</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Low-Connectivity Behaviour</td>
                <td className="p-3 text-slate-400">Not addressed at citizen app layer; relies on active voice channel</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">SMS-based fallback dispatch via Twilio Gateway</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Accessibility Focus</td>
                <td className="p-3 text-slate-400">General public dispatcher-mediated; difficult for speech/hearing-impaired</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">Zero-learning-curve interface with multilingual voice guidance (EN/KN/HI)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Accountability &amp; Traceability</td>
                <td className="p-3 text-slate-400">Varies by vendor; fragmented voice logs</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">Built-in cryptographically hashed timestamped audit trail</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Equity &amp; Governance Evaluation</td>
                <td className="p-3 text-slate-400">Not formalized; no digital divide tracking</td>
                <td className="p-3 text-emerald-300 font-medium bg-emerald-950/20">Structured EEG Framework aligned with MeitY AI Guidelines &amp; DPDP 2023</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
