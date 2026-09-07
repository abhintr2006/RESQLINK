import React, { useState, useEffect } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../../types';
import {
  ShieldAlert,
  Radio,
  Building2,
  Users,
  ShieldCheck,
  LifeBuoy,
  Clock3,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Activity,
  HeartPulse,
  Stethoscope,
  Ambulance,
} from 'lucide-react';

interface AuthGatewayScreenProps {
  onOpenDPDPModal: () => void;
}

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({ onOpenDPDPModal }) => {
  const {
    login,
    setUserRole,
    setAdminViewTab,
    language,
    setLanguage,
    enterGatewayWithRole,
  } = useResqLink();

  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => {
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchPersona = (role: UserRole) => {
    enterGatewayWithRole(role);
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-safety-orange text-safety-orange-foreground shadow-[0_8px_20px_-8px_var(--color-safety-orange)]">
            <LifeBuoy className="size-5" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-white">
                RESQLINK
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                CAD v2.4
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Emergency Response Network &bull; KSSEM Bengaluru
            </div>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <Clock3 className="size-3.5 text-slate-500" />
            <span className="font-bold text-slate-200">{currentTime}</span>
            <span>IST</span>
          </div>

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-[10px] font-mono font-bold">
            {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  language === lang
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenDPDPModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono font-bold cursor-pointer hover:bg-emerald-900/60 transition"
          >
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>DPDP 2023</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-center space-y-8">
        {/* Title Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            <span className="size-2 rounded-full bg-status-green animate-pulse" />
            <span>SELECT OPERATIONAL TERMINAL &bull; ZERO-FRICTION ACCESS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Autonomous Emergency CAD Gateway
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            Choose your persona below to directly initialize a real-time session. No credential barriers required for live evaluation.
          </p>

          {/* Mode Switcher: 1-Click Personas vs Credential Drawer */}
          <div className="inline-flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner mt-2">
            <button
              onClick={() => setActiveTab('personas')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'personas'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Click Persona Launchers
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'credentials'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Operator Credential Sign-In
            </button>
          </div>
        </div>

        {/* Tab 1: 3 Interactive Persona Cards */}
        {activeTab === 'personas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1: Citizen & Patient */}
            <div className="group rounded-3xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <HeartPulse className="size-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    CITIZEN LIFELINE
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Citizen &amp; Patient Portal
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Designed for citizens in acute medical distress, accident witnesses, and families.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Sub-second One-Tap SOS Trigger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>GPS Location Lock &amp; Triangulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>ABHA Encrypted Digital Health Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Real-Time Inbound Ambulance Map</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchPersona('patient')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <span>ENTER CITIZEN LIFELINE</span>
                <ArrowRight className="size-4" />
              </button>
            </div>

            {/* Persona 2: Admin Superuser CAD */}
            <div className="group rounded-3xl border border-slate-800 hover:border-safety-orange/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-orange-950/40 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-safety-orange text-safety-orange-foreground text-[10px] font-mono font-extrabold uppercase shadow-md">
                RECOMMENDED OPERATOR
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-safety-orange/10 border border-safety-orange/30 flex items-center justify-center text-safety-orange group-hover:scale-110 transition-transform">
                    <Radio className="size-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                    CENTRAL COMMAND
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-safety-orange transition-colors">
                    Central CAD Dispatch Hub
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Designed for municipal dispatch operators, supervisors, and response coordinators.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-safety-orange shrink-0" />
                    <span>Real-time Bengaluru Vector Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-safety-orange shrink-0" />
                    <span>Dynamic Incident Queue with Filters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-safety-orange shrink-0" />
                    <span>Fleet Readiness Meters (ALS / BLS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-safety-orange shrink-0" />
                    <span>EEG Governance &amp; Twilio 2G Failover</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchPersona('admin')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-safety-orange to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                <span>LAUNCH COMMAND CAD</span>
                <ArrowRight className="size-4" />
              </button>
            </div>

            {/* Persona 3: Hospital ER Medical */}
            <div className="group rounded-3xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/40">
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
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Hospital ER Terminal
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Designed for trauma bay medical directors, charge nurses, and ER intake teams.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                    <span>Inbound Ambulance Radar with Live ETA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                    <span>Pre-Arrival Patient Triage &amp; Vitals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                    <span>Real-Time ICU &amp; ER Bed Availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0" />
                    <span>Emergency Department Divert Controls</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchPersona('hospital')}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>ACCESS HOSPITAL TERMINAL</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Credential Drawer (Traditional JWT Login Form) */}
        {activeTab === 'credentials' && (
          <div className="max-w-md mx-auto w-full">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <LockKeyhole className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">OPERATOR AUTHENTICATION</h3>
                    <p className="text-[11px] font-mono text-slate-400">JWT 256-Bit Encrypted Session</p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-status-green animate-pulse" />
              </div>

              {authError && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/50 text-xs text-rose-200 font-mono">
                  {authError}
                </div>
              )}

              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    OPERATOR ID / USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500"
                    placeholder="e.g. admin, hospital, patient"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    ACCESS KEY / PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/90 pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-rose-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN SECURE SESSION'}
                </button>
              </form>

              {/* Fast presets */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  DEMO CREDENTIAL PRESETS:
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left cursor-pointer"
                  >
                    <div className="font-bold text-rose-300">ADMIN</div>
                    <div className="text-[9px] text-slate-500">admin / 123</div>
                  </button>

                  <button
                    onClick={() => { setUsername('hospital'); setPassword('hospital123'); }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left cursor-pointer"
                  >
                    <div className="font-bold text-indigo-300">HOSPITAL</div>
                    <div className="text-[9px] text-slate-500">hosp / 123</div>
                  </button>

                  <button
                    onClick={() => { setUsername('patient'); setPassword('patient123'); }}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left cursor-pointer"
                  >
                    <div className="font-bold text-emerald-300">CITIZEN</div>
                    <div className="text-[9px] text-slate-500">pat / 123</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 text-xs text-slate-500 font-mono text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>K S School of Engineering and Management (KSSEM) Bengaluru</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>UN SDG 3 &amp; 11 Aligned</span>
            <span>&bull;</span>
            <button
              onClick={onOpenDPDPModal}
              className="text-slate-400 hover:text-emerald-400 transition underline cursor-pointer"
            >
              DPDP Act 2023 Notice
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
