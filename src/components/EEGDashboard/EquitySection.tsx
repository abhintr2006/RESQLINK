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
    <div className="space-y-6">
      {/* Equity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 2G vs 5G Access Parity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Access Parity (2G vs 5G)</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.accessParity2Gvs5G.rate2G}%</span>
            <span className="text-xs text-slate-400">2G Success</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${metrics.accessParity2Gvs5G.rate2G}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            5G Broadband: <strong>{metrics.accessParity2Gvs5G.rate5G}%</strong> • Parity Gap: &lt;2.6%
          </p>
        </div>

        {/* Peripheral Ward Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Outer Ward Coverage</span>
            <MapPin className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.peripheralWardCoverageRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">High Equity</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${metrics.peripheralWardCoverageRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Slum &amp; peri-urban areas like Kanakapura Rd &amp; Kengeri
          </p>
        </div>

        {/* Vulnerable Demographic Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Vulnerable Accessibility</span>
            <HeartHandshake className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.vulnerableUserSuccessRate}%</span>
            <span className="text-xs text-slate-400">1-Tap Completion</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${metrics.vulnerableUserSuccessRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Elderly &amp; motor-impaired users without third-party assistance
          </p>
        </div>

        {/* Affordability Burden */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Citizen Cost Burden</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">₹0.00</span>
            <span className="text-xs text-slate-400">Per SOS Event</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-400">
            Toll-free 108 &amp; Twilio sponsored gateway (100% accessible)
          </p>
        </div>
      </div>

      {/* Language Breakdown & Research Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Multilingual &amp; Literacy Inclusion (Sec. 3.4.1)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Audio + Icon Help</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">ಕನ್ನಡ (Kannada) - Regional Primary</span>
                <span className="text-white font-mono">{metrics.multiLanguageUsagePct.kn}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${metrics.multiLanguageUsagePct.kn}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">English - Urban Cosmopolitan</span>
                <span className="text-white font-mono">{metrics.multiLanguageUsagePct.en}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${metrics.multiLanguageUsagePct.en}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">हिन्दी (Hindi) - Migrant Workforce</span>
                <span className="text-white font-mono">{metrics.multiLanguageUsagePct.hi}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${metrics.multiLanguageUsagePct.hi}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Digital Divide Mitigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Digital Divide Mitigation (Arora et al. 2026)
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In urban India, ~25% of mobile users rely on 2G feature phones or spotty bandwidth. RESQLINK prevents exclusion through:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Twilio SMS Gateway:</strong> Dual-channel redundancy so emergency alerts succeed without broadband.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Zero-Learning Curve UI:</strong> Big high-contrast touch targets for elderly and differently-abled citizens.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
