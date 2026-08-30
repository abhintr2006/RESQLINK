import React from 'react';
import { ShieldCheck, Lock, Trash2, Check, X, FileCheck2, ShieldAlert } from 'lucide-react';

interface DPDPNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DPDPNoticeModal: React.FC<DPDPNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="double-bezel max-w-lg w-full shadow-2xl">
        <div className="double-bezel-inner overflow-hidden">
          {/* Modal Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                  DPDP ACT 2023 &bull; AI GOVERNANCE COMPLIANCE
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">
                  MeitY &lsquo;Understandable by Design&rsquo; Statutory Notice
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3.5 text-xs text-slate-300">
            <p className="leading-relaxed font-sans text-slate-300">
              In strict adherence to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>MeitY National AI Governance Guidelines (2025)</strong>, RESQLINK protects citizen privacy in emergency situations:
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-xs font-mono mb-0.5">1. STRICT DATA MINIMIZATION</strong>
                  <span className="text-[11px] text-slate-400">Only real-time GPS coordinates and chosen emergency type are processed. Zero background telemetry or contact harvesting.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-xs font-mono mb-0.5">2. EPHEMERAL RETENTION &amp; PURGING</strong>
                  <span className="text-[11px] text-slate-400">Live GPS tracking stream is active strictly during dispatch, then cryptographically archived into an anonymized ledger.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-xs font-mono mb-0.5">3. AUDITABLE SHA-256 IMMUTABLE LEDGER</strong>
                  <span className="text-[11px] text-slate-400">Every dispatch score and responder assignment is sealed with SHA-256 hashes for equity audits without exposing PII.</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/80 p-2.5 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px] font-mono">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-barrier access: No multi-page legal roadblocks during emergency crisis.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              ACKNOWLEDGE &amp; PROCEED
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
