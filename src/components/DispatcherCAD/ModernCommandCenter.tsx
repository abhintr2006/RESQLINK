import React, { useMemo, useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Activity,
  Ambulance,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  Filter,
  Gauge,
  Layers3,
  MapPin,
  Maximize2,
  Radio,
  Search,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';

type Priority = 'Critical' | 'Moderate' | 'Minor';

interface IncidentItem {
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
}

export const ModernCommandCenter: React.FC = () => {
  const {
    activeAlert,
    alertHistory,
    responders,
    hospitals,
    auditLogs,
    updateAlertStatus,
  } = useResqLink();

  // Combine real context alerts with rich city demo feed
  const baseIncidents: IncidentItem[] = useMemo(() => {
    const liveItems: IncidentItem[] = [];

    if (activeAlert) {
      liveItems.push({
        id: activeAlert.shortCode || 'RSQ-LIVE',
        type: activeAlert.category.replace('_', ' '),
        location: activeAlert.equityMetadata?.wardName || 'Bengaluru Central',
        time: 'Just now',
        distance: '1.8 km',
        priority: 'Critical',
        patient: activeAlert.citizenName ? `${activeAlert.citizenName}` : '1 Patient',
        detail: activeAlert.description || 'Emergency SOS signal received via CAD.',
        unit: activeAlert.assignedResponder?.name || 'AMB-01',
        eta: `${activeAlert.estimatedArrivalMinutes || 4}:00`,
        hospital: activeAlert.assignedHospital?.name || 'Manipal Hospital',
        coordinates: `${activeAlert.location.latitude.toFixed(4)}° N, ${activeAlert.location.longitude.toFixed(4)}° E`,
      });
    }

    const demoItems: IncidentItem[] = [
      {
        id: 'RSQ-2841',
        type: 'Road traffic collision',
        location: 'Outer Ring Road · HSR Layout',
        time: '2 min ago',
        distance: '2.4 km',
        priority: 'Critical',
        patient: '2 patients · adult',
        detail: 'Possible entrapment reported. ALS unit requested.',
        unit: 'AMB-07',
        eta: '04:20',
        hospital: 'Sakra World Hospital',
        coordinates: '12.9116° N, 77.6474° E',
      },
      {
        id: 'RSQ-2839',
        type: 'Cardiac emergency',
        location: 'Indiranagar · 12th Main',
        time: '5 min ago',
        distance: '5.1 km',
        priority: 'Critical',
        patient: '1 patient · 64 yrs',
        detail: 'Chest pain and shortness of breath. Medical profile available.',
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
        hospital: 'St. Johns Medical College',
        coordinates: '12.9352° N, 77.6245° E',
      },
      {
        id: 'RSQ-2834',
        type: 'Respiratory distress',
        location: 'Jayanagar · 4th Block',
        time: '12 min ago',
        distance: '7.2 km',
        priority: 'Moderate',
        patient: '1 patient · 42 yrs',
        detail: 'Asthma exacerbation. Oxygen support dispatched.',
        unit: 'AMB-09',
        eta: '11:30',
        hospital: 'BGS Gleneagles Global',
        coordinates: '12.9250° N, 77.5938° E',
      },
      {
        id: 'RSQ-2828',
        type: 'Minor trauma',
        location: 'Whitefield · ITPL Main Road',
        time: '18 min ago',
        distance: '12.6 km',
        priority: 'Minor',
        patient: '1 patient · adult',
        detail: 'Bleeding controlled. Non-urgent transport underway.',
        unit: 'AMB-15',
        eta: '15:00',
        hospital: 'Columbia Asia Hospital',
        coordinates: '12.9869° N, 77.7491° E',
      },
    ];

    return [...liveItems, ...demoItems];
  }, [activeAlert]);

  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string>(baseIncidents[0]?.id || 'RSQ-2841');
  const [layersOpen, setLayersOpen] = useState(false);
  const [dispatchedIds, setDispatchedIds] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('Live sync active · CAD WebSocket nominal');

  const filteredIncidents = useMemo(() => {
    if (activeFilter === 'All') return baseIncidents;
    return baseIncidents.filter((inc) => inc.priority === activeFilter);
  }, [activeFilter, baseIncidents]);

  const selectedIncident = useMemo(() => {
    return baseIncidents.find((i) => i.id === selectedId) || baseIncidents[0];
  }, [baseIncidents, selectedId]);

  const handleDispatch = (id: string) => {
    setDispatchedIds((prev) => ({ ...prev, [id]: true }));
    setNotice(`${selectedIncident.unit} officially dispatched to ${id} · ETA ${selectedIncident.eta}`);
    if (activeAlert && activeAlert.shortCode === id) {
      updateAlertStatus(activeAlert.id, 'DISPATCHED');
    }
  };

  const availableUnits = responders.filter((r) => r.isAvailable).length;
  const totalBeds = hospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

  return (
    <div className="space-y-6">
      {/* Subheader and notice bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-status-green">
            <span className="size-2 rounded-full bg-status-green animate-pulse" />
            <span>{notice}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Autonomous CAD Dispatch Grid &bull; Bengaluru Metropolitan Shift
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by ID or location..."
              className="h-8 rounded-xl border border-slate-800 bg-slate-950/80 pl-8 pr-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => setNotice('Dynamic filter cache refreshed')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <div className="flex items-center justify-between text-safety-orange">
            <div className="size-8 rounded-xl bg-safety-orange/10 flex items-center justify-center">
              <Siren className="size-4" />
            </div>
            <span className="text-[9px] font-mono font-bold text-safety-orange">LIVE</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            0{filteredIncidents.length}
          </div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Active Incidents</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Prioritized by AI Triage</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400">
            <div className="size-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Ambulance className="size-4" />
            </div>
            <span className="text-[9px] font-mono font-bold text-indigo-400">FLEET</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {availableUnits} / {responders.length}
          </div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Units Available</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ALS &amp; BLS Vehicles</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <div className="flex items-center justify-between text-status-green">
            <div className="size-8 rounded-xl bg-status-green/10 flex items-center justify-center">
              <Gauge className="size-4" />
            </div>
            <span className="text-[9px] font-mono font-bold text-status-green">TARGET &lt; 10m</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            08:42
          </div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Avg. Response Time</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">14% faster than baseline</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <div className="flex items-center justify-between text-chart-violet">
            <div className="size-8 rounded-xl bg-chart-violet/10 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
            <span className="text-[9px] font-mono font-bold text-chart-violet">ER CAPACITY</span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            {totalBeds} BEDS
          </div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">ICU Trauma Capacity</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Across 12 network centers</div>
        </div>
      </div>

      {/* Main Grid: Left Map + Fleet readiness, Right Queue + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Response Map and Fleet Readiness */}
        <div className="xl:col-span-7 space-y-4">
          {/* Response Map Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <h3 className="font-mono font-bold text-sm text-white">Bengaluru CAD Vector Map</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-status-green/20 text-status-green border border-status-green/40">
                  REAL-TIME
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotice('Map centered on active incidents')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Center map"
                >
                  <Crosshair className="size-4" />
                </button>
              </div>
            </div>

            {/* Tactical Vector Map */}
            <div className="relative h-[300px] sm:h-[380px] bg-[#090d16] overflow-hidden">
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
                <g className="fill-none stroke-safety-orange" strokeWidth="3" strokeDasharray="7 8">
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

                {/* Clickable incident markers */}
                {baseIncidents.map((inc, i) => {
                  const coords = [
                    { x: 55, y: 54 },
                    { x: 70, y: 26 },
                    { x: 40, y: 68 },
                    { x: 24, y: 36 },
                    { x: 78, y: 62 },
                    { x: 48, y: 32 },
                  ][i % 6];
                  const isSelected = inc.id === selectedId;

                  return (
                    <g
                      key={inc.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(inc.id)}
                    >
                      <circle
                        cx={`${coords.x}%`}
                        cy={`${coords.y}%`}
                        r={isSelected ? 18 : 12}
                        fill={inc.priority === 'Critical' ? 'rgba(249,115,22,0.2)' : 'rgba(234,179,8,0.2)'}
                        stroke={isSelected ? '#ffffff' : inc.priority === 'Critical' ? '#f97316' : '#eab308'}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <circle
                        cx={`${coords.x}%`}
                        cy={`${coords.y}%`}
                        r="6"
                        fill={inc.priority === 'Critical' ? '#f97316' : '#eab308'}
                      />
                    </g>
                  );
                })}

                {/* Active Ambulances */}
                {[{ x: 62, y: 42 }, { x: 34, y: 40 }, { x: 48, y: 78 }].map((u, i) => (
                  <g key={i}>
                    <circle cx={`${u.x}%`} cy={`${u.y}%`} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  </g>
                ))}

                {/* Hospitals */}
                {[{ x: 52, y: 30 }, { x: 80, y: 38 }, { x: 28, y: 76 }].map((h, i) => (
                  <g key={i}>
                    <rect x={`${h.x * 9 - 5}`} y={`${h.y * 4.9 - 5}`} width="10" height="10" rx="2" fill="#22c55e" />
                  </g>
                ))}
              </svg>

              {/* Map Floating Legend */}
              <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-safety-orange" />
                  <span>Critical Emergency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-yellow" />
                  <span>Moderate Triage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  <span>ALS Unit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded bg-status-green" />
                  <span>Trauma Center</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Readiness Sub-Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase">Fleet Readiness Status</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Availability breakdown across Bengaluru emergency vehicle classes</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">82% Operational</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                  <Stethoscope className="size-4" />
                  <span>Advanced Life Support</span>
                </div>
                <div className="mt-2 text-lg font-black font-mono text-white">6 / 8 Units</div>
                <div className="mt-1 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 text-safety-orange text-xs font-mono font-bold">
                  <Ambulance className="size-4" />
                  <span>Basic Life Support</span>
                </div>
                <div className="mt-2 text-lg font-black font-mono text-white">8 / 10 Units</div>
                <div className="mt-1 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-safety-orange h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 text-status-green text-xs font-mono font-bold">
                  <Radio className="size-4" />
                  <span>First Responder Bikes</span>
                </div>
                <div className="mt-2 text-lg font-black font-mono text-white">4 / 4 Units</div>
                <div className="mt-1 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-status-green h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Incident Queue & Response Detail */}
        <div className="xl:col-span-5 space-y-4">
          {/* Incident Queue */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono font-bold text-sm text-white">Active Incident Queue</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Prioritized by severity &amp; arrival SLA</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {filteredIncidents.length} IN QUEUE
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-3 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                {(['All', 'Critical', 'Moderate', 'Minor'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/80 max-h-[280px] overflow-y-auto">
              {filteredIncidents.map((incident) => {
                const isSelected = incident.id === selectedId;
                const isDispatched = dispatchedIds[incident.id];

                return (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedId(incident.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-4 border-rose-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white truncate">
                          {incident.type}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            incident.priority === 'Critical'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {incident.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate flex items-center gap-1">
                        <MapPin className="size-3 text-slate-500 shrink-0" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {incident.id} &bull; {incident.distance} &bull; {incident.time}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-safety-orange">
                        ETA {incident.eta}
                      </div>
                      {isDispatched && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 mt-1">
                          <Check className="size-3" /> Dispatched
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Response Detail & Action Card */}
          {selectedIncident && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-white">
                      {selectedIncident.type}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {selectedIncident.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-1">
                    <MapPin className="size-3.5 text-rose-400" />
                    <span>{selectedIncident.location}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-slate-500 uppercase">ARRIVAL SLA</div>
                  <div className="text-base font-bold text-safety-orange">{selectedIncident.eta}</div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">PATIENT PROFILE</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedIncident.patient}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">DISTANCE VECTOR</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedIncident.distance}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">GPS LOCK</div>
                  <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Check className="size-3 text-emerald-400" /> Verified
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">ASSIGNED FLEET</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedIncident.unit}</div>
                </div>
              </div>

              {/* Dispatch Note */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="font-bold text-rose-400">CAD Dispatch Note: </span>
                {selectedIncident.detail}
              </div>

              {/* Destination Hospital */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Building2 className="size-5 text-indigo-400 shrink-0" />
                <div className="min-w-0 font-mono text-xs">
                  <div className="font-bold text-white truncate">{selectedIncident.hospital}</div>
                  <div className="text-[10px] text-slate-400">Trauma Level 1 &bull; ER Bay Ready</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDispatch(selectedIncident.id)}
                disabled={dispatchedIds[selectedIncident.id]}
                className={`w-full py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  dispatchedIds[selectedIncident.id]
                    ? 'bg-emerald-950/80 border border-emerald-700/80 text-emerald-300'
                    : 'bg-gradient-to-r from-safety-orange to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white shadow-lg shadow-orange-600/30 active:scale-[0.98]'
                }`}
              >
                {dispatchedIds[selectedIncident.id] ? (
                  <>
                    <Check className="size-4" />
                    <span>UNIT {selectedIncident.unit} EN ROUTE</span>
                  </>
                ) : (
                  <>
                    <Siren className="size-4" />
                    <span>AUTHORIZE &amp; DISPATCH {selectedIncident.unit}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
