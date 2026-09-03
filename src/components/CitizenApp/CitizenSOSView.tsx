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

  const categories: { id: EmergencyCategory; label: { en: string; kn: string; hi: string }; icon: any; color: string }[] = [
    {
      id: 'CARDIAC',
      label: { en: 'Heart Attack / Cardiac', kn: 'ಹೃದಯಾಘಾತ', hi: 'हार्ट अटैक' },
      icon: HeartPulse,
      color: 'from-rose-600 to-rose-700',
    },
    {
      id: 'TRAUMA_ACCIDENT',
      label: { en: 'Road Accident / Trauma', kn: 'ರಸ್ತೆ ಅಪಘಾತ', hi: 'सड़क दुर्घटना' },
      icon: Car,
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'STROKE',
      label: { en: 'Stroke / Paralysis', kn: 'ಪಾರ್ಶ್ವವಾಯು', hi: 'स्ट्रोक / लकवा' },
      icon: Brain,
      color: 'from-purple-600 to-purple-700',
    },
    {
      id: 'RESPIRATORY',
      label: { en: 'Severe Breathing Trouble', kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ', hi: 'सांस लेने में तकलीफ' },
      icon: Wind,
      color: 'from-cyan-600 to-cyan-700',
    },
    {
      id: 'ELDERLY_FALL',
      label: { en: 'Elderly Fall / Injury', kn: 'ಹಿರಿಯ ನಾಗರಿಕರ ಪತನ', hi: 'बुजुर्गों का गिरना / चोट' },
      icon: UserCheck,
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      id: 'GENERAL_MEDICAL',
      label: { en: 'General Medical Emergency', kn: 'ಸಾಮಾನ್ಯ ತುರ್ತುಸ್ಥಿತಿ', hi: 'सामान्य आपातकाल' },
      icon: Stethoscope,
      color: 'from-blue-600 to-blue-700',
    },
  ];

  const handleSOSTrigger = () => {
    if (activeAlert) return;
    triggerSOS(selectedCategory);
  };

  const sosButtonTextByLang = {
    en: 'TAP FOR EMERGENCY HELP',
    kn: 'ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ ಒತ್ತಿ',
    hi: 'आपातकालीन सहायता के लिए दबाएं',
  };

  return (
    <div
      className={`max-w-2xl mx-auto space-y-6 transition-colors duration-200 ${
        assistiveHighContrast ? 'bg-black text-yellow-300' : ''
      }`}
    >
      {/* Top Location & Connectivity Card - Double Bezel */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-950/90">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400">
                CURRENT EMERGENCY GPS PRESET
              </div>
              <div className="text-sm font-black text-white">
                {selectedPreset.name}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ward: <strong className="text-slate-300">{selectedPreset.ward}</strong> • PIN: {selectedPreset.pincode}
              </p>
            </div>
          </div>

          {/* Network Tier Pill */}
          <div className="flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-2xl border bg-slate-900 shadow-inner">
            {networkTier === '5G_HIGH_SPEED' && (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">5G / High-Speed</span>
              </>
            )}
            {networkTier === '3G_SPOTTY' && (
              <>
                <Signal className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">3G Spotty Signal</span>
              </>
            )}
            {networkTier === '2G_SMS_FALLBACK' && (
              <>
                <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-rose-300">2G SMS Fallback Active</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE EMERGENCY VIEW vs IDLE SOS TRIGGER */}
      {activeAlert ? (
        <div className="space-y-6 animate-in fade-in duration-300">
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
        <div className="space-y-8">
          {/* Emergency Category Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-200 tracking-wider uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Select Emergency Condition:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-bold">1-Touch Auto-Triage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3.5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[96px] cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900/95 border-rose-500 shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-xs text-white leading-tight">
                        {cat.label[language] || cat.label.en}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MASSIVE ONE-TAP SOS BUTTON - Tactile Hardware Beacon */}
          <div className="pt-6 pb-4 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              {/* Concentric Radiant Waves */}
              <div className="absolute w-72 h-72 rounded-full bg-rose-600/20 animate-sos-radiant-1 pointer-events-none"></div>
              <div className="absolute w-72 h-72 rounded-full bg-rose-600/15 animate-sos-radiant-2 pointer-events-none"></div>
              <div className="absolute w-72 h-72 rounded-full bg-rose-600/10 animate-sos-radiant-3 pointer-events-none"></div>

              {/* Central Tactile Button */}
              <button
                onClick={handleSOSTrigger}
                disabled={isSimulating}
                className={`relative w-52 h-52 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white font-black shadow-2xl shadow-rose-600/60 border-4 border-white/30 active:scale-95 transition-all duration-300 transform flex flex-col items-center justify-center gap-1.5 cursor-pointer group hover:scale-105 hover:from-rose-600 hover:to-red-400 ${
                  isSimulating ? 'opacity-70 animate-pulse' : ''
                }`}
                aria-label="One-tap SOS Emergency Button"
              >
                <span className="text-4xl font-black tracking-widest text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  SOS
                </span>
                <span className="text-[11px] font-black tracking-wider uppercase px-4 text-center text-rose-100 leading-tight">
                  {sosButtonTextByLang[language] || sosButtonTextByLang.en}
                </span>
                <span className="text-[9px] text-white/80 font-mono tracking-widest font-bold mt-0.5 bg-black/20 px-2 py-0.5 rounded-full">
                  INSTANT CAD DISPATCH
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-md mt-8 text-center leading-relaxed font-medium">
              Pressing SOS locks your GPS coordinates, verifies signal triangulation, allocates the nearest Bengaluru ALS ambulance, and initiates pre-arrival hospital prep under DPDP Act 2023.
            </p>
          </div>

          {/* Quick Voice & Accessibility Help Banner */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-bold">
                  Multilingual AI Audio Assist
                </strong>
                <span className="text-[11px] text-slate-400">
                  Speech guidance in English, ಕನ್ನಡ, and हिन्दी automatically triggers upon dispatch.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl border border-slate-700 font-mono font-bold">
              SDG 3 &amp; 11
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
