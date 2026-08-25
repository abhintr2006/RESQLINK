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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top EEG Framework Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Equity, Efficacy &amp; Governance (EEG) Framework
              </h2>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-mono">
                Section 3.4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Citizen-Facing Emergency AI Evaluation System • Tailored for Urban India &amp; Bengaluru
            </p>
          </div>
        </div>

        {/* SDG 3 & 11 Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 rounded-xl text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-rose-400" />
            <span>UN SDG 3: Good Health</span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-800 rounded-xl text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>UN SDG 11: Smart Cities</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('equity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'equity'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. Equity Indicators (Parity &amp; Language)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('efficacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'efficacy'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Efficacy &amp; Benchmark (Table 1)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('governance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'governance'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Governance &amp; Accountability Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. Cryptographic Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="animate-in fade-in duration-200">
        {activeSubTab === 'equity' && <EquitySection metrics={eegMetrics.equity} />}
        {activeSubTab === 'efficacy' && <EfficacySection metrics={eegMetrics.efficacy} />}
        {activeSubTab === 'governance' && <GovernanceSection metrics={eegMetrics.governance} />}
        {activeSubTab === 'logs' && <AuditLogViewer logs={auditLogs} />}
      </div>
    </div>
  );
};
