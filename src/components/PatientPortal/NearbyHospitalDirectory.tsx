import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import {
  Building2,
  Bed,
  Wind,
  Phone,
  Shield,
  Navigation as NavIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { calculateHaversineDistanceMeters } from '../../services/locationLockService';

export const NearbyHospitalDirectory: React.FC = () => {
  const { hospitals, currentLocation, selectedPreset, hospitalStatuses } = useResqLink();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTraumaLevel, setFilterTraumaLevel] = useState<number | 'ALL'>('ALL');

  const userCoord = currentLocation || {
    latitude: selectedPreset.latitude,
    longitude: selectedPreset.longitude,
  };

  const hospitalsWithDistance = hospitals.map((hospital) => {
    const distanceMeters = calculateHaversineDistanceMeters(
      userCoord.latitude,
      userCoord.longitude,
      hospital.latitude,
      hospital.longitude
    );
    const distanceKm = distanceMeters / 1000;
    const status = hospitalStatuses[hospital.id];
    return {
      ...hospital,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      divertStatus: status?.divertStatus ?? false,
      traumaTeamStandby: status?.traumaTeamStandby ?? true,
    };
  });

  const filteredHospitals = hospitalsWithDistance
    .filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrauma =
        filterTraumaLevel === 'ALL' || h.traumaLevel === filterTraumaLevel;
      return matchesSearch && matchesTrauma;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="space-y-4 font-mono">
      {/* Search & Filter Header Bar */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bengaluru ER centers, trauma hospitals, or wards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-rose-500 placeholder-slate-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TRAUMA TIER:</span>
            {(['ALL', 1, 2] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTraumaLevel(tier)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterTraumaLevel === tier
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tier === 'ALL' ? 'ALL TIERS' : `LEVEL ${tier}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredHospitals.map((hospital) => {
          const isCriticalBed = hospital.icuBedsAvailable <= 3;
          const isFull = hospital.icuBedsAvailable === 0 || hospital.divertStatus;

          return (
            <div
              key={hospital.id}
              className={`double-bezel transition-transform duration-200 hover:-translate-y-0.5 ${
                isFull ? 'opacity-85' : ''
              }`}
            >
              <div
                className={`double-bezel-inner p-4 flex flex-col justify-between h-full space-y-3.5 relative overflow-hidden ${
                  isFull ? 'bg-amber-950/20' : 'bg-slate-950'
                }`}
              >
                {/* Divert Warning Bar */}
                {isFull && (
                  <div className="absolute top-0 right-0 left-0 bg-amber-500/20 border-b border-amber-500/40 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{hospital.divertStatus ? 'ER UNDER DIVERSION' : 'ICU BEDS AT CAPACITY'}</span>
                  </div>
                )}

                <div className={`space-y-3 ${isFull ? 'pt-3' : ''}`}>
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{hospital.name}</h3>
                      <p className="text-[11px] text-slate-400">{hospital.area}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-rose-400 shadow-sm">
                      {hospital.distanceKm} km
                    </span>
                  </div>

                  {/* Bed & Trauma Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* ICU Beds Status */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        hospital.icuBedsAvailable > 8
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : hospital.icuBedsAvailable > 0
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      <Bed className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider opacity-80">
                          ICU BEDS
                        </div>
                        <div className="text-sm font-bold">{hospital.icuBedsAvailable} OPEN</div>
                      </div>
                    </div>

                    {/* Trauma Tier */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-slate-200">
                      <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-500">
                          TRAUMA TIER
                        </div>
                        <div className="text-[11px] font-bold text-cyan-300">
                          LEVEL {hospital.traumaLevel} {hospital.traumaLevel === 1 ? 'TERTIARY' : 'SECONDARY'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liquid Oxygen and ER Readiness */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Wind className={`w-3 h-3 ${hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
                      {hospital.oxygenAvailable ? 'O2 PLANT READY' : 'O2 REFILL REQ'}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      24X7 ER INTAKE
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`tel:${hospital.contactNumber}`}
                    className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 rounded-xl text-[11px] font-bold transition active:scale-95 shadow-sm"
                  >
                    <span>EMERGENCY HOTLINE</span>
                    <Phone className="w-3 h-3 text-emerald-400" />
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl flex items-center justify-center transition shadow-sm hover:text-white"
                    title="Open in Maps"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
