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
  { label: 'Live operations', icon: Radio },
  { label: 'Incident queue', icon: Siren, count: '08' },
  { label: 'Fleet control', icon: Ambulance },
  { label: 'Hospital ER', icon: Building2 },
  { label: 'Citizen Lifeline', icon: Users },
  { label: 'Governance', icon: FileClock },
  { label: 'Research Paper', icon: FileText },
  { label: 'Platform Overview', icon: Home },
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

  const [activeNav, setActiveNav] = useState('Live operations');
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [layersOpen, setLayersOpen] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isDPDPOpen, setIsDPDPOpen] = useState(false);
  const [notice, setNotice] = useState('Live sync active · Last update 12 sec ago');

  const [currentTime, setCurrentTime] = useState(() => {
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
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
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[min(88vw,320px)] -translate-x-full flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform lg:static lg:w-[246px] lg:translate-x-0 lg:shadow-none ${
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
              Command center
            </p>
            <nav className="space-y-1" aria-label="Main navigation">
              {navItems.map((item) => {
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
                    <span>{item.label}</span>
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
                  <span>{activeNav}</span>
                </div>
                <h1 className="truncate font-display text-lg font-bold sm:mt-1 sm:text-[23px]">
                  {activeNav}
                </h1>
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

              {/* Inject SOS trigger for testing */}
              <button
                onClick={handleInjectEmergency}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer shadow-sm"
                title="Simulate incoming emergency incident"
              >
                <Zap className="size-3.5 text-safety-orange" />
                <span>Inject SOS</span>
              </button>

              {/* Multilingual Selector */}
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
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* DPDP Pill */}
              <button
                onClick={() => setIsDPDPOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/30 text-[11px] font-mono font-bold text-emerald-400 hover:bg-emerald-900/30 transition cursor-pointer"
              >
                <ShieldCheck className="size-3.5" />
                <span>DPDP 2023</span>
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
                <span className="hidden xl:inline">Lock Station</span>
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
            ) : (
              /* Premier Command Center View (Live operations / Incident queue / Fleet control) */
              <div className="space-y-4 sm:space-y-5">
                {/* Live notice bar + Search / Controls */}
                <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-status-green">
                      <span className="size-2 rounded-full bg-status-green shadow-[0_0_0_4px_var(--color-status-green-soft)] animate-pulse" />
                      {notice}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Bengaluru Metropolitan Sector <span className="mx-2 text-border">•</span> Shift A
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    <div className="relative hidden min-w-[205px] md:block">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                        placeholder="Search incident ID or location"
                        aria-label="Search incidents"
                      />
                    </div>
                    <button
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                      onClick={() => setNotice('Filters refreshed · All triage queues up to date')}
                    >
                      <SlidersHorizontal className="size-4" />
                      <span className="hidden sm:inline">Filters</span>
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                      onClick={handleInjectEmergency}
                    >
                      <Zap className="size-4 text-safety-orange" />
                      <span className="hidden sm:inline">New intake</span>
                    </button>
                  </div>
                </div>

                {/* 4 Operations Metric Cards */}
                <section className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4" aria-label="Operations metrics">
                  <MetricCard
                    icon={Siren}
                    label="Active incidents"
                    value={filteredIncidents.length < 10 ? `0${filteredIncidents.length}` : `${filteredIncidents.length}`}
                    sub="2 critical · 4 moderate"
                    tone="orange"
                    trend="+2 today"
                  />
                  <MetricCard
                    icon={Ambulance}
                    label="Units available"
                    value="14 / 22"
                    sub="64% fleet readiness"
                    tone="blue"
                    trend="+3 since 08:00"
                  />
                  <MetricCard
                    icon={Gauge}
                    label="Avg. response time"
                    value="08:42"
                    sub="Target under 10 min"
                    tone="green"
                    trend="12% faster"
                  />
                  <MetricCard
                    icon={Building2}
                    label="Hospital capacity"
                    value="72%"
                    sub="31 ICU beds available"
                    tone="violet"
                    trend="Across 12 facilities"
                  />
                </section>

                {/* Response Grid: Left Map + Fleet readiness, Right Queue + Detail */}
                <div className="grid gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.7fr)]">
                  {/* Left Column: Response Map and Fleet Readiness */}
                  <section className="min-w-0 space-y-4 sm:space-y-5">
                    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-3 sm:px-5 sm:py-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="font-display text-sm font-bold">Response map</h2>
                            <span className="rounded-full bg-status-green-soft px-2 py-0.5 text-[10px] font-bold text-status-green">
                              LIVE
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">
                            Bengaluru urban response zone · 22 active units
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <button
                              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                              onClick={() => setLayersOpen(!layersOpen)}
                            >
                              <Layers3 className="size-4" />
                              <span className="hidden sm:inline">Layers</span>
                              <ChevronDown className="size-3.5" />
                            </button>
                            {layersOpen && (
                              <div className="absolute right-0 top-10 z-20 w-44 rounded-md border border-border bg-card p-2 text-xs shadow-lg space-y-1">
                                <label className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
                                  <input type="checkbox" defaultChecked className="accent-primary" /> Traffic layer
                                </label>
                                <label className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
                                  <input type="checkbox" defaultChecked className="accent-primary" /> Hospital capacity
                                </label>
                                <label className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
                                  <input type="checkbox" defaultChecked className="accent-primary" /> Fleet units
                                </label>
                              </div>
                            )}
                          </div>
                          <button
                            className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                            aria-label="Center map"
                            title="Center map"
                            onClick={() => setNotice('Map centered on active incidents')}
                          >
                            <Crosshair className="size-4" />
                          </button>
                          <button
                            className="hidden sm:inline-flex p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                            aria-label="Expand map"
                            title="Expand map"
                          >
                            <Maximize2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Map View */}
                      <div className="relative h-[245px] overflow-hidden bg-map-surface min-[390px]:h-[275px] sm:h-[385px]">
                        <MapIllustration selectedId={selectedIncident.id} onSelect={setSelectedId} />
                        <div className="absolute left-2 top-2 rounded-md border border-border bg-card/95 p-2 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:p-2.5">
                          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                            Map layers
                          </div>
                          <div className="space-y-1.5 text-[10px] font-medium">
                            <LegendDot color="bg-safety-orange" label="Critical incident" />
                            <LegendDot color="bg-primary" label="Available unit" />
                            <LegendDot color="bg-status-green" label="Hospital" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 rounded-md border border-border bg-card/95 px-2 py-1.5 text-[9px] text-muted-foreground shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3 sm:py-2 sm:text-[10px]">
                          <span className="font-semibold text-foreground">Traffic</span> · Moderate <span className="mx-1 text-border">|</span> <span className="font-semibold text-foreground">Coverage</span> · 96%
                        </div>
                      </div>
                    </div>

                    {/* Fleet Readiness */}
                    <div className="rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
                      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                          <h2 className="font-display text-sm font-bold">Fleet readiness</h2>
                          <p className="mt-1 text-xs text-muted-foreground">Current field availability by vehicle type</p>
                        </div>
                        <button
                          className="self-start text-xs text-primary inline-flex items-center gap-1 hover:underline cursor-pointer"
                          onClick={() => setActiveNav('Fleet control')}
                        >
                          View fleet control <ArrowUpRight className="size-3.5" />
                        </button>
                      </div>
                      <div className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
                        <FleetItem label="Advanced life support" value="6 / 8" percent={75} tone="primary" icon={Stethoscope} />
                        <FleetItem label="Basic life support" value="8 / 12" percent={67} tone="orange" icon={Ambulance} />
                        <FleetItem label="Rapid response bikes" value="4 / 6" percent={66} tone="green" icon={NavIcon} />
                      </div>
                    </div>
                  </section>

                  {/* Right Column: Incident Queue & Response Detail */}
                  <aside className="flex min-w-0 flex-col gap-4 sm:gap-5">
                    {/* Incident Queue */}
                    <div className="order-2 rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)] 2xl:order-1">
                      <div className="border-b border-border px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-display text-sm font-bold">Incident queue</h2>
                            <p className="mt-1 text-xs text-muted-foreground">Prioritized by triage severity</p>
                          </div>
                          <button className="p-1 rounded text-muted-foreground hover:bg-muted" title="Filter incident queue">
                            <Filter className="size-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex gap-1 rounded-md bg-muted p-1">
                          {(['All', 'Critical', 'Moderate', 'Minor'] as const).map((filter) => (
                            <button
                              key={filter}
                              className={`flex-1 rounded px-2 py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${
                                activeFilter === filter
                                  ? 'bg-card text-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              onClick={() => handleFilter(filter)}
                            >
                              {filter}
                              {filter === 'All' && <span className="ml-1 text-muted-foreground">{incidents.length}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="max-h-[381px] overflow-y-auto">
                        {filteredIncidents.map((incident) => (
                          <IncidentRow
                            key={incident.id}
                            incident={incident}
                            selected={incident.id === selectedId}
                            onClick={() => setSelectedId(incident.id)}
                          />
                        ))}
                      </div>
                      <div className="border-t border-border px-4 py-3">
                        <button
                          className="h-8 w-full text-xs text-primary inline-flex items-center justify-center gap-1 hover:underline cursor-pointer"
                          onClick={() => {
                            setActiveFilter('All');
                            setNotice('Showing all active incidents');
                          }}
                        >
                          View all incidents <ArrowUpRight className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Response Detail */}
                    <div className="order-1 rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)] 2xl:order-2">
                      <div className="flex items-start justify-between border-b border-border px-4 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-display text-sm font-bold">Response detail</h2>
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${priorityClass(selectedIncident.priority)}`}>
                              {selectedIncident.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                            {selectedIncident.id} <span className="mx-1 text-border">·</span> {selectedIncident.time}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                        <div>
                          <h3 className="text-sm font-bold">{selectedIncident.type}</h3>
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="mt-0.5 size-3.5 shrink-0 text-safety-orange" />
                            {selectedIncident.location}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <InfoCell label="Patients" value={selectedIncident.patient} />
                          <InfoCell label="Distance" value={selectedIncident.distance} />
                          <InfoCell label="Location lock" value="Verified" icon={<Check className="size-3 text-status-green" />} />
                          <InfoCell label="GPS reading" value={selectedIncident.coordinates} />
                        </div>
                        <div className="rounded-md bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
                          <span className="font-bold text-foreground">Dispatch note: </span>
                          {selectedIncident.detail}
                        </div>
                        <div className="flex items-center justify-between border-y border-border py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Ambulance className="size-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{selectedIncident.unit}</div>
                              <div className="text-[10px] text-muted-foreground">Advanced life support</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-safety-orange">{selectedIncident.eta}</div>
                            <div className="text-[10px] text-muted-foreground">Est. arrival</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Building2 className="mt-0.5 size-4 text-primary shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">{selectedIncident.hospital}</div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">Trauma center · ICU capacity available</div>
                          </div>
                        </div>
                        <button
                          className={`h-10 w-full rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                            dispatchedUnits[selectedIncident.id]
                              ? 'bg-status-green text-white'
                              : 'bg-safety-orange text-safety-orange-foreground shadow-[0_8px_18px_-10px_var(--color-safety-orange)] hover:bg-safety-orange/90'
                          }`}
                          onClick={handleDispatch}
                          disabled={dispatchedUnits[selectedIncident.id]}
                        >
                          {dispatchedUnits[selectedIncident.id] ? (
                            <>
                              <Check className="size-4" /> Unit {selectedIncident.unit} Dispatched
                            </>
                          ) : (
                            <>
                              <Siren className="size-4" /> Authorize &amp; Dispatch {selectedIncident.unit}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* System Activity Feed */}
                    <div className="order-3 rounded-lg border border-border bg-card shadow-[0_10px_30px_-24px_var(--color-shadow)]">
                      <div className="flex items-center justify-between border-b border-border px-4 py-4">
                        <div>
                          <h2 className="font-display text-sm font-bold">System activity</h2>
                          <p className="mt-1 text-xs text-muted-foreground">Latest operational events</p>
                        </div>
                        <span className="size-2 rounded-full bg-status-green" />
                      </div>
                      <div className="space-y-3 p-4">
                        {activities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div key={activity.text} className="flex items-center gap-2.5">
                              <Icon className={`size-3.5 ${activity.tone}`} />
                              <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                                {activity.text}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground/70">
                                {activity.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </aside>
                </div>

                {/* Footer */}
                <footer className="flex flex-col gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-status-green" />
                    All systems operational <span className="text-border">·</span> WebSocket connected
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsDPDPOpen(true)}
                      className="hover:underline cursor-pointer text-muted-foreground"
                    >
                      DPDP compliant
                    </button>
                    <span className="text-border">·</span>
                    <span>Last audit sync 09:36</span>
                  </div>
                </footer>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* DPDP Privacy & Consent Modal */}
      <DPDPNoticeModal isOpen={isDPDPOpen} onClose={() => setIsDPDPOpen(false)} />
    </div>
  );
};

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
