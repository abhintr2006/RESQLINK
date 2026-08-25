import React from 'react';
import { ShieldCheck, Lock, Trash2, Check, X, FileCheck2 } from 'lucide-react';

interface DPDPNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DPDPNoticeModal: React.FC<DPDPNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                DPDP Act 2023 &amp; AI Governance Compliance
              </h3>
              <p className="text-[11px] text-emerald-300">
                MeitY ‘Understandable by Design’ &amp; ‘People First’ Notice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            In strict adherence to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>MeitY National AI Governance Guidelines (2025)</strong>, RESQLINK protects citizen privacy in emergency situations:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Strict Data Minimization</strong>
                <span>Only real-time GPS coordinates and the chosen emergency type are processed. No background continuous tracking or contact book access occurs.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Ephemeral Retention &amp; Automatic Purging</strong>
                <span>Active location telemetry is retained strictly for the duration of the emergency dispatch and post-incident audit, then cryptographically purged.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <FileCheck2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Auditable Cryptographic Chain</strong>
                <span>Every dispatch decision is written to an immutable, timestamped event log enabling institutional accountability without exposing sensitive medical records.</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px]">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero-barrier access: No complex multi-page legalese to accept during a life-threatening moment.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            Acknowledge &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
