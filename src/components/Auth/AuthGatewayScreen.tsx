import React, { useEffect, useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { LanguageCode, UserRole } from '../../types';
import { formatISTTime12h } from '../../utils/timeFormat';
import { useTranslation, INDIAN_LANGUAGES } from '../../i18n';
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
  LifeBuoy,
  LockKeyhole,
  Moon,
  Radio,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';

interface AuthGatewayScreenProps {
  onOpenDPDPModal: () => void;
}

const accentClasses = {
  primary: {
    icon: 'bg-orange-50 text-orange-700 border-orange-200',
    rule: 'bg-orange-500',
    action: 'bg-slate-900 hover:bg-slate-800',
    label: 'text-orange-700',
  },
};

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({ onOpenDPDPModal }) => {
  const { login, language, setLanguage, enterGatewayWithRole, theme, toggleTheme } = useResqLink();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalPanel, setLegalPanel] = useState<'terms' | 'privacy' | 'cookies' | null>(null);
  const [currentTime, setCurrentTime] = useState(() => formatISTTime12h());
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatISTTime12h()), 1000);
    return () => clearInterval(timer);
  }, []);

  const personas = [
    {
      role: 'admin' as UserRole,
      label: t('gateway.dispatch_team', 'Dispatch team'),
      title: t('gateway.coordinate_response', 'Coordinate response'),
      description: t('gateway.dispatch_desc', 'For dispatchers and supervisors managing incidents, units and hospital routing.'),
      action: t('gateway.open_dispatch', 'Open dispatch workspace'),
      icon: Radio,
      accent: 'primary' as const,
      capabilities: [
        t('gateway.cap_live_ops', 'Live operations map'),
        t('gateway.cap_triage', 'Incident triage'),
        t('gateway.cap_readiness', 'Fleet and hospital readiness'),
      ],
    },
    {
      role: 'hospital' as UserRole,
      label: t('gateway.hospital_team', 'Hospital team'),
      title: t('gateway.prepare_care', 'Prepare care'),
      description: t('gateway.hospital_desc', 'For emergency departments receiving inbound ambulances and managing capacity.'),
      action: t('gateway.open_hospital', 'Open hospital workspace'),
      icon: Building2,
      accent: 'primary' as const,
      capabilities: [
        t('gateway.cap_radar', 'Inbound ambulance radar'),
        t('gateway.cap_pre_arrival', 'Pre-arrival triage'),
        t('gateway.cap_capacity', 'Capacity and diversion controls'),
      ],
    },
    {
      role: 'patient' as UserRole,
      label: t('gateway.citizen_patient', 'Citizen or patient'),
      title: t('gateway.request_help', 'Request help'),
      description: t('gateway.citizen_desc', 'For people requesting emergency assistance, sharing location and tracking a response.'),
      action: t('gateway.open_citizen', 'Open citizen lifeline'),
      icon: HeartPulse,
      accent: 'primary' as const,
      capabilities: [
        t('gateway.cap_one_tap_sos', 'One-tap SOS'),
        t('gateway.cap_location_sharing', 'Location sharing'),
        t('gateway.cap_status_updates', 'Response status updates'),
      ],
    },
  ];

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
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#090d16] text-[#172033] dark:text-[#f8fafc] font-sans selection:bg-orange-200 dark:selection:bg-orange-950 transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1422] transition-colors duration-200">
        <div className="mx-auto flex min-h-[68px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <LifeBuoy className="size-5" strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">RESQLINK</span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Demo</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Emergency response network · Bengaluru</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex">
              <Clock3 className="size-3.5" />
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{currentTime}</span>
            </div>

            {/* Language Switcher: Quick Pills + 23 Indian Languages Dropdown */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5 text-[10px] font-bold shadow-xs">
                {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`rounded-md px-2 py-1 cursor-pointer transition ${
                      language === lang
                        ? 'bg-slate-900 dark:bg-orange-600 text-white font-extrabold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  title={t('nav.select_language', 'Select Language')}
                  aria-label="Select Indian Language"
                >
                  <Languages className="size-3.5 text-orange-600 dark:text-orange-500" />
                  <span className="hidden sm:inline font-mono text-[10px]">{language.toUpperCase()}</span>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>

                {isLangDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10">
                      <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-800 mb-1 flex items-center justify-between">
                        <span>Pan-India Languages (23)</span>
                        <Languages className="size-3 text-orange-500" />
                      </div>
                      {INDIAN_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-left transition cursor-pointer ${
                            language === lang.code
                              ? 'bg-orange-600/20 text-orange-400 font-bold border border-orange-500/30'
                              : 'hover:bg-slate-800 text-slate-200 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 w-6">{lang.code.toUpperCase()}</span>
                            <div>
                              <span className="font-semibold text-slate-100">{lang.nativeName}</span>
                              <span className="ml-1 text-[10px] text-slate-400">({lang.name})</span>
                            </div>
                          </div>
                          {language === lang.code && <Check className="size-3.5 text-orange-500" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center size-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              title={theme === 'dark' ? t('theme.light_mode', 'Switch to Light Mode') : t('theme.dark_mode', 'Switch to Dark Mode')}
              aria-label={t('theme.toggle', 'Toggle Theme')}
            >
              {theme === 'dark' ? (
                <Sun className="size-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="size-4 text-slate-600 animate-in spin-in-180 duration-300" />
              )}
            </button>

            <button
              onClick={onOpenDPDPModal}
              className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 md:flex cursor-pointer transition"
            >
              <ShieldCheck className="size-3.5" />
              <span>{t('gateway.dpdp_notice', 'DPDP notice')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-125px)] max-w-[1400px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8 lg:py-14">
        <section className="max-w-xl">
          <h1 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl">
            {t('gateway.headline', 'Start in the workspace that matches your role.')}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {t('gateway.subheadline', 'RESQLINK connects the people who request help with the teams who coordinate and deliver it. Choose a workspace to explore the response journey.')}
          </p>
          <div className="mt-8 grid gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 sm:grid-cols-3 lg:grid-cols-1">
            <GatewayPrinciple
              icon={<Radio className="size-4" />}
              title={t('gateway.principle_coord_title', 'Coordinate')}
              detail={t('gateway.principle_coord_desc', 'Dispatch teams see the whole response network.')}
            />
            <GatewayPrinciple
              icon={<Building2 className="size-4" />}
              title={t('gateway.principle_prep_title', 'Prepare')}
              detail={t('gateway.principle_prep_desc', 'Hospitals receive the right information early.')}
            />
            <GatewayPrinciple
              icon={<Users className="size-4" />}
              title={t('gateway.principle_req_title', 'Request help')}
              detail={t('gateway.principle_req_desc', 'Citizens get a clear, guided emergency path.')}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1422] p-4 shadow-[0_18px_45px_-30px_rgba(23,32,51,0.35)] dark:shadow-none sm:p-6 transition-colors duration-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {t('gateway.access_workspace', 'Access workspace')}
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {t('gateway.how_will_you_use', 'How will you use RESQLINK?')}
              </h2>
            </div>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('personas')}
                className={`rounded-md px-3 py-2 cursor-pointer transition ${
                  activeTab === 'personas'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('gateway.choose_role', 'Choose role')}
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`rounded-md px-3 py-2 cursor-pointer transition ${
                  activeTab === 'credentials'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('gateway.sign_in', 'Sign In')}
              </button>
            </div>
          </div>

          {activeTab === 'personas' ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {personas.map((persona) => {
                const Icon = persona.icon;
                const styles = accentClasses[persona.accent];
                return (
                  <article key={persona.role} className="group relative grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className={`flex size-11 items-center justify-center rounded-xl border dark:bg-orange-950/40 dark:border-orange-800/60 dark:text-orange-400 ${styles.icon}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[10px] font-bold uppercase tracking-[0.12em] dark:text-orange-400 ${styles.label}`}>
                        {persona.label}
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{persona.title}</h3>
                      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{persona.description}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {persona.capabilities.map((capability) => (
                          <span key={capability} className="inline-flex items-center gap-1">
                            <Check className={`size-3 text-orange-600 dark:text-orange-400`} />
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => enterGatewayWithRole(persona.role)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 shadow-sm"
                    >
                      <span className="sm:hidden">{t('common.open', 'Open')}</span>
                      <span className="hidden sm:inline">{persona.action}</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-md py-5">
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-700 text-white">
                  <LockKeyhole className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('gateway.operator_signin', 'Operator sign in')}</div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('gateway.operator_signin_desc', 'Use a demo account to enter a workspace.')}</p>
                </div>
              </div>
              {authError && <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-700 dark:text-red-400">{authError}</div>}
              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <label htmlFor="gateway-username" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <input
                    id="gateway-username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950"
                  />
                </div>
                <div>
                  <label htmlFor="gateway-password" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="gateway-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 pr-10 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-orange-600 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-orange-500 disabled:opacity-60 cursor-pointer transition shadow-sm"
                >
                  {isSubmitting ? 'Signing in…' : t('gateway.signin_btn', 'Sign in to workspace')}
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('gateway.demo_accounts', 'Demo accounts')}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[['admin', 'admin123'], ['hospital', 'hospital123'], ['patient', 'patient123']].map(([demoUser, demoPassword]) => (
                    <button
                      key={demoUser}
                      onClick={() => {
                        setUsername(demoUser);
                        setPassword(demoPassword);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition"
                    >
                      <div className="capitalize">{demoUser}</div>
                      <div className="mt-0.5 font-mono text-[9px] text-slate-500 dark:text-slate-400">{demoPassword}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1422] px-4 py-8 text-sm text-slate-600 dark:text-slate-400 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="mx-auto grid max-w-[1400px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-slate-950 dark:text-white">
              <div className="flex size-7 items-center justify-center rounded-md bg-orange-600 text-white">
                <LifeBuoy className="size-4" />
              </div>
              <span className="font-display font-bold">RESQLINK</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t('gateway.footer_desc', 'A demonstration emergency response network connecting citizens, dispatch teams and hospitals across Bengaluru.')}
            </p>
            <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">© 2026 KS School of Engineering and Management</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-100">{t('gateway.legal', 'Legal')}</h2>
            <div className="mt-3 space-y-2">
              <button onClick={() => setLegalPanel('terms')} className="block text-left text-xs hover:text-orange-700 dark:hover:text-orange-400 hover:underline cursor-pointer">
                {t('gateway.terms', 'Terms and conditions')}
              </button>
              <button onClick={() => setLegalPanel('privacy')} className="block text-left text-xs hover:text-orange-700 dark:hover:text-orange-400 hover:underline cursor-pointer">
                {t('gateway.privacy', 'Privacy policy')}
              </button>
              <button onClick={() => setLegalPanel('cookies')} className="block text-left text-xs hover:text-orange-700 dark:hover:text-orange-400 hover:underline cursor-pointer">
                {t('gateway.cookies', 'Cookie policy')}
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-100">{t('gateway.data_trust', 'Data and trust')}</h2>
            <div className="mt-3 space-y-2">
              <button onClick={onOpenDPDPModal} className="block text-left text-xs hover:text-orange-700 dark:hover:text-orange-400 hover:underline cursor-pointer">
                {t('gateway.dpdp_notice', 'DPDP Act 2023 notice')}
              </button>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Demo environment</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Simulated Bengaluru data</span>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-100">{t('gateway.contact', 'Contact')}</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Questions about this demonstration or the project?</p>
            <a href="mailto:abhintr13@gmail.com" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:underline">
              <span>abhintr13@gmail.com</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
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

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="legal-notice-title" onClick={onClose}><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-400">RESQLINK notice</div><h2 id="legal-notice-title" className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{content.title}</h2></div><button onClick={onClose} className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer" aria-label="Close notice">×</button></div><p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{content.body}</p><button onClick={onClose} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-orange-600 px-4 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-orange-500 cursor-pointer transition">Close notice</button></div></div>;
}

function GatewayPrinciple({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-start gap-3"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">{icon}</div><div><div className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</div><div className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{detail}</div></div></div>;
}
