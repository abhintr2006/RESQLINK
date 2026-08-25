import React from 'react';
import { LocationLockState, GeoCoordinate } from '../../types';
import { CheckCircle2, Crosshair, Radio, ShieldCheck, AlertCircle } from 'lucide-react';

interface LocationLockIndicatorProps {
  lockState: LocationLockState;
  location: GeoCoordinate;
  language: string;
}

export const LocationLockIndicator: React.FC<LocationLockIndicatorProps> = ({
  lockState,
  location,
}) => {
  const { isLocked, samples, confidenceScore } = lockState;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isLocked
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                : 'bg-amber-950 border border-amber-700 text-amber-400 animate-pulse'
            }`}
          >
            {isLocked ? <ShieldCheck className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Location-Lock Protocol</span>
              {isLocked ? (
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-700">
                  LOCKED & VERIFIED
                </span>
              ) : (
                <span className="text-[10px] bg-amber-900/60 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-700 animate-pulse">
                  SAMPLING DUAL-READ
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              {isLocked
                ? `GPS fix stabilized (Accuracy: ±${Math.round(location.accuracy)}m, Confidence: ${confidenceScore}%)`
                : 'Acquiring multiple GPS fixes to prevent false dispatch...'}
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="text-right">
          <div className="text-sm font-extrabold text-emerald-400">{confidenceScore}%</div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400">Lock Score</div>
        </div>
      </div>

      {/* Dual Sample Consistency Pills */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
        <div
          className={`p-2 rounded-lg border flex items-center justify-between ${
            samples.length >= 1
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Sample 1: Initial Fix</span>
          </div>
          {samples.length >= 1 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <span className="text-[10px]">Reading...</span>
          )}
        </div>

        <div
          className={`p-2 rounded-lg border flex items-center justify-between ${
            samples.length >= 2
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Sample 2: Delta &lt;15m</span>
          </div>
          {samples.length >= 2 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Coordinates & Provider Badge */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800/60">
        <span>
          LAT: {location.latitude.toFixed(5)} | LNG: {location.longitude.toFixed(5)}
        </span>
        <span className="text-indigo-400 font-sans font-semibold">
          Source: {location.provider.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};
