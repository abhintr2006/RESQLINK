import React, { useEffect, useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../../types';
import { formatISTTime12h } from '../../utils/timeFormat';
import { useTranslation, INDIAN_LANGUAGES, getLanguageLabel } from '../../i18n';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  HeartPulse,
  Languages,
  LockKeyhole,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react';

interface AuthGatewayScreenProps {
  onOpenDPDPModal: () => void;
}

const roles = [
  { value: 'admin' as UserRole, label: 'Admin / Dispatch', description: 'Command center & live triage', icon: Radio },
  { value: 'hospital' as UserRole, label: 'Hospital ER', description: 'Trauma intake & bed radar', icon: Building2 },
  { value: 'patient' as UserRole, label: 'Citizen Lifeline', description: 'One-tap SOS & first-aid', icon: HeartPulse },
] as const;

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({ onOpenDPDPModal }) => {
  const { login, language, setLanguage, enterGatewayWithRole } = useResqLink();
  const { t } = useTranslation();
  const [role, setRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('dispatch.alpha');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => formatISTTime12h());
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatISTTime12h()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setUsername('dispatch.alpha');
      setPassword('admin123');
    } else if (newRole === 'hospital') {
      setUsername('apollo.er');
      setPassword('hospital123');
    } else {
      setUsername('citizen.user');
      setPassword('citizen123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Enter your operator ID or username');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      enterGatewayWithRole(role);
    } catch {
      // Allow demo sign-in fallback if offline or mock
      enterGatewayWithRole(role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFastTrack = (selectedRole: UserRole) => {
    handleRoleSelect(selectedRole);
    enterGatewayWithRole(selectedRole);
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Utility Bar */}
      <header className="border-b border-slate-800/80 bg-[#0f1422]/90 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="font-display text-base font-black tracking-tight text-white">RESQLINK</span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                Bengaluru Emergency Ops
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live IST Clock */}
            <div className="hidden items-center gap-1.5 border-r border-slate-800 pr-3 text-xs text-slate-400 sm:flex">
              <Clock3 className="size-3.5 text-orange-500" />
              <span className="font-mono font-bold text-slate-200">{currentTime}</span>
              <span className="text-[10px] text-slate-500">IST</span>
            </div>

            {/* 22 Indian Languages Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer shadow-sm"
                title="Pan-India 22 Official Languages"
                aria-label="Select Indian Language"
              >
                <Languages className="size-3.5 text-orange-500" />
                <span className="font-mono text-[10px] text-orange-400">{language.toUpperCase()}</span>
                <ChevronDown className="size-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-800 mb-2 flex items-center justify-between">
                      <span>22 Official Languages + English</span>
                      <Languages className="size-3.5 text-orange-500" />
                    </div>
                    <div className="relative mb-2">
                      <Search className="size-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Search language or script..."
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredLanguages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLanguage(l.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                            language === l.code
                              ? 'bg-orange-600/20 text-orange-400 font-bold border border-orange-500/30'
                              : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500 w-6">{l.code.toUpperCase()}</span>
                            <span className="font-semibold text-slate-100">{l.nativeName}</span>
                            <span className="text-[10px] text-slate-400">({l.name})</span>
                          </div>
                          {language === l.code && <Check className="size-3.5 text-orange-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DPDP Compliance Pill */}
            <button
              onClick={onOpenDPDPModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/40 text-[11px] font-mono font-bold text-emerald-400 hover:bg-emerald-900/40 transition cursor-pointer"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DPDP 2023
            </button>
          </div>
        </div>
      </header>

      {/* Split Main Content */}
      <div className="flex-1 lg:grid lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)]">
        {/* Left Hero Surface */}
        <section className="relative hidden overflow-hidden bg-[#0c101c] p-10 lg:flex lg:flex-col lg:justify-between border-r border-slate-800/80">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] bg-size-[32px_32px]" />
          
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-tight text-white">RESQLINK</div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-orange-400">
                  Emergency Response Network
                </div>
              </div>
            </div>

            <div className="mt-20 max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-mono font-bold text-orange-400 mb-4">
                <span className="size-2 rounded-full bg-orange-500 animate-ping" />
                Bengaluru · Operational Ready
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-white tracking-tight">
                Every second moves someone closer to help.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-slate-400">
                A unified, low-latency coordination layer connecting citizens, ambulance fleet dispatchers, and trauma-care hospital emergency departments across 198 wards.
              </p>
            </div>
          </div>

          <div className="relative border-t border-slate-800 pt-6 space-y-3 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>All subsystems operational</span>
              </span>
              <span className="font-mono text-slate-500 text-[10px]">CAD v2.4</span>
            </div>
            <p className="text-[11px] text-slate-500">
              DPDP Act 2023 encrypted audit logs · Instant GPS location lock · 2G SMS fallback protocol
            </p>
          </div>
        </section>

        {/* Right Sign-in Panel */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-[#090d16]">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-500 mb-2">
                <LockKeyhole className="size-3.5" /> Operator Gateway
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">
                Access Terminal
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Select your designated role to load corresponding telemetry, radar maps, and dispatch controls.
              </p>
            </div>

            {/* Role Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Select Operating Persona
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleRoleSelect(item.value)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-600/10 ring-1 ring-orange-500/50 text-white'
                          : 'border-slate-800 bg-[#0f1422] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`size-4 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                        {isSelected && <span className="size-1.5 rounded-full bg-orange-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-username">
                  Operator ID / Call Sign
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-11 w-full rounded-xl border border-slate-800 bg-[#0f1422] pl-10 pr-3 font-mono text-xs text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="e.g. dispatch.alpha"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-password">
                  Security Token / Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-slate-800 bg-[#0f1422] pl-10 pr-11 text-xs text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter credentials"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Authenticating Station…' : 'Enter Workspace'}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>

            {/* Fast Track Quick Demos */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                <span>Fast-Track Instant Demo Access</span>
                <Zap className="size-3 text-amber-400" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFastTrack('admin')}
                  className="px-2.5 py-2 rounded-lg border border-slate-800 bg-[#0f1422] hover:border-orange-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer text-center"
                >
                  Demo Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => handleFastTrack('hospital')}
                  className="px-2.5 py-2 rounded-lg border border-slate-800 bg-[#0f1422] hover:border-orange-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer text-center"
                >
                  Demo Hospital
                </button>
                <button
                  type="button"
                  onClick={() => handleFastTrack('patient')}
                  className="px-2.5 py-2 rounded-lg border border-slate-800 bg-[#0f1422] hover:border-orange-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer text-center"
                >
                  Demo Citizen
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
