import React, { useMemo, useState, useEffect } from 'react';
import { ResqLinkProvider, useResqLink } from './context/ResqLinkContext';
import { HospitalDashboard } from './components/HospitalPortal/HospitalDashboard';
import { PatientDashboard } from './components/PatientPortal/PatientDashboard';
import { DPDPNoticeModal } from './components/CitizenApp/DPDPNoticeModal';
import { LoginScreen } from './components/Auth/LoginScreen';

export const MainLayout: React.FC = () => {
  const { userRole, adminViewTab, authUser, authLoading } = useResqLink();
  const [isDPDPOpen, setIsDPDPOpen] = useState<boolean>(false);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">Loading secure session…</div>;
  }

  if (!authUser) {
    return <LoginScreen />;
  }

  // Determine active view based on role and admin dashboard switcher
  const renderCurrentView = () => {
    if (userRole === 'hospital') {
      return <HospitalDashboard />;
    }

    if (userRole === 'patient') {
      return <PatientDashboard />;
    }

    // Default: Admin can access all 3 dashboards
    if (adminViewTab === 'hospital') {
      return <HospitalDashboard />;
    }
    if (adminViewTab === 'patient') {
      return <PatientDashboard />;
    }
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Floating Evaluation Simulation Bar (Visible across all roles for evaluation) */}
      <SimulationBar />

      {/* Main App Navigation with Role Switcher */}
      <Navigation onOpenDPDPModal={() => setIsDPDPOpen(true)} />

      {/* View Content */}
      <main className="flex-1 pb-16">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RESQLINK</span>
            <span>•</span>
            <span>K S School of Engineering and Management (KSSEM), Bengaluru</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>UN SDG 3 &amp; 11 Aligned</span>
            <span>•</span>
            <button
              className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-primary-foreground p-1.5 rounded-lg lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            <span>•</span>
            <span>MeitY AI Guidelines 2025</span>
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
      <PWAInstallPrompt />
      <CookieConsentManager />
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
