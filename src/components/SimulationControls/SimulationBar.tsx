import React from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { BENGALURU_PRESET_LOCATIONS } from '../../data/bengaluruData';
import { NetworkTier } from '../../types';
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
    <aside aria-label="Evaluation simulation controls" className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-xs text-slate-300 px-3 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Simulation Label */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            EVALUATION SIMULATOR:
          </span>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Network Tier Switcher */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setNetworkTier('5G_HIGH_SPEED')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                networkTier === '5G_HIGH_SPEED'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full 5G/4G Broadband connection"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>5G Data</span>
            </button>
            <button
              onClick={() => setNetworkTier('3G_SPOTTY')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                networkTier === '3G_SPOTTY'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Weak / Low Bandwidth connection with GPS jitter"
            >
              <Signal className="w-3.5 h-3.5" />
              <span>3G Weak</span>
            </button>
            <button
              onClick={() => setNetworkTier('2G_SMS_FALLBACK')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition ${
                networkTier === '2G_SMS_FALLBACK'
                  ? 'bg-rose-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Offline / 2G Cellular mode - Triggers Twilio SMS Fallback"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>2G SMS Fallback</span>
            </button>
          </div>

          {/* Location Preset Picker */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-1 border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={selectedPreset.name}
              onChange={(e) => {
                const found = BENGALURU_PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                if (found) setSelectedPreset(found);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
            >
              {BENGALURU_PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-slate-900 text-white">
                  {loc.name} {loc.isPeripheral ? '(Outer Ward)' : '(Central)'}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Guidance Toggle */}
          <button
            onClick={toggleVoiceGuidance}
            className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition ${
              voiceGuidanceEnabled
                ? 'bg-indigo-900/60 border-indigo-600 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Accessibility Audio Speech Synthesis"
          >
            {voiceGuidanceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>Voice TTS</span>
          </button>

          {/* High Contrast Mode */}
          <button
            onClick={toggleHighContrast}
            className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition ${
              assistiveHighContrast
                ? 'bg-yellow-900/60 border-yellow-500 text-yellow-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="High-Contrast Mode for Differently-Abled Users"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>High-Contrast</span>
          </button>
        </div>

        {/* Right: Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={simulateExternalIncident}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            title="Inject a random SOS incident in Bengaluru for CAD testing"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Inject SOS</span>
          </button>

          <button
            onClick={resetAllData}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 transition"
            title="Reset system state and audit logs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
