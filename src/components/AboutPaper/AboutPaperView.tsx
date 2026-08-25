import React from 'react';
import {
  FileText,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  BookOpen,
  Cpu,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const AboutPaperView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Paper Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>KS School of Engineering and Management (KSSEM), Bengaluru</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Corresponding: abhintr13@gmail.com
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            RESQLINK: An AI-Powered Citizen-Centric Emergency Assistance and Dispatch System – Evaluating Equity, Efficacy and Governance in Urban India
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            <strong>Authors:</strong> G Pavan Kumar¹, Ajith G², Amir Rasheed³, Pavan M J⁴ <br />
            <strong>Under the Guidance of:</strong> Nayana H P, MBA (Ph.D), Department of Computer Science and Business Systems, KSSEM Kanakapura Road, Bengaluru 560109 India
          </p>
        </div>

        {/* Abstract Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Abstract Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bengaluru’s emergency-response network struggles with traffic congestion and connectivity dead zones. RESQLINK bridges this gap through an AI-powered mobile web application that captures exact citizen GPS locations, stabilizes coordinates with a dual-reading Location-Lock Safety Protocol, routes to nearest responders, updates a real-time CAD dashboard, and falls back to Twilio SMS when broadband data is unavailable. The paper formalizes the <strong>Equity, Efficacy, and Governance (EEG)</strong> framework to rigorously evaluate emergency AI for urban India in alignment with UN SDG 3, SDG 11, and MeitY AI Guidelines.
          </p>
        </div>
      </div>

      {/* 6 Architectural Components (Section 3.3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            6-Component Core System Architecture (Paper Section 3.3 &amp; 4.1)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-rose-400 block mb-1">1. Client Application Layer</strong>
            <p className="text-slate-300">
              Zero-learning-curve 1-tap SOS trigger with high-contrast UI, multilingual voice prompts (Kannada, Hindi, English), and DPDP Act 2023 compliance.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-indigo-400 block mb-1">2. Geolocation Engine</strong>
            <p className="text-slate-300">
              Acquires phone GPS hardware coordinates with automatic fallback to cellular tower triangulation and WiFi network estimation when GPS is weak.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-amber-400 block mb-1">3. Location-Lock Safety Protocol</strong>
            <p className="text-slate-300">
              Samples multiple consecutive GPS fixes within a strict delta threshold (&lt;15m) before locking, rejecting false triggers from signal jitter.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-emerald-400 block mb-1">4. AI-Assisted Dispatch Engine</strong>
            <p className="text-slate-300">
              Matches nearest available ALS/BLS ambulances based on distance, traffic speed, trauma center ICU capacity, and peripheral ward equity weighting.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-cyan-400 block mb-1">5. Real-Time Status Layer</strong>
            <p className="text-slate-300">
              3-stage status progression (Alerting &rarr; Confirmed &rarr; Dispatched &rarr; En Route) synchronized over WebSocket to citizen and CAD dashboard.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-purple-400 block mb-1">6. Twilio SMS Fallback Channel</strong>
            <p className="text-slate-300">
              Transmits compressed 160-char SMS payloads over GSM 2G towers when mobile data fails, guaranteeing zero-broadband emergency reach.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Citations & Governance References */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Academic References &amp; Governance Grounding
          </h2>
        </div>

        <div className="space-y-2 text-xs text-slate-300 divide-y divide-slate-800/80">
          <p className="pt-2">
            <strong>Jesus et al. (2024):</strong> <em>Detectability of emergency management systems in smart cities under common cause failures.</em> Sensors 24(9). Grounding for dual-channel (Data + SMS) redundancy.
          </p>
          <p className="pt-2">
            <strong>Assoul et al. (2024):</strong> <em>A comprehensive system architecture using field gate arrays technology and edge computing.</em> ParadigmPlus 5(2).
          </p>
          <p className="pt-2">
            <strong>Arora et al. (2026):</strong> <em>Rural–urban digital divide: Evidence from states.</em> Int. J. Finance &amp; Economics. Grounding for 2G SMS accessibility in urban fringe zones.
          </p>
          <p className="pt-2">
            <strong>MeitY Government of India (2025):</strong> <em>India AI governance guidelines: Enabling trusted AI innovation.</em> Grounding for 'Understandable by Design', 'People First', and audit traceability.
          </p>
          <p className="pt-2">
            <strong>DPDP Act (2023):</strong> <em>Digital Personal Data Protection Act, 2023.</em> Grounding for data minimization and ephemeral emergency location tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
