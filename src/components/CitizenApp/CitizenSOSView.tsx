import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { EmergencyCategory } from '../../types';
import { LocationLockIndicator } from './LocationLockIndicator';
import { LiveTrackingCard } from './LiveTrackingCard';
import { AIFirstAidGuidance } from './AIFirstAidGuidance';
import {
  HeartPulse,
  Car,
  Brain,
  Wind,
  UserCheck,
  Stethoscope,
  MapPin,
  Wifi,
  WifiOff,
  Signal,
  ShieldCheck,
  AlertCircle,
  Volume2,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react';

export const CitizenSOSView: React.FC = () => {
  const {
    activeAlert,
    currentLocation,
    selectedPreset,
    networkTier,
    language,
    assistiveHighContrast,
    isSimulating,
    triggerSOS,
    cancelSOS,
  } = useResqLink();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('CARDIAC');

  const categories: { id: EmergencyCategory; label: { en: string; kn: string; hi: string }; icon: any; color: string; badge: string }[] = [
    {
      id: 'CARDIAC',
      label: { en: 'Cardiac Arrest', kn: 'ಹೃದಯಾಘಾತ', hi: 'हार्ट अटैक' },
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-950/60 border-rose-700/60',
      badge: 'ALS UNIT',
    },
    {
      id: 'TRAUMA_ACCIDENT',
      label: { en: 'Road Trauma', kn: 'ರಸ್ತೆ ಅಪಘಾತ', hi: 'सड़क दुर्घटना' },
      icon: Car,
      color: 'text-amber-400 bg-amber-950/60 border-amber-700/60',
      badge: 'TRAUMA L1',
    },
    {
      id: 'STROKE',
      label: { en: 'Acute Stroke', kn: 'ಪಾರ್ಶ್ವವಾಯು', hi: 'स्ट्रोक / लकवा' },
      icon: Brain,
      color: 'text-purple-400 bg-purple-950/60 border-purple-700/60',
      badge: 'NEURO HUB',
    },
    {
      id: 'RESPIRATORY',
      label: { en: 'Severe Dyspnea', kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ', hi: 'सांस की तकलीफ' },
      icon: Wind,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/60',
      badge: 'O2 SUPPORT',
    },
    {
      id: 'ELDERLY_FALL',
      label: { en: 'Elderly Injury', kn: 'ಹಿರಿಯ ನಾಗರಿಕರ ಪತನ', hi: 'बुजुर्गों का गिरना' },
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60',
      badge: 'BLS UNIT',
    },
    {
      id: 'GENERAL_MEDICAL',
      label: { en: 'General Urgent', kn: 'ಸಾಮಾನ್ಯ ತುರ್ತುಸ್ಥಿತಿ', hi: 'सामान्य आपातकाल' },
      icon: Stethoscope,
      color: 'text-blue-400 bg-blue-950/60 border-blue-700/60',
      badge: 'TRIAGE',
    },
  ];

  const handleSOSTrigger = () => {
    if (activeAlert) return;
    triggerSOS(selectedCategory);
  };

  const sosButtonTextByLang = {
    en: 'ACTIVATE EMERGENCY SOS',
    kn: 'ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ ಒತ್ತಿ',
    hi: 'आपातकालीन सहायता सक्रिय करें',
  };

  return (
    <div
      className={`max-w-3xl mx-auto space-y-5 transition-colors duration-200 ${
        assistiveHighContrast ? 'bg-black text-yellow-300' : ''
      }`}
    >
      {/* Top Telemetry & Location Bar */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shadow-md">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                  GPS TELEMETRY
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60">
                  {selectedPreset.isPeripheral ? 'PERIPHERAL WARD' : 'CORE WARD'}
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono tracking-tight">
                {selectedPreset.name} <span className="text-slate-500 text-xs font-normal">({selectedPreset.ward})</span>
              </div>
            </div>
          </div>

          {/* Network Tier Pill */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-slate-900 shadow-inner">
            {networkTier === '5G_HIGH_SPEED' && (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">5G BROADBAND</span>
              </>
            )}
            {networkTier === '3G_SPOTTY' && (
              <>
                <Signal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">3G SPOTTY (JITTER)</span>
              </>
            )}
            {networkTier === '2G_SMS_FALLBACK' && (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-rose-300">2G SMS FALLBACK ACTIVE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE EMERGENCY VIEW vs IDLE SOS TRIGGER */}
      {activeAlert ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Location Lock Feedback */}
          {activeAlert.locationLockState && (
            <LocationLockIndicator
              lockState={activeAlert.locationLockState}
              location={activeAlert.location}
              language={language}
            />
          )}

          {/* Real-Time Tracking & Map */}
          <LiveTrackingCard
            alert={activeAlert}
            language={language}
            onCancel={cancelSOS}
          />

          {/* AI First-Aid Guidance (CPR / Bleeding) */}
          <AIFirstAidGuidance
            alert={activeAlert}
            language={language}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Emergency Category Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>1. SELECT EMERGENCY CLASSIFICATION:</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                AI TRIAGE ENGINE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[90px] cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSelected ? 'bg-rose-950/80 border-rose-600 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {cat.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white leading-tight">
                        {cat.label[language] || cat.label.en}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MASSIVE ONE-TAP SOS BUTTON - Tactical Beacon */}
          <div className="py-4 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              {/* Concentric Radiant Waves */}
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/20 animate-sos-radiant-1 pointer-events-none"></div>
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/15 animate-sos-radiant-2 pointer-events-none"></div>
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/10 animate-sos-radiant-3 pointer-events-none"></div>

              {/* Central Tactile Button */}
              <button
                onClick={handleSOSTrigger}
                disabled={isSimulating}
                className={`relative w-48 h-48 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white font-black shadow-2xl shadow-rose-600/60 border-4 border-white/30 active:scale-95 transition-all duration-200 transform flex flex-col items-center justify-center gap-1 cursor-pointer group hover:scale-105 hover:from-rose-600 hover:to-red-400 ${
                  isSimulating ? 'opacity-70 animate-pulse' : ''
                }`}
                aria-label="One-tap SOS Emergency Button"
              >
                <span className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-md group-hover:scale-110 transition-transform">
                  SOS
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-4 text-center text-rose-100 leading-tight">
                  {sosButtonTextByLang[language] || sosButtonTextByLang.en}
                </span>
                <span className="text-[8px] text-white/90 font-mono tracking-widest font-bold mt-0.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                  INSTANT CAD ALLOCATION
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-lg mt-6 text-center leading-relaxed font-mono">
              Pressing SOS locks GPS coordinates, verifies signal triangulation, allocates nearest ALS/BLS fleet, and alerts Bengaluru hospital trauma units under DPDP Act 2023.
            </p>
          </div>

          {/* Quick Voice & Accessibility Help Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-bold text-xs">
                  Multilingual AI Audio Guidance
                </strong>
                <span className="text-[11px] text-slate-400">
                  Voice guidance in English, ಕನ್ನಡ, and हिन्दी triggers automatically during dispatch.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono font-bold">
              UN SDG 3 &bull; 11
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
