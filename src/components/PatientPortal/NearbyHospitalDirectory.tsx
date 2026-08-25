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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospitals by name, area, or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Trauma Tier:</span>
          {(['ALL', 1, 2] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTraumaLevel(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterTraumaLevel === tier
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : `Level ${tier}`}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map((hospital) => {
          const isCriticalBed = hospital.icuBedsAvailable <= 3;
          const isFull = hospital.icuBedsAvailable === 0 || hospital.divertStatus;

          return (
            <div
              key={hospital.id}
              className={`bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-slate-700 relative overflow-hidden ${
                isFull
                  ? 'border-amber-900/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Divert Banner if full */}
              {isFull && (
                <div className="absolute top-0 right-0 left-0 bg-amber-500/20 border-b border-amber-500/30 px-3 py-1 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{hospital.divertStatus ? 'ER Under Diversion Protocol' : 'ICU Capacity Full'}</span>
                </div>
              )}

              <div className={`space-y-3 ${isFull ? 'pt-4' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{hospital.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{hospital.area}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-rose-400">
                    {hospital.distanceKm} km away
                  </span>
                </div>

                {/* Badges / Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {/* ICU Beds */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      hospital.icuBedsAvailable > 8
                        ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                        : hospital.icuBedsAvailable > 0
                        ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                        : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <Bed className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        ICU Beds
                      </div>
                      <div className="text-sm font-extrabold">{hospital.icuBedsAvailable} Available</div>
                    </div>
                  </div>

                  {/* Trauma Tier */}
                  <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-slate-300">
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Trauma Tier
                      </div>
                      <div className="text-xs font-bold text-indigo-300">
                        Level {hospital.traumaLevel} {hospital.traumaLevel === 1 ? 'Tertiary' : 'Secondary'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oxygen & Readiness status */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Wind className={`w-3.5 h-3.5 ${hospital.oxygenAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
                    {hospital.oxygenAvailable ? 'Liquid Oxygen Ready' : 'Oxygen Refill Needed'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    24x7 ER Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 flex items-center gap-2">
                <a
                  href={`tel:${hospital.contactNumber}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Emergency Desk</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
                  title="Navigate with Maps"
                >
                  <NavIcon className="w-4 h-4 text-rose-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
