import React from 'react';
import { LocationLockState, GeoCoordinate } from '../../types';
import { CheckCircle2, Crosshair, Radio, ShieldCheck, AlertCircle, Satellite } from 'lucide-react';

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
    <div className="tactical-glass rounded-2xl p-3.5 text-xs shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isLocked
                ? 'bg-emerald-950 border border-emerald-700/80 text-emerald-400'
                : 'bg-amber-950 border border-amber-700/80 text-amber-400 animate-pulse'
            }`}
          >
            {isLocked ? <ShieldCheck className="w-4 h-4" /> : <Satellite className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-bold text-white font-mono flex items-center gap-1.5 text-xs">
              <span>TEMPORAL DUAL-LOCK VERIFICATION</span>
              {isLocked ? (
                <span className="text-[9px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600 font-bold">
                  VERIFIED &bull; NO FALSE TRIGGER
                </span>
              ) : (
                <span className="text-[9px] font-mono bg-amber-900/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-600 animate-pulse font-bold">
                  SAMPLING DUAL-READ
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
              {isLocked
                ? `GPS fix stabilized (Radius: ±${Math.round(location.accuracy)}m, Confidence: ${confidenceScore}%)`
                : 'Acquiring multiple GPS fixes to prevent false dispatch...'}
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="text-right">
          <div className="text-base font-mono font-extrabold text-emerald-400">{confidenceScore}%</div>
          <div className="text-[8px] font-mono uppercase tracking-widest text-slate-400">LOCK CONFIDENCE</div>
        </div>
      </div>

      {/* Dual Sample Consistency Pills */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-slate-800">
        <div
          className={`p-2 rounded-xl border flex items-center justify-between text-xs font-mono ${
            samples.length >= 1
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[11px]">SAMPLE 1: INITIAL FIX</span>
          </div>
          {samples.length >= 1 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <span className="text-[10px] text-slate-400">ACQUIRING...</span>
          )}
        </div>

        <div
          className={`p-2 rounded-xl border flex items-center justify-between text-xs font-mono ${
            samples.length >= 2
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[11px]">SAMPLE 2: DELTA &lt;15M</span>
          </div>
          {samples.length >= 2 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Coordinates & Provider Badge */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800">
        <span>
          LAT: {location.latitude.toFixed(5)} &bull; LNG: {location.longitude.toFixed(5)} &bull; ACC: ±{Math.round(location.accuracy)}m
        </span>
        <span className="text-cyan-400 font-bold">
          GNSS: {location.provider.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};
