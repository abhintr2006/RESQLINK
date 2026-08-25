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
    <div className="space-y-8">
      {/* Search & Filter Header Bar */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bengaluru ER centers, trauma hospitals, or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 text-xs pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-rose-500 placeholder-slate-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trauma Tier:</span>
            {(['ALL', 1, 2] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTraumaLevel(tier)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  filterTraumaLevel === tier
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tier === 'ALL' ? 'All Tiers' : `Level ${tier}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => {
          const isCriticalBed = hospital.icuBedsAvailable <= 3;
          const isFull = hospital.icuBedsAvailable === 0 || hospital.divertStatus;

          return (
            <div
              key={hospital.id}
              className={`double-bezel transition-transform duration-300 hover:-translate-y-1 ${
                isFull ? 'opacity-85' : ''
              }`}
            >
              <div
                className={`double-bezel-inner p-6 flex flex-col justify-between h-full space-y-5 relative overflow-hidden ${
                  isFull ? 'bg-amber-950/20' : 'bg-slate-950'
                }`}
              >
                {/* Divert Warning Bar */}
                {isFull && (
                  <div className="absolute top-0 right-0 left-0 bg-amber-500/20 border-b border-amber-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{hospital.divertStatus ? 'ER Under Diversion' : 'ICU Beds Full'}</span>
                  </div>
                )}

                <div className={`space-y-4 ${isFull ? 'pt-4' : ''}`}>
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white line-clamp-1">{hospital.name}</h3>
                      <p className="text-xs text-slate-400">{hospital.area}</p>
                    </div>
                    <span className="shrink-0 text-xs font-black px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-rose-400 shadow-sm">
                      {hospital.distanceKm} km
                    </span>
                  </div>

                  {/* Bed & Trauma Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* ICU Beds Status */}
                    <div
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                        hospital.icuBedsAvailable > 8
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : hospital.icuBedsAvailable > 0
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      <Bed className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-black tracking-widest opacity-80">
                          ICU Beds
                        </div>
                        <div className="text-base font-black">{hospital.icuBedsAvailable} Open</div>
                      </div>
                    </div>

                    {/* Trauma Tier */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5 text-slate-200">
                      <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">
                          Trauma Tier
                        </div>
                        <div className="text-xs font-bold text-indigo-300">
                          Level {hospital.traumaLevel} {hospital.traumaLevel === 1 ? 'Tertiary' : 'Secondary'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liquid Oxygen and ER Readiness */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wind className={`w-3.5 h-3.5 ${hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
                      {hospital.oxygenAvailable ? 'Oxygen Ready' : 'Oxygen Limited'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      24x7 ER Active
                    </span>
                  </div>
                </div>

                {/* Action Buttons with Button-in-Button architecture */}
                <div className="pt-2 flex items-center gap-2.5">
                  <a
                    href={`tel:${hospital.contactNumber}`}
                    className="flex-1 flex items-center justify-between pl-4 pr-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 rounded-2xl text-xs font-bold transition-all duration-300 active:scale-[0.98] shadow-md"
                  >
                    <span>Emergency Hotline</span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md hover:text-white"
                    title="Open in Maps"
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
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
