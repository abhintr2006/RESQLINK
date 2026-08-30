import React from 'react';
import { EEGMetrics } from '../../types';
import {
  Users,
  Smartphone,
  Languages,
  MapPin,
  HeartHandshake,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface EquitySectionProps {
  metrics: EEGMetrics['equity'];
}

export const EquitySection: React.FC<EquitySectionProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* Equity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 2G vs 5G Access Parity */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">2G/5G ACCESS PARITY</span>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.accessParity2Gvs5G.rate2G}%</span>
              <span className="text-[10px] font-mono text-slate-400">2G SUCCESS</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${metrics.accessParity2Gvs5G.rate2G}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              5G: <strong className="text-slate-200">{metrics.accessParity2Gvs5G.rate5G}%</strong> &bull; Parity Gap: &lt;2.6%
            </p>
          </div>
        </div>

        {/* Peripheral Ward Coverage */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">OUTER WARD COVERAGE</span>
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.peripheralWardCoverageRate}%</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">HIGH EQUITY</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${metrics.peripheralWardCoverageRate}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Kanakapura Rd, Kengeri, Peri-urban
            </p>
          </div>
        </div>

        {/* Vulnerable Demographic Coverage */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">VULNERABLE ACCESS</span>
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">{metrics.vulnerableUserSuccessRate}%</span>
              <span className="text-[10px] font-mono text-slate-400">1-TAP PASS</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${metrics.vulnerableUserSuccessRate}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Elderly &amp; motor-impaired unassisted
            </p>
          </div>
        </div>

        {/* Affordability Burden */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-3.5 space-y-2 bg-slate-950">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-[9px]">CITIZEN COST BURDEN</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-emerald-400">₹0.00</span>
              <span className="text-[10px] font-mono text-slate-400">PER SOS</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full w-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Toll-free 108 CAD sponsored gateway
            </p>
          </div>
        </div>
      </div>

      {/* Language Breakdown & Research Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Distribution */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  MULTILINGUAL &amp; LITERACY INCLUSION (SEC 3.4.1)
                </h3>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">AUDIO + ICONS</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-bold">ಕನ್ನಡ (Kannada) - Regional Primary</span>
                  <span className="text-amber-400 font-bold">{metrics.multiLanguageUsagePct.kn}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${metrics.multiLanguageUsagePct.kn}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-bold">English - Cosmopolitan</span>
                  <span className="text-cyan-400 font-bold">{metrics.multiLanguageUsagePct.en}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${metrics.multiLanguageUsagePct.en}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-bold">हिन्दी (Hindi) - Migrant Workforce</span>
                  <span className="text-emerald-400 font-bold">{metrics.multiLanguageUsagePct.hi}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${metrics.multiLanguageUsagePct.hi}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Divide Mitigation */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-4 space-y-3 bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                DIGITAL DIVIDE MITIGATION (ARORA ET AL. 2026)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              In urban India, ~25% of citizens rely on 2G feature phones or spotty bandwidth. RESQLINK prevents exclusion through:
            </p>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Twilio SMS Gateway:</strong> Dual-channel payload redundancy ensuring alerts succeed without data connectivity.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Zero-Learning Curve UI:</strong> High-contrast touch targets for elderly and differently-abled citizens.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
