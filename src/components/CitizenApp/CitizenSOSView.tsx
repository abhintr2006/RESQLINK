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
      className={`max-w-2xl mx-auto px-4 py-6 space-y-6 transition-colors duration-200 ${
        assistiveHighContrast ? 'bg-black text-yellow-300' : ''
      }`}
    >
      {/* Top Location & Connectivity Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              YOUR CURRENT LOCATION
            </div>
            <div className="text-sm font-bold text-white">
              {selectedPreset.name}
            </div>
            <p className="text-[11px] text-slate-400">
              Ward: {selectedPreset.ward} • PIN: {selectedPreset.pincode}
            </p>
          </div>
        </div>

        {/* Network Tier Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-slate-950/80">
          {networkTier === '5G_HIGH_SPEED' && (
            <>
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">4G/5G Online</span>
            </>
          )}
          {networkTier === '3G_SPOTTY' && (
            <>
              <Signal className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300">3G Weak Signal</span>
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

      {/* ACTIVE EMERGENCY VIEW vs IDLE SOS TRIGGER */}
      {activeAlert ? (
        <div className="space-y-5 animate-in fade-in duration-300">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Select Emergency Condition:
              </label>
              <span className="text-[11px] text-slate-400">Zero learning curve</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between min-h-[86px] ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500 shadow-md shadow-rose-500/20 ring-2 ring-rose-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
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

          {/* MASSIVE ONE-TAP SOS BUTTON */}
          <div className="pt-4 pb-2 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Waves */}
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/20 animate-sos-wave-1 pointer-events-none"></div>
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/15 animate-sos-wave-2 pointer-events-none"></div>
              <div className="absolute w-64 h-64 rounded-full bg-rose-600/10 animate-sos-wave-3 pointer-events-none"></div>

              {/* Central Touch Target */}
              <button
                onClick={handleSOSTrigger}
                disabled={isSimulating}
                className={`relative w-48 h-48 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white font-black shadow-2xl shadow-rose-600/60 border-4 border-white/20 active:scale-95 transition transform flex flex-col items-center justify-center gap-1 cursor-pointer group hover:from-rose-600 hover:to-red-400 ${
                  isSimulating ? 'opacity-70 animate-pulse' : ''
                }`}
                aria-label="One-tap SOS Emergency Button"
              >
                <span className="text-3xl font-black tracking-wider text-white drop-shadow-md">
                  SOS
                </span>
                <span className="text-[11px] font-bold tracking-wide uppercase px-3 text-center text-rose-100/90 leading-tight">
                  {sosButtonTextByLang[language] || sosButtonTextByLang.en}
                </span>
                <span className="text-[9px] text-white/70 font-mono mt-0.5">
                  1-TAP DISPATCH
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-md mt-6 text-center leading-relaxed">
              Pressing SOS automatically locks your GPS location, checks signal consistency, matches the nearest Bengaluru ambulance &amp; trauma hospital, and sends emergency SMS if offline.
            </p>
          </div>

          {/* Quick Voice Prompt & Accessibility Help Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">
                  Zero-Barrier Accessibility
                </strong>
                <span className="text-[11px] text-slate-400">
                  Voice prompts enabled for elderly and low-literacy citizens.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700 font-mono">
              SDG 3 &amp; 11
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
