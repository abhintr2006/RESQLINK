import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { EmergencyCategory } from '../../types';
import { LocationLockIndicator } from './LocationLockIndicator';
import { LiveTrackingCard } from './LiveTrackingCard';
import { AIFirstAidGuidance } from './AIFirstAidGuidance';
import { getCategoryTranslation, t } from '../../services/localizationService';
import { ALL_INDIAN_LANGUAGES } from '../../data/languages';
import {
  HeartPulse,
  Car,
  Brain,
  Wind,
  UserCheck,
  Stethoscope,
  Baby,
  MapPin,
  Wifi,
  WifiOff,
  Signal,
  AlertCircle,
  Volume2,
  Sparkles,
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

  const categories: { id: EmergencyCategory; icon: any; color: string }[] = [
    {
      id: 'CARDIAC',
      icon: HeartPulse,
      color: 'from-rose-600 to-rose-700',
    },
    {
      id: 'TRAUMA_ACCIDENT',
      icon: Car,
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'STROKE',
      icon: Brain,
      color: 'from-purple-600 to-purple-700',
    },
    {
      id: 'RESPIRATORY',
      icon: Wind,
      color: 'from-cyan-600 to-cyan-700',
    },
    {
      id: 'ELDERLY_FALL',
      icon: UserCheck,
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      id: 'MATERNAL_CRITICAL',
      icon: Baby,
      color: 'from-pink-600 to-pink-700',
    },
    {
      id: 'GENERAL_MEDICAL',
      icon: Stethoscope,
      color: 'from-blue-600 to-blue-700',
    },
  ];

  const handleSOSTrigger = () => {
    if (activeAlert) return;
    triggerSOS(selectedCategory);
  };

  const currentLangObj = ALL_INDIAN_LANGUAGES.find((l) => l.code === language) || ALL_INDIAN_LANGUAGES[0];

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
                GPS EMERGENCY POSITION ({currentLangObj.nativeName})
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
                <span className="text-emerald-300">5G High-Speed</span>
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
                <span className="text-rose-300">2G SMS Active</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE EMERGENCY VIEW vs IDLE SOS TRIGGER */}
      {activeAlert ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Active Emergency Top Control Bar */}
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-950 to-slate-950 border border-rose-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <div>
                <div className="text-xs font-black text-white">Active Emergency #{activeAlert.shortCode} • {activeAlert.category.replace('_', ' ')}</div>
                <div className="text-[11px] text-rose-300">Paramedic unit dispatched and en route</div>
              </div>
            </div>
            <button
              onClick={() => cancelSOS(activeAlert.id)}
              className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-100 hover:text-white rounded-xl text-xs font-black border border-rose-600 transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>✕ Return to SOS Ready Screen</span>
            </button>
          </div>

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
                <span>{t('select_emergency', language)}</span>
              </label>
              <span className="text-[11px] text-indigo-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {currentLangObj.nativeName} ({currentLangObj.name})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const trans = getCategoryTranslation(cat.id, language);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3.5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[105px] cursor-pointer active:scale-95 ${
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
                      <div className="font-black text-xs text-white leading-snug">
                        {trans.name}
                      </div>
                      {trans.desc && (
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                          {trans.desc}
                        </div>
                      )}
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
                className={`relative w-56 h-56 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white font-black shadow-2xl shadow-rose-600/60 border-4 border-white/30 active:scale-95 transition-all duration-300 transform flex flex-col items-center justify-center gap-1.5 cursor-pointer group hover:scale-105 hover:from-rose-600 hover:to-red-400 ${
                  isSimulating ? 'opacity-70 animate-pulse' : ''
                }`}
                aria-label="One-tap SOS Emergency Button"
              >
                <span className="text-4xl font-black tracking-widest text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  SOS
                </span>
                <span className="text-xs font-black tracking-wider uppercase px-4 text-center text-rose-100 leading-tight">
                  {t('sos_button', language)}
                </span>
                <span className="text-[9px] text-white/90 font-mono tracking-widest font-bold mt-0.5 bg-black/25 px-2.5 py-0.5 rounded-full">
                  {t('one_tap_dispatch', language)}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-md mt-8 text-center leading-relaxed font-medium">
              Pressing SOS locks your GPS coordinates, assigns the nearest ambulance, informs the receiving hospital, and generates localized first-aid voice instructions in <strong>{currentLangObj.nativeName} ({currentLangObj.name})</strong>.
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
                  {t('speech_readout_prompt', language)}
                </strong>
                <span className="text-[11px] text-slate-400">
                  Speech guidance actively speaking in <strong>{currentLangObj.nativeName} ({currentLangObj.region})</strong>.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-xl border border-indigo-800 font-mono font-bold shrink-0">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
