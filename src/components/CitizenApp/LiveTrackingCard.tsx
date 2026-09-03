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
            <span class="relative w-5 h-5 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg">SOS</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([citizenLat, citizenLng], { icon: citizenIcon })
        .addTo(map)
        .bindPopup('<b>Your Location (Locked)</b><br/>Emergency in progress');

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
          dashArray: '8, 8',
          opacity: 0.85,
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
    { label: '1. Alerting', status: 'ALERTING', done: true },
    { label: '2. Confirmed', status: 'CONFIRMED', done: true },
    { label: '3. Dispatched', status: 'DISPATCHED', done: true },
    { label: '4. En Route', status: 'EN_ROUTE', done: alert.status === 'EN_ROUTE' || alert.status === 'ON_SCENE' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 3-Stage Progress Bar from Paper Section 3.3 */}
      <div className="bg-slate-950 p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between gap-1 mb-2">
          {stages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    stage.done
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {stage.done ? '✓' : idx + 1}
                </div>
                <span className="text-[10px] font-semibold text-slate-300 mt-1">{stage.label}</span>
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mb-3 transition ${
                    stages[idx + 1].done ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Live ETA Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-800/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                ESTIMATED ARRIVAL TIME
              </div>
              <div className="text-xl font-black text-white tracking-tight">
                ~ {estimatedArrivalMinutes} Minutes
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
              SLA: Priority 1
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative h-60 w-full bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 right-2 z-[400] bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1 shadow-md">
          <NavIcon className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Live GPS Telemetry</span>
        </div>
      </div>

      {/* Responder & Hospital Details */}
      <div className="p-4 space-y-3">
        {assignedResponder && (
          <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                🚑
              </div>
              <div>
                <div className="font-bold text-sm text-white">{assignedResponder.name}</div>
                <div className="text-xs text-slate-400">
                  Driver: <span className="text-slate-200 font-medium">{assignedResponder.driverName}</span> • Veh: {assignedResponder.vehicleNumber}
                </div>
              </div>
            </div>

            <a
              href={`tel:${assignedResponder.contactNumber}`}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Crew</span>
            </a>
          </div>
        )}

        {assignedHospital && (
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="font-bold text-slate-200">{assignedHospital.name}</div>
                <div className="text-[11px] text-slate-400">
                  {assignedHospital.area} • Trauma Level {assignedHospital.traumaLevel} • {assignedHospital.icuBedsAvailable} ICU Beds
                </div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
              Trauma Notified
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Incident ID: <strong className="text-white font-mono">{alert.id}</strong></span>
          </div>

          <button
            onClick={() => onCancel(alert.id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancel SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
