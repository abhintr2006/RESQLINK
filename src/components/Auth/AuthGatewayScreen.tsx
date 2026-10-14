import React, { useEffect, useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { UserRole } from '../../types';
import {
  ArrowRight,
  Building2,
  Check,
  Clock3,
  Eye,
  EyeOff,
  HeartPulse,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Phone,
  Radio,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { BENGALURU_HOSPITALS } from '../../data/bengaluruData';
import { SUPPORT_CONTACT } from '../../config/supportContact';
import { COOKIE_INVENTORY, LEGAL_EFFECTIVE_DATE, PRIVACY_SECTIONS, TERMS_SECTIONS } from '../../config/legalContent';
import { LanguageSelector } from '../LanguageSelector';

interface AuthGatewayScreenProps {
  onOpenDPDPModal: () => void;
}

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({ onOpenDPDPModal }) => {
  const { login, signup, gatewayTab, setGatewayTab } = useResqLink();

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup form state
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('patient');
  const [signupHospitalId, setSignupHospitalId] = useState('HOSP-01');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [legalPanel, setLegalPanel] = useState<'terms' | 'privacy' | 'cookies' | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleLegalRequest = (event: Event) => {
      const kind = (event as CustomEvent<'terms' | 'privacy' | 'cookies'>).detail;
      if (kind === 'terms' || kind === 'privacy' || kind === 'cookies') setLegalPanel(kind);
    };
    window.addEventListener('resqlink:open-legal', handleLegalRequest);
    return () => window.removeEventListener('resqlink:open-legal', handleLegalRequest);
  }, []);

  const handleCredentialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignupError('');

    const cleanUsername = signupUsername.trim().toLowerCase();
    const cleanDisplayName = signupDisplayName.trim();

    if (!cleanDisplayName) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setSignupError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setSignupError('Username can only contain letters, numbers, dots, hyphens, and underscores.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsSigningUp(true);
    try {
      await signup({
        username: cleanUsername,
        password: signupPassword,
        displayName: cleanDisplayName,
        role: signupRole,
        hospitalId: signupRole === 'hospital' ? signupHospitalId : null,
      });
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172033] font-sans selection:bg-orange-200">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-600 text-white">
              <LifeBuoy className="size-5" strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-2"><span className="font-display text-base font-bold tracking-tight">RESQLINK</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Demo</span></div>
              <div className="text-[10px] text-slate-500">Emergency response network · Bengaluru</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><Clock3 className="size-3.5" /><span className="font-mono font-semibold text-slate-700">{currentTime}</span><span>IST</span></div>
            <LanguageSelector compact />
            <button onClick={onOpenDPDPModal} className="hidden items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 md:flex cursor-pointer"><ShieldCheck className="size-3.5" /> DPDP notice</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-125px)] max-w-[1400px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8 lg:py-14">
        <section className="max-w-xl">
          <h1 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Secure Access to Emergency Operations.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
            Sign in to access your designated emergency response dashboard, or register a new account. Your account role strictly determines your dashboard workspace.
          </p>
          <div className="mt-8 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3 lg:grid-cols-1">
            <GatewayPrinciple icon={<Radio className="size-4" />} title="Central Dispatch CAD" detail="Authorized dispatchers coordinate metropolitan ambulances and response routing." />
            <GatewayPrinciple icon={<Building2 className="size-4" />} title="Hospital Trauma Center" detail="Emergency departments track incoming ambulances and prepare trauma bays." />
            <GatewayPrinciple icon={<Users className="size-4" />} title="Citizen Lifeline" detail="Citizens trigger SOS requests and track live responder ETA." />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(23,32,51,0.35)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Access workspace</div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {gatewayTab === 'signup' ? 'Create an account' : 'Sign in to your account'}
              </h2>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              <button
                onClick={() => setGatewayTab('credentials')}
                className={`rounded-md px-4 py-2 cursor-pointer transition ${
                  gatewayTab === 'credentials' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setGatewayTab('signup')}
                className={`rounded-md px-4 py-2 cursor-pointer transition ${
                  gatewayTab === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          {gatewayTab === 'credentials' && (
            <div className="mx-auto max-w-md py-5">
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-white shrink-0">
                  <LockKeyhole className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Operator sign in</div>
                  <p className="mt-0.5 text-xs text-slate-500">Sign in with an existing account or demo profile.</p>
                </div>
              </div>

              {authError && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {authError}
                </div>
              )}

              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <label htmlFor="gateway-username" className="mb-1.5 block text-xs font-bold text-slate-700">Username</label>
                  <input
                    id="gateway-username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label htmlFor="gateway-password" className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      id="gateway-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition cursor-pointer"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in to workspace'}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-4 text-center">
                <span className="text-xs text-slate-500">Need a personal account? </span>
                <button
                  type="button"
                  onClick={() => setGatewayTab('signup')}
                  className="text-xs font-bold text-orange-700 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Demo accounts</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ['admin', 'admin123'],
                    ['hospital', 'hospital123'],
                    ['patient', 'patient123'],
                  ].map(([demoUser, demoPassword]) => (
                    <button
                      key={demoUser}
                      type="button"
                      onClick={() => {
                        setUsername(demoUser);
                        setPassword(demoPassword);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-left text-[11px] font-semibold text-slate-700 hover:border-slate-400 cursor-pointer transition"
                    >
                      <div className="capitalize">{demoUser}</div>
                      <div className="mt-0.5 font-mono text-[9px] text-slate-500">{demoPassword}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gatewayTab === 'signup' && (
            <div className="mx-auto max-w-md py-4">
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-orange-600 text-white shrink-0">
                  <UserPlus className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Create new account</div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Register with RESQLINK to save your personal profile, credentials, and access role in the database.
                  </p>
                </div>
              </div>

              {signupError && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupDisplayName}
                    onChange={(event) => setSignupDisplayName(event.target.value)}
                    placeholder="e.g. Ramesh Kumar or Dr. Ananya"
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="signup-username" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Username
                  </label>
                  <input
                    id="signup-username"
                    type="text"
                    value={signupUsername}
                    onChange={(event) => setSignupUsername(event.target.value)}
                    placeholder="e.g. ramesh_k"
                    autoComplete="username"
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">At least 3 characters. Letters, numbers, dots, and hyphens.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'patient' as const, label: 'Citizen', desc: 'Emergency SOS' },
                      { role: 'hospital' as const, label: 'Hospital', desc: 'ER & Beds' },
                      { role: 'admin' as const, label: 'Dispatcher', desc: 'CAD Terminal' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSignupRole(item.role)}
                        className={`rounded-lg border p-2 text-left transition cursor-pointer ${
                          signupRole === item.role
                            ? 'border-orange-600 bg-orange-50/60 ring-1 ring-orange-600'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {signupRole === 'hospital' && (
                  <div>
                    <label htmlFor="signup-hospital" className="mb-1.5 block text-xs font-bold text-slate-700">
                      Assigned Hospital Facility
                    </label>
                    <select
                      id="signup-hospital"
                      value={signupHospitalId}
                      onChange={(event) => setSignupHospitalId(event.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    >
                      {BENGALURU_HOSPITALS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.area})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="signup-password" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-confirm-password" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(event) => setSignupConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60 transition cursor-pointer"
                >
                  {isSigningUp ? 'Creating account…' : 'Create account & enter workspace'}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-5 border-t border-slate-200 pt-4 text-center">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setGatewayTab('credentials')}
                  className="text-xs font-bold text-orange-700 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-slate-950"><div className="flex size-7 items-center justify-center rounded-md bg-orange-600 text-white"><LifeBuoy className="size-4" /></div><span className="font-display font-bold">RESQLINK</span></div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">A demonstration emergency response network connecting citizens, dispatch teams and hospitals across Bengaluru.</p>
            <p className="mt-4 text-[11px] text-slate-400">© 2026 KS School of Engineering and Management</p>
          </div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">Legal</h2><div className="mt-3 space-y-2"><button onClick={() => setLegalPanel('terms')} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">Terms and conditions</button><button onClick={() => setLegalPanel('privacy')} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">Privacy policy</button><button onClick={() => setLegalPanel('cookies')} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">Cookie policy</button></div></div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">Data and trust</h2><div className="mt-3 space-y-2"><button onClick={onOpenDPDPModal} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">DPDP Act 2023 notice</button><button onClick={() => window.dispatchEvent(new Event('resqlink:open-cookie-settings'))} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">Cookie Settings / Privacy Preferences</button><span className="block text-xs text-slate-500">Demo environment</span><span className="block text-xs text-slate-500">Simulated Bengaluru data</span></div></div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">RESQLINK Support</h2><p className="mt-3 text-xs leading-relaxed text-slate-500">Questions about this demonstration or the project?</p><div className="mt-2 space-y-2"><a href={SUPPORT_CONTACT.emailUri} className="flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 hover:underline"><Mail className="size-3.5" /><span>{SUPPORT_CONTACT.email}</span></a><a href={SUPPORT_CONTACT.phoneUri} className="flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 hover:underline"><Phone className="size-3.5" /><span>{SUPPORT_CONTACT.phoneDisplay}</span></a></div></div>
        </div>
      </footer>

      {legalPanel && <LegalNoticePanel kind={legalPanel} onClose={() => setLegalPanel(null)} />}
    </div>
  );
};

function LegalNoticePanel({ kind, onClose }: { kind: 'terms' | 'privacy' | 'cookies'; onClose: () => void }) {
  const title = kind === 'terms' ? 'Terms and conditions' : kind === 'privacy' ? 'Privacy policy' : 'Cookie policy';
  const sections = kind === 'terms' ? TERMS_SECTIONS : kind === 'privacy' ? PRIVACY_SECTIONS : COOKIE_INVENTORY;

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="legal-notice-title" onClick={onClose}>
    <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">RESQLINK notice · effective {LEGAL_EFFECTIVE_DATE}</div><h2 id="legal-notice-title" className="mt-1 text-xl font-bold text-slate-950">{title}</h2></div><button onClick={onClose} className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer" aria-label="Close notice">×</button></div>
      {kind === 'terms' && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">RESQLINK is presented as a demonstration platform. The workflows, records and operational figures shown here are simulated and must not be used to make real emergency, clinical or dispatch decisions.</p>}
      {kind === 'privacy' && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">This demonstration uses simulated data in several areas. Do not enter real patient identifiers, medical records, location details, or other sensitive personal information into this environment.</p>}
      {kind === 'cookies' && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">RESQLINK does not use application-set browser cookies in the inspected code. It uses limited local storage and a static PWA cache described below; no analytics or advertising trackers were found.</p>}
      <div className="mt-5 space-y-4">{sections.map(([heading, body]) => <section key={heading} className="border-b border-slate-100 pb-4 last:border-0"><h3 className="text-sm font-bold text-slate-950">{heading}</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p></section>)}</div>
      {(kind === 'terms' || kind === 'privacy') && <section className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4" aria-labelledby="support-heading"><h3 id="support-heading" className="text-sm font-bold text-slate-950">Contact &amp; Support</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">For support or privacy-related requests, contact RESQLINK Support:</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><a href={SUPPORT_CONTACT.emailUri} className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100 hover:underline"><Mail className="size-3.5 shrink-0" /><span className="truncate">{SUPPORT_CONTACT.email}</span></a><a href={SUPPORT_CONTACT.phoneUri} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100 hover:underline"><Phone className="size-3.5 shrink-0" /><span>{SUPPORT_CONTACT.phoneDisplay}</span></a></div></section>}
      <button onClick={onClose} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">Close notice</button>
    </div>
  </div>;
}

function GatewayPrinciple({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-start gap-3"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700 shadow-sm ring-1 ring-slate-200">{icon}</div><div><div className="text-sm font-bold text-slate-900">{title}</div><div className="mt-0.5 text-xs leading-relaxed text-slate-500">{detail}</div></div></div>;
}
