import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { BENGALURU_PRESET_LOCATIONS } from '../../data/bengaluruData';
import {
  Wifi,
  WifiOff,
  Signal,
  MapPin,
  Volume2,
  VolumeX,
  Eye,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

export const SimulationBar: React.FC = () => {
  const {
    networkTier,
    setNetworkTier,
    selectedPreset,
    setSelectedPreset,
    voiceGuidanceEnabled,
    toggleVoiceGuidance,
    assistiveHighContrast,
    toggleHighContrast,
    simulateExternalIncident,
    resetAllData,
  } = useResqLink();

  return (
    <aside aria-label="Evaluation simulation controls" className="bg-slate-950 border-b border-slate-800/90 text-xs text-slate-300 px-3 py-1.5 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Simulation Label */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-mono font-bold text-slate-200 tracking-wider flex items-center gap-1 text-[10px] uppercase">
            <Zap className="w-3 h-3 text-rose-400" />
            SIMULATOR:
          </span>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Network Tier Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 shadow-inner">
            <button
              onClick={() => setNetworkTier('5G_HIGH_SPEED')}
              className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all duration-150 cursor-pointer text-[11px] font-mono font-medium ${
                networkTier === '5G_HIGH_SPEED'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full 5G/4G Broadband connection"
            >
              <Wifi className="w-3 h-3" />
              <span>5G</span>
            </button>
            <button
              onClick={() => setNetworkTier('3G_SPOTTY')}
              className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all duration-150 cursor-pointer text-[11px] font-mono font-medium ${
                networkTier === '3G_SPOTTY'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Weak / Low Bandwidth connection with GPS jitter"
            >
              <Signal className="w-3 h-3" />
              <span>3G</span>
            </button>
            <button
              onClick={() => setNetworkTier('2G_SMS_FALLBACK')}
              className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all duration-150 cursor-pointer text-[11px] font-mono font-medium ${
                networkTier === '2G_SMS_FALLBACK'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Offline / 2G Cellular mode - Triggers Twilio SMS Fallback"
            >
              <WifiOff className="w-3 h-3" />
              <span>2G SMS</span>
            </button>
          </div>

          {/* Location Preset Picker */}
          <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg px-2 py-0.5 border border-slate-800 shadow-inner">
            <MapPin className="w-3 h-3 text-rose-400" />
            <select
              value={selectedPreset.name}
              onChange={(e) => {
                const found = BENGALURU_PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                if (found) setSelectedPreset(found);
              }}
              className="bg-transparent text-slate-200 text-[11px] font-mono font-medium focus:outline-none cursor-pointer pr-1"
            >
              {BENGALURU_PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-slate-900 text-slate-100 font-medium">
                  {loc.name} {loc.isPeripheral ? '(Outer)' : '(Central)'}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Guidance Toggle */}
          <button
            onClick={toggleVoiceGuidance}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 border text-[11px] font-mono font-medium transition-all cursor-pointer ${
              voiceGuidanceEnabled
                ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Multilingual TTS Audio Guidance"
          >
            {voiceGuidanceEnabled ? (
              <>
                <Volume2 className="w-3 h-3 text-indigo-400" />
                <span>TTS ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-slate-500" />
                <span>TTS OFF</span>
              </>
            )}
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 border text-[11px] font-mono font-medium transition-all cursor-pointer ${
              assistiveHighContrast
                ? 'bg-yellow-950/80 border-yellow-700/80 text-yellow-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="A11y High Contrast Theme"
          >
            <Eye className="w-3 h-3" />
            <span>High-Contrast</span>
          </button>
        </div>

        {/* Right: Simulation Actions */}
        <div className="flex items-center gap-1.5">
          {/* Inject Incident */}
          <button
            onClick={simulateExternalIncident}
            className="px-2.5 py-0.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg flex items-center gap-1 text-[11px] font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Inject an external emergency incident into CAD"
          >
            <PlusCircle className="w-3 h-3 text-rose-400" />
            <span>+ INJECT INCIDENT</span>
          </button>

          {/* Reset All */}
          <button
            onClick={resetAllData}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-all active:scale-95 cursor-pointer"
            title="Reset active alert and restore default simulation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
