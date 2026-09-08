import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  ShieldAlert,
  Radio,
  Building2,
  Users,
  Activity,
  Ambulance,
  Gauge,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  HeartHandshake,
} from 'lucide-react';

export const HomePageView: React.FC = () => {
  const {
    setUserRole,
    setAdminViewTab,
    setActiveAppTab,
    activeAlert,
    hospitals,
    responders,
  } = useResqLink();

  const handleLaunchRole = (role: 'admin' | 'hospital' | 'patient') => {
    setUserRole(role);
    if (role === 'admin') {
      setAdminViewTab('admin');
    }
    setActiveAppTab('dashboard');
  };

  const availableUnits = responders.filter((r) => r.isAvailable).length;
  const totalBeds = hospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

  return (
    <div className="public-overview max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="public-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        {/* Glow gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-100/70 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-100/70 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-[11px] font-mono font-bold text-amber-300 shadow-sm">
            <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
            <span>DEMO ENVIRONMENT • BENGALURU RESPONSE NETWORK • KSSEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            One response network for the moment help is needed.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
            RESQLINK connects citizens, dispatch teams, ambulances and trauma centres in one workflow. This interactive overview uses simulated Bengaluru data for demonstration.
          </p>

          {/* Quick Launch Role Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleLaunchRole('admin')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Radio className="size-4" />
              <span>LAUNCH ADMIN CAD</span>
              <ArrowRight className="size-3.5 ml-1" />
            </button>

            <button
              onClick={() => handleLaunchRole('hospital')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold font-mono tracking-wide border border-indigo-500/50 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="size-4" />
              <span>HOSPITAL ER TERMINAL</span>
              <ArrowRight className="size-3.5 ml-1" />
            </button>

            <button
              onClick={() => handleLaunchRole('patient')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wide border border-emerald-500/50 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Users className="size-4" />
              <span>CITIZEN LIFELINE SOS</span>
              <ArrowRight className="size-3.5 ml-1" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-status-green">
              <span className="size-2 rounded-full bg-status-green animate-pulse" />
              Demo network status
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              DPDP Act 2023 &amp; MeitY Aligned
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-400" />
              UN SDG 3 &amp; 11 Aligned
            </span>
          </div>
        </div>
      </section>

      {/* Demo snapshot metrics */}
      <section aria-labelledby="demo-snapshot-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">DEMO SNAPSHOT</div>
            <h2 id="demo-snapshot-heading" className="mt-1 text-xl font-bold text-slate-950">What the network can show</h2>
          </div>
          <p className="text-xs text-slate-500">Values below are simulated and may not represent live operations.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between text-safety-orange">
            <div className="size-9 rounded-xl bg-safety-orange/10 flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">DEMO STATUS</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {activeAlert ? '1 ACTIVE' : '0 ACTIVE'}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">Simulated emergency queue</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400">
            <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Ambulance className="size-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">DEMO FLEET</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {availableUnits} / {responders.length}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">Available ALS/BLS units in demo</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">DEMO CAPACITY</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {totalBeds} BEDS
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">Across simulated trauma centres</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Gauge className="size-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">DEMO RESPONSE</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            &lt; 08:45
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">Illustrative Bengaluru arrival time</div>
        </div>
        </div>
      </section>

      {/* 3 User Perspectives Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
              TRIPARTITE ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mt-1">
              Select Your Operational Portal
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-md">
            RESQLINK unifies the emergency response lifecycle. Each portal is tailored with specialized controls, real-time sync, and end-to-end audit logging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Admin Superuser */}
          <div className="group relative rounded-3xl border border-slate-800 hover:border-rose-500/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Radio className="size-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  COMMAND CAD
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  Central CAD Dispatch
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Superuser emergency command hub. Oversees metropolitan fleet dispatch, dynamic incident queues, EEG equity metrics, and 2G Twilio failover protocol.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-rose-400 shrink-0" />
                  <span>Real-time vector response map</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-rose-400 shrink-0" />
                  <span>Sub-second AI unit assignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-rose-400 shrink-0" />
                  <span>EEG Governance &amp; Audit Trail</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleLaunchRole('admin')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          {/* Card 2: Hospital ER */}
          <div className="group relative rounded-3xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Building2 className="size-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  TRAUMA BAY
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Hospital ER Terminal
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Terminal for emergency department teams. Provides live inbound ambulance radar with arrival countdowns, pre-arrival patient triage, and ER bed availability tracking.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                  <span>Pre-arrival vitals &amp; triage preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                  <span>Real-time ICU/ER bed manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                  <span>Inbound radar with dynamic ETA</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleLaunchRole('hospital')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <span>ACCESS ER TERMINAL</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          {/* Card 3: Citizen / Patient */}
          <div className="group relative rounded-3xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="size-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CITIZEN SOS
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Citizen Emergency Lifeline
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Patient-facing emergency lifesaver. Instant 1-tap emergency dispatch with GPS lock, ABHA digital health card sharing, emergency contact notifications, and AI first aid.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span>One-Tap SOS with Location Lock</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span>ABHA Encrypted Health Card</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span>Nearby trauma facility directory</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleLaunchRole('patient')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <span>OPEN CITIZEN LIFELINE</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Response Map Preview & Tech Highlights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-[10px] font-mono font-bold text-indigo-300">
            <Zap className="size-3 text-amber-400" />
            <span>GEO-SPATIAL DISPATCH ENGINE</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Bengaluru Urban Response Grid
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Real-time geospatial vector mapping of ambulance positions, active triage calls, and hospital capacities across Koramangala, Indiranagar, Whitefield, HSR Layout, and Jayanagar.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px]">TRAFFIC ROUTING</div>
              <div className="text-emerald-400 font-bold mt-1">Live Congestion Factor</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px]">FAILOVER PROTOCOL</div>
              <div className="text-amber-400 font-bold mt-1">Twilio 2G SMS Active</div>
            </div>
          </div>
        </div>

        {/* Tactical SVG Map Illustration */}
        <div className="relative h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16]">
          <svg viewBox="0 0 900 490" className="absolute inset-0 h-full w-full">
            <rect width="900" height="490" fill="#090d16" />
            <g className="fill-none stroke-slate-800" strokeWidth="12" strokeLinecap="round">
              <path d="M-40 70 C160 120 280 35 470 115 S730 240 940 160" />
              <path d="M-20 410 C160 350 300 420 420 315 S650 260 920 350" />
              <path d="M120 -30 C170 100 250 150 220 280 S270 420 320 520" />
              <path d="M625 -20 C590 130 690 170 625 290 S700 430 680 520" />
            </g>
            <g className="fill-none stroke-slate-900" strokeWidth="5" strokeLinecap="round">
              <path d="M-20 190 C180 160 285 220 440 200 S700 80 930 95" />
              <path d="M40 300 C220 280 320 330 500 255 S690 220 930 260" />
              <path d="M405 -20 C370 90 420 150 390 250 S430 380 410 520" />
              <path d="M790 -20 C730 105 800 180 760 300 S820 430 790 520" />
            </g>
            <g className="fill-none stroke-amber-500" strokeWidth="3" strokeDasharray="7 8">
              <path d="M495 265 L360 333" />
              <path d="M495 265 L630 127" />
            </g>
            <g className="fill-slate-500 text-[12px] font-mono font-bold">
              <text x="88" y="76">Rajajinagar</text>
              <text x="542" y="82">Indiranagar</text>
              <text x="334" y="232">Koramangala</text>
              <text x="122" y="365">Jayanagar</text>
              <text x="730" y="318">Whitefield</text>
              <text x="480" y="455">Bengaluru Response Grid</text>
            </g>

            {/* Incidents */}
            <circle cx="55%" cy="54%" r="14" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="55%" cy="54%" r="6" fill="#f43f5e" />
            <circle cx="70%" cy="26%" r="12" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="2" />
            <circle cx="70%" cy="26%" r="6" fill="#eab308" />

            {/* Units */}
            {[{ x: 62, y: 42 }, { x: 34, y: 40 }, { x: 48, y: 78 }].map((u, i) => (
              <g key={i}>
                <circle cx={`${u.x}%`} cy={`${u.y}%`} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}

            {/* Hospitals */}
            {[{ x: 52, y: 30 }, { x: 80, y: 38 }, { x: 28, y: 76 }].map((h, i) => (
              <g key={i}>
                <rect x={`${h.x * 9 - 6}`} y={`${h.y * 4.9 - 6}`} width="12" height="12" rx="2" fill="#10b981" />
                <path d={`M${h.x * 9 - 3} ${h.y * 4.9} h6 M${h.x * 9} ${h.y * 4.9 - 3} v6`} stroke="#ffffff" strokeWidth="1.5" />
              </g>
            ))}
          </svg>

          {/* Map legend */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Critical Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>Active Ambulance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded bg-emerald-500" />
              <span>Trauma Facility</span>
            </div>
          </div>
        </div>
      </section>

      {/* Governance & Academic Footer Section */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">K S School of Engineering and Management</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                KSSEM Bengaluru
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Department of Computer Science &amp; Engineering &bull; Autonomous Emergency CAD Laboratory
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="size-4" />
              DPDP Act 2023 Compliant
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <HeartHandshake className="size-4" />
              UN SDG 3 &amp; 11 Aligned
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
          RESQLINK is an end-to-end urban emergency dispatch framework engineered to minimize emergency response latency across high-density metro centers. Designed with cryptographic audit trails, EEG equity distribution metrics, and GSM fallback for mission-critical reliability.
        </p>
      </section>
    </div>
  );
};
