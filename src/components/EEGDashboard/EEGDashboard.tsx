import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { EquitySection } from './EquitySection';
import { EfficacySection } from './EfficacySection';
import { GovernanceSection } from './GovernanceSection';
import { AuditLogViewer } from './AuditLogViewer';
import {
  BarChart3,
  Scale,
  Zap,
  ShieldCheck,
  FileText,
  Sparkles,
  Award,
} from 'lucide-react';

export const EEGDashboard: React.FC = () => {
  const { eegMetrics, auditLogs } = useResqLink();
  const [activeSubTab, setActiveSubTab] = useState<'equity' | 'efficacy' | 'governance' | 'logs'>('equity');

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top EEG Framework Header */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white tracking-tight">
                  EQUITY, EFFICACY &amp; GOVERNANCE (EEG) FRAMEWORK
                </h2>
                <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/80">
                  KSSEM RESEARCH &bull; SEC 3.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Citizen-Facing Emergency AI Evaluation &amp; Algorithmic Fairness Engine &bull; Bengaluru Urban
              </p>
            </div>
          </div>

          {/* SDG 3 & 11 Badges */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-rose-950/80 border border-rose-800 rounded-lg text-[10px] font-mono font-bold text-rose-300 flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-rose-400" />
              <span>UN SDG 3: HEALTH</span>
            </div>
            <div className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-800 rounded-lg text-[10px] font-mono font-bold text-indigo-300 flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>UN SDG 11: SMART CITIES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('equity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'equity'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>1. EQUITY (PARITY &amp; LANGUAGE)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('efficacy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'efficacy'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>2. EFFICACY &amp; BENCHMARKS (TABLE 1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('governance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'governance'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>3. GOVERNANCE &amp; ACCOUNTABILITY</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>4. CRYPTOGRAPHIC AUDIT TRAIL ({auditLogs.length})</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="animate-in fade-in duration-150">
        {activeSubTab === 'equity' && <EquitySection metrics={eegMetrics.equity} />}
        {activeSubTab === 'efficacy' && <EfficacySection metrics={eegMetrics.efficacy} />}
        {activeSubTab === 'governance' && <GovernanceSection metrics={eegMetrics.governance} />}
        {activeSubTab === 'logs' && <AuditLogViewer logs={auditLogs} />}
      </div>
    </div>
  );
};
