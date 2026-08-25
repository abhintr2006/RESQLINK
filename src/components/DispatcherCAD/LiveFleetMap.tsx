import React, { useEffect, useRef } from 'react';
import { EmergencyAlert, Hospital, Responder } from '../../types';
import L from 'leaflet';
import { Layers, Radio, Shield, Ambulance } from 'lucide-react';

interface LiveFleetMapProps {
  alerts: EmergencyAlert[];
  responders: Responder[];
  hospitals: Hospital[];
  selectedAlert: EmergencyAlert | null;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({
  alerts,
  responders,
  hospitals,
  selectedAlert,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize and update CAD Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Bengaluru (Kanakapura / Jayanagar area)
      const map = L.map(mapContainerRef.current, {
        center: [12.925, 77.595],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | RESQLINK CAD',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear existing markers to re-render fresh telemetry
    markersGroup.clearLayers();

    // 1. Render Bengaluru Hospitals
    hospitals.forEach((hosp) => {
      const hospIcon = L.divIcon({
        className: 'custom-hosp-marker',
        html: `
          <div class="w-8 h-8 bg-slate-900 border-2 border-indigo-500 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
            <span class="text-xs">🏥</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([hosp.latitude, hosp.longitude], { icon: hospIcon });
      marker.bindPopup(`
        <div class="p-1 font-sans">
          <strong class="text-sm font-bold text-slate-900">${hosp.name}</strong><br/>
          <span class="text-xs text-slate-600">Area: ${hosp.area}</span><br/>
          <span class="text-xs font-semibold text-indigo-700">Trauma Level ${hosp.traumaLevel} • ${hosp.icuBedsAvailable} ICU Beds Available</span><br/>
          <span class="text-xs text-slate-500">Contact: ${hosp.contactNumber}</span>
        </div>
      `);
      markersGroup.addLayer(marker);
    });

    // 2. Render Responders (Ambulances & First Responder Bikes)
    responders.forEach((resp) => {
      const isAssigned = !resp.isAvailable;
      const respIcon = L.divIcon({
        className: 'custom-fleet-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            ${isAssigned ? '<span class="absolute w-8 h-8 bg-rose-500 rounded-full animate-ping opacity-60"></span>' : ''}
            <div class="w-7 h-7 ${
              isAssigned ? 'bg-rose-600' : 'bg-emerald-600'
            } border-2 border-white rounded-full flex items-center justify-center text-xs text-white shadow-md font-bold">
              ${resp.type === 'FIRST_RESPONDER_BIKE' ? '🏍️' : '🚑'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([resp.currentLocation.latitude, resp.currentLocation.longitude], {
        icon: respIcon,
      });
      marker.bindPopup(`
        <div class="p-1 font-sans">
          <strong class="text-sm font-bold text-slate-900">${resp.name}</strong><br/>
          <span class="text-xs text-slate-600">Vehicle: ${resp.vehicleNumber}</span><br/>
          <span class="text-xs text-slate-600">Driver: ${resp.driverName} (${resp.contactNumber})</span><br/>
          <span class="text-xs font-semibold ${isAssigned ? 'text-rose-600' : 'text-emerald-600'}">
            Status: ${isAssigned ? `DISPATCHED to #${resp.assignedIncidentId}` : 'AVAILABLE ON PATROL'}
          </span>
        </div>
      `);
      markersGroup.addLayer(marker);
    });

    // 3. Render Active Emergency Incident Hotspots
    alerts.forEach((alert) => {
      const citizenIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <span class="absolute w-10 h-10 bg-rose-600 rounded-full animate-ping opacity-80"></span>
            <div class="w-8 h-8 bg-rose-700 border-2 border-white rounded-full flex items-center justify-center text-xs text-white font-black shadow-xl">
              SOS
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([alert.location.latitude, alert.location.longitude], {
        icon: citizenIcon,
      });
      marker.bindPopup(`
        <div class="p-1 font-sans">
          <strong class="text-sm font-bold text-rose-700">🚨 EMERGENCY: ${alert.category.replace('_', ' ')}</strong><br/>
          <span class="text-xs text-slate-700">ID: ${alert.id} (${alert.equityMetadata.wardName})</span><br/>
          <span class="text-xs font-semibold text-slate-900">Patient: ${alert.citizenName || 'Citizen'} (${alert.citizenPhone || 'N/A'})</span><br/>
          <span class="text-xs text-indigo-700">Triage Urgency: ${alert.aiTriage.urgencyLevel}</span>
        </div>
      `);
      markersGroup.addLayer(marker);

      // Accuracy radius circle
      const circle = L.circle([alert.location.latitude, alert.location.longitude], {
        radius: alert.location.accuracy || 25,
        color: '#e11d48',
        fillColor: '#e11d48',
        fillOpacity: 0.15,
        weight: 1,
      });
      markersGroup.addLayer(circle);

      // Route Polyline if assigned
      if (alert.assignedResponder) {
        const route = L.polyline(
          [
            [alert.assignedResponder.currentLocation.latitude, alert.assignedResponder.currentLocation.longitude],
            [alert.location.latitude, alert.location.longitude],
          ],
          {
            color: '#10B981',
            weight: 3,
            dashArray: '6, 6',
          }
        );
        markersGroup.addLayer(route);
      }
    });

    // If an alert is selected, pan map to it
    if (selectedAlert) {
      map.flyTo([selectedAlert.location.latitude, selectedAlert.location.longitude], 14, {
        duration: 1.2,
      });
    }
  }, [alerts, responders, hospitals, selectedAlert]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-lg space-y-1.5 pointer-events-auto">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fleet CAD Map Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Active SOS (Locked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available Ambulance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Dispatched Unit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🏥</span>
            <span>Trauma Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};
