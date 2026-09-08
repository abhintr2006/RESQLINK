import React, { useEffect, useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../../types';
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
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AuthGatewayScreenProps {
  onOpenDPDPModal: () => void;
}

type Persona = {
  role: UserRole;
  label: string;
  title: string;
  description: string;
  action: string;
  icon: typeof Radio;
  accent: 'primary';
  capabilities: string[];
};

const personas: Persona[] = [
  {
    role: 'admin',
    label: 'Dispatch team',
    title: 'Coordinate response',
    description: 'For dispatchers and supervisors managing incidents, units and hospital routing.',
    action: 'Open dispatch workspace',
    icon: Radio,
    accent: 'primary',
    capabilities: ['Live operations map', 'Incident triage', 'Fleet and hospital readiness'],
  },
  {
    role: 'hospital',
    label: 'Hospital team',
    title: 'Prepare care',
    description: 'For emergency departments receiving inbound ambulances and managing capacity.',
    action: 'Open hospital workspace',
    icon: Building2,
    accent: 'primary',
    capabilities: ['Inbound ambulance radar', 'Pre-arrival triage', 'Capacity and diversion controls'],
  },
  {
    role: 'patient',
    label: 'Citizen or patient',
    title: 'Request help',
    description: 'For people requesting emergency assistance, sharing location and tracking a response.',
    action: 'Open citizen lifeline',
    icon: HeartPulse,
    accent: 'primary',
    capabilities: ['One-tap SOS', 'Location sharing', 'Response status updates'],
  },
];

const accentClasses = {
  primary: {
    icon: 'bg-orange-50 text-orange-700 border-orange-200',
    rule: 'bg-orange-500',
    action: 'bg-slate-900 hover:bg-slate-800',
    label: 'text-orange-700',
  },
};

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({ onOpenDPDPModal }) => {
  const { login, language, setLanguage, enterGatewayWithRole } = useResqLink();
  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalPanel, setLegalPanel] = useState<'terms' | 'privacy' | 'cookies' | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })), 1000);
    return () => clearInterval(timer);
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
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[10px] font-bold">
              {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => <button key={lang} onClick={() => setLanguage(lang)} className={`rounded px-2 py-1 cursor-pointer ${language === lang ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-900'}`}>{lang.toUpperCase()}</button>)}
            </div>
            <button onClick={onOpenDPDPModal} className="hidden items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 md:flex cursor-pointer"><ShieldCheck className="size-3.5" /> DPDP notice</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-125px)] max-w-[1400px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8 lg:py-14">
        <section className="max-w-xl">
          <h1 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl">Start in the workspace that matches your role.</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">RESQLINK connects the people who request help with the teams who coordinate and deliver it. Choose a workspace to explore the response journey.</p>
          <div className="mt-8 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3 lg:grid-cols-1">
            <GatewayPrinciple icon={<Radio className="size-4" />} title="Coordinate" detail="Dispatch teams see the whole response network." />
            <GatewayPrinciple icon={<Building2 className="size-4" />} title="Prepare" detail="Hospitals receive the right information early." />
            <GatewayPrinciple icon={<Users className="size-4" />} title="Request help" detail="Citizens get a clear, guided emergency path." />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(23,32,51,0.35)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Access workspace</div><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">How will you use RESQLINK?</h2></div>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold"><button onClick={() => setActiveTab('personas')} className={`rounded-md px-3 py-2 cursor-pointer ${activeTab === 'personas' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Choose role</button><button onClick={() => setActiveTab('credentials')} className={`rounded-md px-3 py-2 cursor-pointer ${activeTab === 'credentials' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Sign in</button></div>
          </div>

          {activeTab === 'personas' ? <div className="divide-y divide-slate-200">
            {personas.map((persona) => {
              const Icon = persona.icon;
              const styles = accentClasses[persona.accent];
              return <article key={persona.role} className="group relative grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className={`flex size-11 items-center justify-center rounded-xl border ${styles.icon}`}><Icon className="size-5" /></div>
                <div className="min-w-0"><div className={`text-[10px] font-bold uppercase tracking-[0.12em] ${styles.label}`}>{persona.label}</div><h3 className="mt-1 text-lg font-bold text-slate-950">{persona.title}</h3><p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{persona.description}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">{persona.capabilities.map((capability) => <span key={capability} className="inline-flex items-center gap-1"><Check className={`size-3 ${styles.label}`} />{capability}</span>)}</div></div>
                <button onClick={() => enterGatewayWithRole(persona.role)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer ${styles.action}`}><span className="sm:hidden">Open</span><span className="hidden sm:inline">{persona.action}</span><ArrowRight className="size-3.5" /></button>
              </article>;
            })}
          </div> : <div className="mx-auto max-w-md py-5">
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-white"><LockKeyhole className="size-4" /></div><div><div className="text-sm font-bold text-slate-900">Operator sign in</div><p className="mt-0.5 text-xs text-slate-500">Use a demo account to enter a workspace.</p></div></div>
            {authError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{authError}</div>}
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div><label htmlFor="gateway-username" className="mb-1.5 block text-xs font-bold text-slate-700">Username</label><input id="gateway-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} required className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100" /></div>
              <div><label htmlFor="gateway-password" className="mb-1.5 block text-xs font-bold text-slate-700">Password</label><div className="relative"><input id="gateway-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:text-slate-900 cursor-pointer" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer">{isSubmitting ? 'Signing in…' : 'Sign in to workspace'}<ArrowRight className="size-4" /></button>
            </form>
            <div className="mt-5 border-t border-slate-200 pt-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Demo accounts</div><div className="mt-2 grid grid-cols-3 gap-2">{[['admin', 'admin123'], ['hospital', 'hospital123'], ['patient', 'patient123']].map(([demoUser, demoPassword]) => <button key={demoUser} onClick={() => { setUsername(demoUser); setPassword(demoPassword); }} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-left text-[11px] font-semibold text-slate-700 hover:border-slate-400 cursor-pointer"><div className="capitalize">{demoUser}</div><div className="mt-0.5 font-mono text-[9px] text-slate-500">{demoPassword}</div></button>)}</div></div>
          </div>}
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
          <div><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">Data and trust</h2><div className="mt-3 space-y-2"><button onClick={onOpenDPDPModal} className="block text-left text-xs hover:text-orange-700 hover:underline cursor-pointer">DPDP Act 2023 notice</button><span className="block text-xs text-slate-500">Demo environment</span><span className="block text-xs text-slate-500">Simulated Bengaluru data</span></div></div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">Contact</h2><p className="mt-3 text-xs leading-relaxed text-slate-500">Questions about this demonstration or the project?</p><a href="mailto:abhintr13@gmail.com" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 hover:underline"><span>abhintr13@gmail.com</span><ArrowRight className="size-3.5" /></a></div>
        </div>
      </footer>

      {legalPanel && <LegalNoticePanel kind={legalPanel} onClose={() => setLegalPanel(null)} />}
    </div>
  );
};

function LegalNoticePanel({ kind, onClose }: { kind: 'terms' | 'privacy' | 'cookies'; onClose: () => void }) {
  const content = {
    terms: { title: 'Terms and conditions', body: 'RESQLINK is presented as a demonstration platform. The workflows, records and operational figures shown here are simulated and must not be used to make real emergency, clinical or dispatch decisions.' },
    privacy: { title: 'Privacy policy', body: 'This demonstration uses simulated data. Do not enter real patient identifiers, medical records, location details or other sensitive personal information into this environment.' },
    cookies: { title: 'Cookie policy', body: 'This demonstration may use local browser storage to preserve session and interface state. It does not represent a production cookie or tracking configuration.' },
  }[kind];

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="legal-notice-title" onClick={onClose}><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">RESQLINK notice</div><h2 id="legal-notice-title" className="mt-1 text-xl font-bold text-slate-950">{content.title}</h2></div><button onClick={onClose} className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer" aria-label="Close notice">×</button></div><p className="mt-5 text-sm leading-relaxed text-slate-600">{content.body}</p><button onClick={onClose} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">Close notice</button></div></div>;
}

function GatewayPrinciple({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-start gap-3"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700 shadow-sm ring-1 ring-slate-200">{icon}</div><div><div className="text-sm font-bold text-slate-900">{title}</div><div className="mt-0.5 text-xs leading-relaxed text-slate-500">{detail}</div></div></div>;
}
