import React, { useMemo, useState, useEffect } from 'react';
import { ResqLinkProvider, useResqLink } from './context/ResqLinkContext';
import { HospitalDashboard } from './components/HospitalPortal/HospitalDashboard';
import { PatientDashboard } from './components/PatientPortal/PatientDashboard';
import { EEGDashboard } from './components/EEGDashboard/EEGDashboard';
import { AboutPaperView } from './components/AboutPaper/AboutPaperView';
import { HomePageView } from './components/Home/HomePageView';
import { DPDPNoticeModal } from './components/CitizenApp/DPDPNoticeModal';
import { AuthGatewayScreen } from './components/Auth/AuthGatewayScreen';
import { LanguageCode, UserRole } from './types';
import { useTranslation, INDIAN_LANGUAGES, getLanguageLabel } from './i18n';
import { formatISTTime12h } from './utils/timeFormat';
import {
  Activity,
  Ambulance,
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  FileClock,
  FileText,
  Filter,
  Gauge,
  Home,
  Languages,
  Layers3,
  LifeBuoy,
  LogOut,
  MapPin,
  Maximize2,
  Menu,
  Navigation as NavIcon,
  Radio,
  Search,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Stethoscope,
  Users,
  X,
  Zap,
} from 'lucide-react';

type Priority = 'Critical' | 'Moderate' | 'Minor';

type Incident = {
  id: string;
  type: string;
  location: string;
  time: string;
  distance: string;
  priority: Priority;
  patient: string;
  detail: string;
  unit: string;
  eta: string;
  hospital: string;
  coordinates: string;
};

const initialIncidents: [Incident, ...Incident[]] = [
  {
    id: 'RSQ-2841',
    type: 'Road traffic collision',
    location: 'Outer Ring Road · HSR Layout',
    time: 'Just now',
    distance: '2.4 km',
    priority: 'Critical',
    patient: '2 patients · adult',
    detail: 'Possible entrapment reported. Bystander video attached.',
    unit: 'AMB-07',
    eta: '04:20',
    hospital: 'Sakra World Hospital',
    coordinates: '12.9116° N, 77.6474° E',
  },
  {
    id: 'RSQ-2839',
    type: 'Cardiac emergency',
    location: 'Indiranagar · 12th Main',
    time: '3 min ago',
    distance: '5.1 km',
    priority: 'Critical',
    patient: '1 patient · 64 yrs',
    detail: 'Chest pain and shortness of breath. Caller has medical ID.',
    unit: 'AMB-12',
    eta: '06:10',
    hospital: 'Manipal Hospital',
    coordinates: '12.9784° N, 77.6408° E',
  },
  {
    id: 'RSQ-2837',
    type: 'Fall injury',
    location: 'Koramangala · 5th Block',
    time: '8 min ago',
    distance: '3.8 km',
    priority: 'Moderate',
    patient: '1 patient · adult',
    detail: 'Conscious and stable. Possible wrist fracture.',
    unit: 'AMB-04',
    eta: '08:45',
    hospital: 'St. John’s Medical College',
    coordinates: '12.9352° N, 77.6245° E',
  },
  {
    id: 'RSQ-2834',
    type: 'Breathing difficulty',
    location: 'Jayanagar · 4th Block',
    time: '12 min ago',
    distance: '7.2 km',
    priority: 'Moderate',
    patient: '1 patient · 42 yrs',
    detail: 'Asthma attack. Oxygen support requested.',
    unit: 'AMB-09',
    eta: '11:30',
    hospital: 'BGS Gleneagles Global',
    coordinates: '12.9250° N, 77.5938° E',
  },
  {
    id: 'RSQ-2828',
    type: 'Minor laceration',
    location: 'Whitefield · ITPL Main Road',
    time: '18 min ago',
    distance: '12.6 km',
    priority: 'Minor',
    patient: '1 patient · adult',
    detail: 'Bleeding controlled. Non-urgent transport requested.',
    unit: 'AMB-15',
    eta: '15:00',
    hospital: 'Columbia Asia Hospital',
    coordinates: '12.9869° N, 77.7491° E',
  },
];

const navItems = [
  { id: 'Live operations', label: 'Live operations', labelKey: 'nav.live_ops', icon: Radio },
  { id: 'Incident queue', label: 'Incident queue', labelKey: 'nav.incident_queue', count: '08', icon: Siren },
  { id: 'Fleet control', label: 'Fleet control', labelKey: 'nav.fleet_control', icon: Ambulance },
  { id: 'Hospital ER', label: 'Hospital ER', labelKey: 'nav.hospital_er', icon: Building2 },
  { id: 'Citizen Lifeline', label: 'Citizen Lifeline', labelKey: 'nav.citizen_lifeline', icon: Users },
  { id: 'Governance', label: 'Governance', labelKey: 'nav.governance', icon: FileClock },
  { id: 'Research Paper', label: 'Research Paper', labelKey: 'nav.research_paper', icon: FileText },
  { id: 'Platform Overview', label: 'Platform Overview', labelKey: 'nav.platform_overview', icon: Home },
];

const activities = [
  { icon: ShieldCheck, tone: 'text-status-green', text: 'AMB-12 accepted dispatch', time: '09:42' },
  { icon: Building2, tone: 'text-primary', text: 'Manipal Hospital confirmed bed', time: '09:40' },
  { icon: Activity, tone: 'text-safety-orange', text: 'Traffic factor updated · ORR', time: '09:38' },
  { icon: FileClock, tone: 'text-muted-foreground', text: 'Audit chain synced successfully', time: '09:36' },
];

export const MainLayout: React.FC = () => {
  const {
    userRole,
    setUserRole,
    activeAlert,
    triggerSOS,
    language,
    setLanguage,
    isGatewayActive,
    exitToGateway,
  } = useResqLink();
  const { t } = useTranslation();

  const [activeNav, setActiveNav] = useState('Live operations');
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [layersOpen, setLayersOpen] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDPDPOpen, setIsDPDPOpen] = useState(false);
  const [notice, setNotice] = useState('Live sync active · Last update 12 sec ago');

  const [currentTime, setCurrentTime] = useState(() => formatISTTime12h());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatISTTime12h());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userRole === 'hospital') {
      setActiveNav('Hospital ER');
    } else if (userRole === 'patient') {
      setActiveNav('Citizen Lifeline');
    } else {
      setActiveNav('Live operations');
    }
  }, [userRole]);

  const incidents = useMemo(() => {
    if (activeAlert) {
      const activeItem: Incident = {
        id: activeAlert.shortCode || 'RSQ-LIVE',
        type: activeAlert.category.replace('_', ' '),
        location: activeAlert.equityMetadata?.wardName || 'Bengaluru Central',
        time: 'Just now',
        distance: '1.4 km',
        priority: 'Critical',
        patient: activeAlert.citizenName || '1 patient',
        detail: activeAlert.description || 'Emergency SOS triggered via CAD network.',
        unit: activeAlert.assignedResponder?.name || 'AMB-01',
        eta: `${activeAlert.estimatedArrivalMinutes || 4}:00`,
        hospital: activeAlert.assignedHospital?.name || 'Manipal Hospital',
        coordinates: `${activeAlert.location.latitude.toFixed(4)}° N, ${activeAlert.location.longitude.toFixed(4)}° E`,
      };
      return [activeItem, ...initialIncidents];
    }
    return initialIncidents;
  }, [activeAlert]);

  const filteredIncidents = useMemo(
    () =>
      activeFilter === 'All'
        ? incidents
        : incidents.filter((incident) => incident.priority === activeFilter),
    [activeFilter, incidents],
  );

  const selectedIncident = incidents.find((incident) => incident.id === selectedId) ?? incidents[0];

  const handleFilter = (filter: Priority | 'All') => {
    setActiveFilter(filter);
    if (filter !== 'All' && selectedIncident.priority !== filter) {
      const nextIncident = incidents.find((incident) => incident.priority === filter);
      if (nextIncident) setSelectedId(nextIncident.id);
    }
  };

  const handleDispatch = () => {
    setDispatchedUnits((prev) => ({ ...prev, [selectedIncident.id]: true }));
    setNotice(`${selectedIncident.unit} dispatched to ${selectedIncident.id} · ETA ${selectedIncident.eta}`);
  };

  const handleInjectEmergency = () => {
    void triggerSOS('TRAUMA_ACCIDENT');
    setNotice('Emergency incident simulated in Bengaluru CAD network');
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setIsRoleDropdownOpen(false);
    if (role === 'hospital') {
      setActiveNav('Hospital ER');
    } else if (role === 'patient') {
      setActiveNav('Citizen Lifeline');
    } else {
      setActiveNav('Live operations');
    }
  };

  const roleProfiles = {
    admin: { name: 'Arjun Rao', title: 'Senior dispatcher', initials: 'AR' },
    hospital: { name: 'Dr. Priya Shenoy', title: 'ER Trauma Chief', initials: 'PS' },
    patient: { name: 'Ramesh Kumar', title: 'Citizen (ABHA Sync)', initials: 'RK' },
  };

  const currentProfile = roleProfiles[userRole] || roleProfiles.admin;

  const visibleNavItems = navItems.filter((item) => {
    if (userRole === 'admin') return true;
    if (userRole === 'hospital') return ['Hospital ER', 'Platform Overview'].includes(item.label);
    return ['Citizen Lifeline', 'Platform Overview'].includes(item.label);
  });

  const workspaceLabel = userRole === 'admin'
    ? t('nav.command_workspace', 'Command workspace')
    : userRole === 'hospital'
    ? t('nav.clinical_workspace', 'Clinical workspace')
    : t('nav.citizen_workspace', 'Citizen workspace');

  if (isGatewayActive) {
    return (
      <>
        <AuthGatewayScreen onOpenDPDPModal={() => setIsDPDPOpen(true)} />
        <DPDPNoticeModal isOpen={isDPDPOpen} onClose={() => setIsDPDPOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="product-shell flex min-h-screen flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside
          className={`product-shell-sidebar fixed inset-y-0 left-0 z-40 flex w-[min(88vw,320px)] -translate-x-full flex-col shadow-2xl transition-transform lg:static lg:w-[246px] lg:translate-x-0 lg:shadow-none ${
            isSidebarOpen ? 'translate-x-0' : ''
          }`}
        >
          {/* Logo Header */}
          <div className="flex h-[76px] items-center justify-between border-b border-sidebar-border px-5">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setActiveNav('Platform Overview')}
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-safety-orange text-safety-orange-foreground shadow-[0_8px_20px_-8px_var(--color-safety-orange)]">
                <LifeBuoy className="size-5" strokeWidth={2.4} />
              </div>
              <div>
                <div className="font-display text-[17px] font-bold tracking-[-0.03em] text-sidebar-primary-foreground">
                  RESQLINK
                </div>
                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sidebar-muted">
                  Emergency network
                </div>
              </div>
            </div>
            <button
              className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-primary-foreground p-1.5 rounded-lg lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-3 pt-6 flex-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-muted">
              {workspaceLabel}
            </p>
            <nav className="space-y-1" aria-label="Main navigation">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    className={`h-11 w-full flex items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary-foreground shadow-[inset_3px_0_0_var(--color-safety-orange)] font-bold'
                        : 'text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-primary-foreground'
                    }`}
                    onClick={() => {
                      setActiveNav(item.label);
                      setNotice(`${item.label} view active`);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className={`size-[17px] ${isActive ? 'text-safety-orange' : ''}`} />
                    <span>{t(item.labelKey, item.label)}</span>
                    {item.count && (
                      <span className="ml-auto rounded bg-sidebar-badge px-1.5 py-0.5 text-[10px] font-bold text-sidebar-muted">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Operator Profile & Role Switcher at Bottom */}
          <div className="mt-auto px-4 pb-5">
            <div className="mb-4 border-t border-sidebar-border" />
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full flex items-center gap-3 rounded-lg bg-sidebar-accent/60 px-3 py-3 hover:bg-sidebar-accent transition cursor-pointer text-left"
              >
                <div className="relative flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-foreground">
                  {currentProfile.initials}
                  <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-sidebar bg-status-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-sidebar-primary-foreground">
                    {currentProfile.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-sidebar-muted">
                    {currentProfile.title}
                  </div>
                </div>
                <ChevronDown className="ml-auto size-4 text-sidebar-muted" />
              </button>

              {/* Role dropdown popup */}
              {isRoleDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-sidebar-border bg-sidebar p-1.5 shadow-2xl z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-sidebar-muted border-b border-sidebar-border">
                    Switch Persona
                  </div>
                  {[
                    { role: 'admin' as const, label: 'Admin Dispatcher', sub: 'Full CAD Terminal' },
                    { role: 'hospital' as const, label: 'Hospital Medical ER', sub: 'Trauma Bay Terminal' },
                    { role: 'patient' as const, label: 'Citizen & Patient', sub: 'Emergency Lifeline' },
                  ].map((p) => (
                    <button
                      key={p.role}
                      onClick={() => handleRoleSelect(p.role)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                        userRole === p.role
                          ? 'bg-sidebar-accent text-sidebar-primary-foreground font-bold'
                          : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground'
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className="text-[10px] text-sidebar-muted">{p.sub}</div>
                    </button>
                  ))}
                  <div className="pt-1 mt-1 border-t border-sidebar-border">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        exitToGateway();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-2 font-medium"
                    >
                      <LogOut className="size-3.5" />
                      <span>Lock / Exit to Gateway</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 px-1 text-[10px] text-sidebar-muted">
              <span className="size-1.5 rounded-full bg-status-green" /> Bengaluru region · Shift A
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 bg-background flex flex-col">
          {/* Header */}
          <header className="grid min-h-[68px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card px-3 sm:min-h-[76px] sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted lg:hidden cursor-pointer"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <div className="hidden items-center gap-2 text-xs text-muted-foreground min-[390px]:flex">
                  <span className="font-medium text-primary">Bengaluru</span>
                  <span>/</span>
                  <span>{navItems.find((n) => n.label === activeNav) ? t(navItems.find((n) => n.label === activeNav)!.labelKey, activeNav) : activeNav}</span>
                </div>
                <h1 className="truncate font-display text-lg font-bold sm:mt-1 sm:text-[23px]">
                  {navItems.find((n) => n.label === activeNav) ? t(navItems.find((n) => n.label === activeNav)!.labelKey, activeNav) : activeNav}
                </h1>
                <span className="hidden text-[10px] font-semibold text-muted-foreground sm:block">
                  {workspaceLabel} <span className="mx-1 text-border">·</span> {t('nav.demo_env', 'Demo environment')}
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* IST Clock */}
              <div className="hidden items-center gap-2 border-r border-border pr-3 text-xs text-muted-foreground md:flex">
                <Clock3 className="size-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{currentTime}</span>
                <span>IST</span>
              </div>

              {/* Simulation controls are dispatcher-only. */}
              {userRole === 'admin' && (
                <button
                  onClick={handleInjectEmergency}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer shadow-sm"
                  title="Simulate incoming emergency incident"
                >
                  <Zap className="size-3.5 text-safety-orange" />
                  <span className="hidden sm:inline">{t('nav.new_intake', 'New intake')}</span>
                </button>
              )}

              {/* Multilingual Selector */}
              <div className="relative flex items-center gap-1">
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs font-mono font-bold">
                  {(['en', 'kn', 'hi'] as LanguageCode[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-2 py-1 rounded transition cursor-pointer ${
                        language === lang
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={getLanguageLabel(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer shadow-sm"
                    title="All 23 Indian Languages"
                    aria-label="Select Indian Language"
                  >
                    <Languages className="size-3.5 text-primary" />
                    <span className="hidden sm:inline font-mono text-[10px]">{language.toUpperCase()}</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>

                  {isLangDropdownOpen && (
                    <>
                      {/* Fixed backdrop to close dropdown on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsLangDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10">
                        <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-800 mb-1 flex items-center justify-between">
                          <span>Pan-India Languages (23)</span>
                          <Languages className="size-3 text-primary" />
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
                                ? 'bg-primary/20 text-primary font-bold border border-primary/30'
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
                            {language === lang.code && <Check className="size-3.5 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* DPDP Pill */}
              <button
                onClick={() => setIsDPDPOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/30 text-[11px] font-mono font-bold text-emerald-400 hover:bg-emerald-900/30 transition cursor-pointer"
              >
                <ShieldCheck className="size-3.5" />
                <span>{t('nav.dpdp_2023', 'DPDP 2023')}</span>
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => setNotice('No critical alert backlogs')}
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-safety-orange" />
              </button>

              {/* Lock Station / Exit to Gateway */}
              <button
                onClick={exitToGateway}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shadow-sm"
                title="Lock Terminal & Return to Gateway"
              >
                <LogOut className="size-3.5" />
                <span className="hidden xl:inline">{t('nav.lock_station', 'Lock Station')}</span>
              </button>
            </div>
          </header>

          {/* Body Content */}
          <div className="flex-1 p-3 sm:p-6 lg:p-8">
            {activeNav === 'Hospital ER' ? (
              <HospitalDashboard />
            ) : activeNav === 'Citizen Lifeline' ? (
              <PatientDashboard />
            ) : activeNav === 'Governance' ? (
              <EEGDashboard />
            ) : activeNav === 'Research Paper' ? (
              <AboutPaperView />
            ) : activeNav === 'Platform Overview' ? (
              <HomePageView />
            ) : activeNav === 'Incident queue' ? (
              <IncidentQueueWorkspace
                incidents={filteredIncidents}
                totalIncidents={incidents.length}
                selectedId={selectedId}
                selectedIncident={selectedIncident}
                activeFilter={activeFilter}
                dispatchedUnits={dispatchedUnits}
                onSelect={setSelectedId}
                onFilter={handleFilter}
                dispatched={Boolean(dispatchedUnits[selectedIncident.id])}
                onDispatch={handleDispatch}
              />
            ) : (
              <LiveOperationsWorkspace
                incidents={incidents}
                filteredIncidents={filteredIncidents}
                selectedId={selectedId}
                selectedIncident={selectedIncident}
                activeFilter={activeFilter}
                layersOpen={layersOpen}
                notice={notice}
                dispatchedUnits={dispatchedUnits}
                onSelect={setSelectedId}
                onFilter={handleFilter}
                onToggleLayers={() => setLayersOpen((open) => !open)}
                onDispatch={handleDispatch}
                onNotice={setNotice}
                onNewIntake={handleInjectEmergency}
                onFleet={() => setActiveNav('Fleet control')}
                onPrivacy={() => setIsDPDPOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* DPDP Privacy & Consent Modal */}
      <DPDPNoticeModal isOpen={isDPDPOpen} onClose={() => setIsDPDPOpen(false)} />
    </div>
  );
};

function LiveOperationsWorkspace({
  incidents,
  filteredIncidents,
  selectedId,
  selectedIncident,
  activeFilter,
  layersOpen,
  notice,
  dispatchedUnits,
  onSelect,
  onFilter,
  onToggleLayers,
  onDispatch,
  onNotice,
  onNewIntake,
  onFleet,
  onPrivacy,
}: {
  incidents: Incident[];
  filteredIncidents: Incident[];
  selectedId: string;
  selectedIncident: Incident;
  activeFilter: Priority | 'All';
  layersOpen: boolean;
  notice: string;
  dispatchedUnits: Record<string, boolean>;
  onSelect: (id: string) => void;
  onFilter: (filter: Priority | 'All') => void;
  onToggleLayers: () => void;
  onDispatch: () => void;
  onNotice: (message: string) => void;
  onNewIntake: () => void;
  onFleet: () => void;
  onPrivacy: () => void;
}) {
  const availableUnits = 14;
  const totalBeds = 31;
  const criticalCount = incidents.filter((incident) => incident.priority === 'Critical').length;
  const dispatchedCount = Object.values(dispatchedUnits).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-800 bg-[#111827] p-4 text-slate-100 shadow-xl sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
              Network posture · nominal
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Live operations</h2>
            <p className="mt-1 text-sm text-slate-400">Situational awareness across Bengaluru response zones. Triage decisions live in Incident queue.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300">{notice}</span>
            <button onClick={onNewIntake} className="inline-flex items-center gap-1.5 rounded-md bg-safety-orange px-3 py-2 font-bold text-white transition hover:bg-orange-600 active:scale-[0.98] cursor-pointer">
              <Zap className="size-3.5" /> Simulate intake
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800 sm:grid-cols-4">
          <OpsMetric label="Critical now" value={`${criticalCount}`} detail="Needs triage" tone="text-red-300" />
          <OpsMetric label="Fleet ready" value={`${availableUnits}/22`} detail="64% availability" tone="text-blue-300" />
          <OpsMetric label="ICU capacity" value={`${totalBeds}`} detail="Beds network-wide" tone="text-emerald-300" />
          <OpsMetric label="Dispatches today" value={`${dispatchedCount + 18}`} detail="Since 06:00 IST" tone="text-amber-300" />
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.7fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220] shadow-xl">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-white">Response map</h3>
                <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">LIVE FEED</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Bengaluru metropolitan response grid · {incidents.length} tracked incidents</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={onToggleLayers} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">
                  <Layers3 className="size-3.5" /> Layers <ChevronDown className="size-3.5" />
                </button>
                {layersOpen && <div className="absolute right-0 top-10 z-20 w-48 space-y-1 rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-slate-300 shadow-2xl">
                  {['Traffic flow', 'Hospital capacity', 'Available units'].map((layer) => <label key={layer} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-slate-800"><input type="checkbox" defaultChecked className="accent-orange-500" />{layer}</label>)}
                </div>}
              </div>
              <button onClick={() => onNotice('Map centered on active response zones')} className="rounded-md border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer" aria-label="Center map"><Crosshair className="size-4" /></button>
            </div>
          </div>
          <div className="relative h-[300px] bg-map-surface sm:h-[420px]">
            <MapIllustration selectedId={selectedId} onSelect={onSelect} />
            <div className="absolute left-3 top-3 rounded-md border border-slate-700 bg-slate-950/90 p-3 text-[10px] text-slate-300 shadow-lg">
              <div className="mb-2 font-bold uppercase tracking-wider text-slate-500">Operational layers</div>
              <div className="space-y-1.5"><LegendDot color="bg-safety-orange" label="Critical incident" /><LegendDot color="bg-primary" label="Available unit" /><LegendDot color="bg-status-green" label="Receiving hospital" /></div>
            </div>
            <div className="absolute bottom-3 right-3 rounded-md border border-slate-700 bg-slate-950/90 px-3 py-2 text-[10px] text-slate-400">Traffic <span className="font-bold text-amber-300">moderate</span> · Coverage <span className="font-bold text-emerald-300">96%</span></div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div><h3 className="font-display text-sm font-bold">Network readiness</h3><p className="mt-1 text-xs text-muted-foreground">Resources available for the next call</p></div>
              <button onClick={onFleet} className="text-xs font-semibold text-primary hover:underline cursor-pointer">Fleet control <ArrowUpRight className="inline size-3.5" /></button>
            </div>
            <div className="space-y-4 p-4">
              <ReadinessBar label="ALS ambulances" value="6 / 8" percent={75} tone="bg-primary" />
              <ReadinessBar label="BLS ambulances" value="8 / 12" percent={67} tone="bg-safety-orange" />
              <ReadinessBar label="Rapid response bikes" value="4 / 6" percent={66} tone="bg-status-green" />
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs"><InfoCell label="Dispatch latency" value="420 ms" /><InfoCell label="CAD coverage" value="96%" /></div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
            <div className="border-b border-border px-4 py-4"><h3 className="font-display text-sm font-bold">Network events</h3><p className="mt-1 text-xs text-muted-foreground">Recent signals, not a triage queue</p></div>
            <div className="divide-y divide-border">{activities.slice(0, 4).map((activity) => { const Icon = activity.icon; return <div key={activity.text} className="flex items-center gap-3 px-4 py-3"><Icon className={`size-4 ${activity.tone}`} /><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{activity.text}</span><span className="text-[10px] text-muted-foreground/70">{activity.time}</span></div>; })}</div>
            <button onClick={onPrivacy} className="w-full border-t border-border px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground hover:bg-muted cursor-pointer">Audit chain synced · View governance records <ArrowUpRight className="inline size-3.5" /></button>
          </section>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground"><span>Demo operations feed · simulated Bengaluru data</span><span>{filteredIncidents.length} incidents currently visible in triage filters</span></footer>
    </div>
  );
}

function OpsMetric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <div className="bg-[#111827] p-3 sm:p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div><div className={`mt-2 font-mono text-xl font-bold ${tone}`}>{value}</div><div className="mt-1 text-[10px] text-slate-500">{detail}</div></div>;
}

function ReadinessBar({ label, value, percent, tone }: { label: string; value: string; percent: number; tone: string }) {
  return <div><div className="flex items-center justify-between text-xs"><span className="font-semibold text-foreground">{label}</span><span className="font-mono text-muted-foreground">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} /></div></div>;
}

function IncidentQueueWorkspace({
  incidents,
  totalIncidents,
  selectedId,
  selectedIncident,
  activeFilter,
  dispatchedUnits,
  onSelect,
  onFilter,
  dispatched,
  onDispatch,
}: {
  incidents: Incident[];
  totalIncidents: number;
  selectedId: string;
  selectedIncident: Incident;
  activeFilter: Priority | 'All';
  dispatchedUnits: Record<string, boolean>;
  onSelect: (id: string) => void;
  onFilter: (filter: Priority | 'All') => void;
  dispatched: boolean;
  onDispatch: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-4 shadow-[0_10px_30px_-24px_var(--color-shadow)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-safety-orange">
              <Siren className="size-4" />
              TRIAGE WORKSPACE
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">Incident queue</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Review, prioritise and dispatch active emergency requests. The live map is available under Live operations.
            </p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-right">
            <div className="text-2xl font-bold leading-none">{totalIncidents}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">active requests</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
          <QueueSignal label="Needs triage" value={`${incidents.filter((incident) => incident.priority === 'Critical').length}`} tone="status-critical" />
          <QueueSignal label="Awaiting unit" value={`${incidents.filter((incident) => !dispatchedUnits[incident.id]).length}`} tone="status-attention" />
          <QueueSignal label="Units committed" value={`${Object.values(dispatchedUnits).filter(Boolean).length}`} tone="status-ready" />
          <QueueSignal label="Oldest request" value={incidents[incidents.length - 1]?.time || '—'} tone="bg-muted text-foreground" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter incidents by priority">
          {(['All', 'Critical', 'Moderate', 'Minor'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilter(filter)}
              className={`rounded-md border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                activeFilter === filter
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
          <div className="border-b border-border px-4 py-4">
            <h3 className="font-display text-sm font-bold">Requests awaiting action</h3>
            <p className="mt-1 text-xs text-muted-foreground">Sorted by triage priority and arrival time</p>
          </div>
          <div className="divide-y divide-border">
            {incidents.length ? incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                selected={incident.id === selectedId}
                onClick={() => onSelect(incident.id)}
              />
            )) : (
              <div className="p-8 text-center text-sm text-muted-foreground">No incidents match this priority.</div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold">Selected request</h3>
                <p className="mt-1 text-xs text-muted-foreground">{selectedIncident.id} · {selectedIncident.time}</p>
              </div>
              <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${priorityClass(selectedIncident.priority)}`}>
                {selectedIncident.priority}
              </span>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <h4 className="text-base font-bold">{selectedIncident.type}</h4>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-safety-orange" />
                {selectedIncident.location}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InfoCell label="Patients" value={selectedIncident.patient} />
              <InfoCell label="Distance" value={selectedIncident.distance} />
              <InfoCell label="Location lock" value="Verified" icon={<Check className="size-3 text-status-green" />} />
              <InfoCell label="ETA" value={selectedIncident.eta} />
            </div>
            <div className="rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Dispatch note: </span>{selectedIncident.detail}
            </div>
            <div className="flex items-center justify-between border-y border-border py-3">
              <div className="flex items-center gap-2">
                <Ambulance className="size-4 text-primary" />
                <div>
                  <div className="text-xs font-bold">{selectedIncident.unit}</div>
                  <div className="text-[10px] text-muted-foreground">Assigned response unit</div>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">{selectedIncident.hospital}</div>
            </div>
            <button
              onClick={onDispatch}
              disabled={dispatched}
              className={`h-10 w-full rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                dispatched ? 'bg-status-green text-white' : 'bg-safety-orange text-safety-orange-foreground hover:bg-safety-orange/90'
              }`}
            >
              {dispatched ? <><Check className="size-4" /> Unit dispatched</> : <><Siren className="size-4" /> Authorize dispatch</>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function QueueSignal({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={`rounded-md px-3 py-2 ${tone}`}><div className="text-lg font-bold leading-none">{value}</div><div className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-75">{label}</div></div>;
}

export default function App() {
  return (
    <ResqLinkProvider>
      <MainLayout />
    </ResqLinkProvider>
  );
}

// Sub-components matching reslink-redux
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  trend,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub: string;
  tone: 'orange' | 'blue' | 'green' | 'violet';
  trend: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-[0_10px_30px_-24px_var(--color-shadow)] sm:p-5">
      <div className="flex items-start justify-between">
        <div
          className={`flex size-8 items-center justify-center rounded-md ${
            tone === 'orange'
              ? 'bg-safety-orange-soft text-safety-orange'
              : tone === 'blue'
              ? 'bg-primary/10 text-primary'
              : tone === 'green'
              ? 'bg-status-green-soft text-status-green'
              : 'bg-chart-violet-soft text-chart-violet'
          }`}
        >
          <Icon className="size-4" />
        </div>
        <span className="hidden text-[9px] font-semibold text-muted-foreground sm:block">{trend}</span>
      </div>
      <div className="mt-4 font-display text-xl font-bold tracking-[-0.04em] sm:text-2xl">{value}</div>
      <div className="mt-1 text-xs font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function IncidentRow({
  incident,
  selected,
  onClick,
}: {
  incident: Incident;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60 cursor-pointer ${
        selected ? 'bg-primary/5 shadow-[inset_3px_0_0_var(--color-primary)]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 size-2 shrink-0 rounded-full ${
            incident.priority === 'Critical'
              ? 'bg-safety-orange'
              : incident.priority === 'Moderate'
              ? 'bg-chart-yellow'
              : 'bg-status-green'
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-bold">{incident.type}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">{incident.time}</span>
          </div>
          <div className="mt-1 truncate text-[11px] text-muted-foreground">{incident.location}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{incident.id}</span>
            <span>·</span>
            <span>{incident.distance}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function FleetItem({
  label,
  value,
  percent,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'primary' | 'orange' | 'green';
  icon: typeof Ambulance;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          className={`flex size-7 items-center justify-center rounded ${
            tone === 'primary'
              ? 'bg-primary/10 text-primary'
              : tone === 'orange'
              ? 'bg-safety-orange-soft text-safety-orange'
              : 'bg-status-green-soft text-status-green'
          }`}
        >
          <Icon className="size-3.5" />
        </div>
        <span className="truncate text-[10px] font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-display text-sm font-bold">{value}</span>
        <span className="text-[10px] text-muted-foreground">{percent}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${
            tone === 'primary'
              ? 'bg-primary'
              : tone === 'orange'
              ? 'bg-safety-orange'
              : 'bg-status-green'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-border p-2.5">
      <div className="text-[9px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 flex min-w-0 items-center gap-1 break-words text-[11px] font-bold">
        {icon}
        {value}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function priorityClass(priority: Priority) {
  return priority === 'Critical'
    ? 'bg-safety-orange-soft text-safety-orange'
    : priority === 'Moderate'
    ? 'bg-chart-yellow-soft text-chart-yellow-foreground'
    : 'bg-status-green-soft text-status-green';
}

function MapIllustration({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const markers = [
    { id: 'RSQ-2841', x: 55, y: 54, critical: true },
    { id: 'RSQ-2839', x: 70, y: 26, critical: true },
    { id: 'RSQ-2837', x: 40, y: 68, critical: false },
    { id: 'RSQ-2834', x: 24, y: 36, critical: false },
  ];

  return (
    <svg viewBox="0 0 900 490" className="absolute inset-0 h-full w-full" role="img" aria-label="Operational response map of Bengaluru">
      <rect width="900" height="490" fill="var(--color-map-surface)" />
      <g className="fill-none stroke-map-road" strokeWidth="12" strokeLinecap="round">
        <path d="M-40 70 C160 120 280 35 470 115 S730 240 940 160" />
        <path d="M-20 410 C160 350 300 420 420 315 S650 260 920 350" />
        <path d="M120 -30 C170 100 250 150 220 280 S270 420 320 520" />
        <path d="M625 -20 C590 130 690 170 625 290 S700 430 680 520" />
      </g>
      <g className="fill-none stroke-map-minor" strokeWidth="5" strokeLinecap="round">
        <path d="M-20 190 C180 160 285 220 440 200 S700 80 930 95" />
        <path d="M40 300 C220 280 320 330 500 255 S690 220 930 260" />
        <path d="M405 -20 C370 90 420 150 390 250 S430 380 410 520" />
        <path d="M790 -20 C730 105 800 180 760 300 S820 430 790 520" />
      </g>
      <g className="fill-none stroke-map-route" strokeWidth="3" strokeDasharray="7 8">
        <path d="M495 265 L360 333" />
        <path d="M495 265 L630 127" />
      </g>
      <g className="fill-map-label text-[12px] font-semibold">
        <text x="88" y="76">Rajajinagar</text>
        <text x="542" y="82">Indiranagar</text>
        <text x="334" y="232">Koramangala</text>
        <text x="122" y="365">Jayanagar</text>
        <text x="730" y="318">Whitefield</text>
        <text x="480" y="455">Bengaluru urban response zone</text>
      </g>
      {markers.map((marker) => (
        <g key={marker.id} className="cursor-pointer" onClick={() => onSelect(marker.id)}>
          <circle
            cx={`${marker.x}%`}
            cy={`${marker.y}%`}
            r={marker.id === selectedId ? 20 : 14}
            className={marker.id === selectedId ? 'fill-primary/15 stroke-primary' : 'fill-transparent stroke-transparent'}
            strokeWidth="2"
          />
          <circle
            cx={`${marker.x}%`}
            cy={`${marker.y}%`}
            r="7"
            className={marker.critical ? 'fill-safety-orange stroke-card' : 'fill-chart-yellow stroke-card'}
            strokeWidth="3"
          />
          <circle cx={`${marker.x}%`} cy={`${marker.y}%`} r="2" className="fill-card" />
        </g>
      ))}
      {[{ x: 62, y: 42 }, { x: 34, y: 40 }, { x: 48, y: 78 }, { x: 79, y: 58 }, { x: 17, y: 61 }].map((unit, index) => (
        <g key={index}>
          <circle cx={`${unit.x}%`} cy={`${unit.y}%`} r="7" className="fill-primary stroke-card" strokeWidth="3" />
          <path d={`M${unit.x * 9 - 5} ${unit.y * 4.9 - 7} l5 7 l-5 7 l-5 -7 z`} className="fill-primary/70" />
        </g>
      ))}
      {[{ x: 52, y: 30 }, { x: 80, y: 38 }, { x: 28, y: 76 }].map((hospital, index) => (
        <g key={index}>
          <circle cx={`${hospital.x}%`} cy={`${hospital.y}%`} r="7" className="fill-status-green stroke-card" strokeWidth="3" />
          <path d={`M${hospital.x * 9 - 3} ${hospital.y * 4.9 - 3} h6 v6 h-6 z`} className="fill-card" />
          <path d={`M${hospital.x * 9 - 1} ${hospital.y * 4.9 - 5} h2 v10 h-2 z`} className="fill-card" />
        </g>
      ))}
    </svg>
  );
}
