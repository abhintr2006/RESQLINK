import React, { useEffect, useRef } from 'react';
import { EmergencyAlert, LanguageCode } from '../../types';
import L from 'leaflet';
import {
  PhoneCall,
  Clock,
  Navigation as NavIcon,
  ShieldCheck,
  Building2,
  AlertOctagon,
  Activity,
  Zap,
} from 'lucide-react';

interface LiveTrackingCardProps {
  alert: EmergencyAlert;
  language: LanguageCode;
  onCancel: (id: string) => void;
}

export const LiveTrackingCard: React.FC<LiveTrackingCardProps> = ({
  alert,
  onCancel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const responderMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const { assignedResponder, assignedHospital, location, estimatedArrivalMinutes } = alert;

  // Initialize or update interactive Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const citizenLat = location.latitude;
      const citizenLng = location.longitude;

      const map = L.map(mapContainerRef.current, {
        center: [citizenLat, citizenLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse icon for Citizen in Distress
      const citizenIcon = L.divIcon({
        className: 'custom-citizen-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute w-8 h-8 bg-rose-500 rounded-full animate-ping opacity-75"></span>
            <span class="relative w-5 h-5 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-bold font-mono shadow-lg">SOS</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([citizenLat, citizenLng], { icon: citizenIcon })
        .addTo(map)
        .bindPopup('<b>Distress Origin (Locked)</b><br/>Emergency in progress');

      // Accuracy circle
      L.circle([citizenLat, citizenLng], {
        radius: location.accuracy || 20,
        color: '#f43f5e',
        fillColor: '#f43f5e',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);

      // Hospital Marker
      if (assignedHospital) {
        const hospitalIcon = L.divIcon({
          className: 'custom-hosp-marker',
          html: `
            <div class="w-7 h-7 bg-indigo-600 border-2 border-white rounded-lg flex items-center justify-center text-white font-bold shadow-md text-xs">
              🏥
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([assignedHospital.latitude, assignedHospital.longitude], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`<b>${assignedHospital.name}</b><br/>Trauma Unit Level ${assignedHospital.traumaLevel}`);
      }

      // Responder Marker
      if (assignedResponder) {
        const respLat = assignedResponder.currentLocation.latitude;
        const respLng = assignedResponder.currentLocation.longitude;

        const ambulanceIcon = L.divIcon({
          className: 'custom-ambulance-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <span class="absolute w-8 h-8 bg-emerald-400 rounded-full animate-ping opacity-60"></span>
              <span class="relative w-7 h-7 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-xs text-white shadow-lg">🚑</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const respMarker = L.marker([respLat, respLng], { icon: ambulanceIcon })
          .addTo(map)
          .bindPopup(`<b>${assignedResponder.name}</b><br/>Driver: ${assignedResponder.driverName}`);
        responderMarkerRef.current = respMarker;

        // Route Polyline connecting Responder -> Citizen -> Hospital
        const routePoints: [number, number][] = [
          [respLat, respLng],
          [citizenLat, citizenLng],
        ];
        if (assignedHospital) {
          routePoints.push([assignedHospital.latitude, assignedHospital.longitude]);
        }

        const polyline = L.polyline(routePoints, {
          color: '#10B981',
          weight: 4,
          dashArray: '6, 6',
          opacity: 0.9,
        }).addTo(map);
        routePolylineRef.current = polyline;

        // Fit map bounds
        map.fitBounds(L.latLngBounds(routePoints), { padding: [30, 30] });
      }

      mapInstanceRef.current = map;
    } else if (assignedResponder && responderMarkerRef.current) {
      // Update dynamic responder position
      const newLat = assignedResponder.currentLocation.latitude;
      const newLng = assignedResponder.currentLocation.longitude;
      responderMarkerRef.current.setLatLng([newLat, newLng]);

      if (routePolylineRef.current) {
        const citizenLat = location.latitude;
        const citizenLng = location.longitude;
        routePolylineRef.current.setLatLngs([
          [newLat, newLng],
          [citizenLat, citizenLng],
          ...(assignedHospital ? [[assignedHospital.latitude, assignedHospital.longitude] as [number, number]] : []),
        ]);
      }
    }
  }, [assignedResponder, assignedHospital, location]);

  const stages = [
    { label: 'Alerting', status: 'ALERTING', done: true },
    { label: 'Locked', status: 'CONFIRMED', done: true },
    { label: 'Dispatched', status: 'DISPATCHED', done: true },
    { label: 'En Route', status: 'EN_ROUTE', done: alert.status === 'EN_ROUTE' || alert.status === 'ON_SCENE' },
  ];

  return (
    <div className="double-bezel shadow-2xl overflow-hidden">
      <div className="double-bezel-inner">
        {/* 4-Stage Tactical Pipeline */}
        <div className="bg-slate-950/90 p-3.5 border-b border-slate-800">
          <div className="flex items-center justify-between gap-1 mb-3">
            {stages.map((stage, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition ${
                      stage.done
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm shadow-emerald-500/50'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {stage.done ? '✓' : idx + 1}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-300 mt-1 uppercase tracking-wider">{stage.label}</span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-3.5 transition ${
                      stages[idx + 1].done ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Live ETA Banner */}
          <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-700/60 rounded-xl p-3 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <Clock className="w-4.5 h-4.5 text-emerald-400 animate-spin" />
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-emerald-300">
                  ESTIMATED TIME TO ARRIVAL
                </div>
                <div className="text-xl font-mono font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  ~ {estimatedArrivalMinutes} MIN <span className="text-xs font-normal text-slate-400 font-sans">(MODERATE Traffic)</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-mono font-bold bg-emerald-900/80 text-emerald-200 px-2.5 py-1 rounded-md border border-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PRIORITY 1 DISPATCH
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Tactical Map */}
        <div className="relative h-64 w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute top-2.5 right-2.5 z-[400] bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1.5 shadow-md">
            <NavIcon className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LIVE FLEET TELEMETRY</span>
          </div>
        </div>

        {/* Responder & Hospital Details */}
        <div className="p-3.5 sm:p-4 space-y-2.5 bg-slate-900/60">
          {assignedResponder && (
            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
                  🚑
                </div>
                <div>
                  <div className="font-bold text-xs text-white font-mono flex items-center gap-1.5">
                    <span>{assignedResponder.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 font-bold">
                      {assignedResponder.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Driver: <span className="text-slate-200 font-medium">{assignedResponder.driverName}</span> &bull; Veh: <span className="font-mono text-slate-300">{assignedResponder.vehicleNumber}</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${assignedResponder.contactNumber}`}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>CALL CREW</span>
              </a>
            </div>
          )}

          {assignedHospital && (
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-slate-200 text-xs">{assignedHospital.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {assignedHospital.area} &bull; Trauma L{assignedHospital.traumaLevel} &bull; {assignedHospital.icuBedsAvailable} ICU Beds Avail
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                TRAUMA NOTIFIED
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>INCIDENT ID: <strong className="text-white">{alert.id}</strong></span>
            </div>

            <button
              onClick={() => onCancel(alert.id)}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-rose-950/80 hover:text-rose-300 text-slate-300 rounded-lg text-[11px] font-mono font-semibold border border-slate-700 flex items-center gap-1 transition cursor-pointer"
            >
              <AlertOctagon className="w-3 h-3 text-rose-400" />
              <span>CANCEL SOS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
