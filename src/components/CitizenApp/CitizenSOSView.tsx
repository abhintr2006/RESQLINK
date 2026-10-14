import React, { useState } from 'react';
import { useResqLink } from '../../context/ResqLinkContext';
import { EmergencyCategory } from '../../types';
import {
  EMERGENCY_CONTACT_NUMBER,
  formatEmergencyContact,
  getValidatedEmergencyContact,
  openEmergencyDialer,
} from '../../config/emergencyContact';
import { LocationLockIndicator } from './LocationLockIndicator';
import { LiveTrackingCard } from './LiveTrackingCard';
import { AIFirstAidGuidance } from './AIFirstAidGuidance';
import { getAllTranslations, useTranslation } from '../../i18n';
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
  Phone,
  X,
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
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('CARDIAC');
  const [isCallPromptOpen, setIsCallPromptOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  const categories: { id: EmergencyCategory; label: NonNullable<ReturnType<typeof getAllTranslations>>; icon: any; color: string; badge: string }[] = [
    {
      id: 'CARDIAC',
      label: getAllTranslations('sos.cardiac') ?? { en: t('sos.cardiac') },
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-950/60 border-rose-700/60',
      badge: 'ALS UNIT',
    },
    {
      id: 'TRAUMA_ACCIDENT',
      label: getAllTranslations('sos.trauma') ?? { en: t('sos.trauma') },
      icon: Car,
      color: 'text-amber-400 bg-amber-950/60 border-amber-700/60',
      badge: 'TRAUMA L1',
    },
    {
      id: 'STROKE',
      label: getAllTranslations('sos.stroke') ?? { en: t('sos.stroke') },
      icon: Brain,
      color: 'text-purple-400 bg-purple-950/60 border-purple-700/60',
      badge: 'NEURO HUB',
    },
    {
      id: 'RESPIRATORY',
      label: getAllTranslations('sos.respiratory') ?? { en: t('sos.respiratory') },
      icon: Wind,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/60',
      badge: 'O2 SUPPORT',
    },
    {
      id: 'ELDERLY_FALL',
      label: getAllTranslations('sos.elderly_fall') ?? { en: t('sos.elderly_fall') },
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60',
      badge: 'BLS UNIT',
    },
    {
      id: 'GENERAL_MEDICAL',
      label: getAllTranslations('sos.general') ?? { en: t('sos.general') },
      icon: Stethoscope,
      color: 'text-blue-400 bg-blue-950/60 border-blue-700/60',
      badge: 'TRIAGE',
    },
  ];

  const handleSOSTrigger = () => {
    if (activeAlert || isSimulating || isCallInProgress) return;
    setCallStatus(null);
    setIsCallPromptOpen(true);
  };

  const handleConfirmedEmergency = async () => {
    if (activeAlert || isSimulating || isCallInProgress) return;
    const validatedContact = getValidatedEmergencyContact();
    if (!validatedContact) {
      setCallStatus('The configured emergency contact is invalid. Contact your administrator.');
      return;
    }

    setIsCallInProgress(true);
    setIsCallPromptOpen(false);
    try {
      // Preserve the existing alert, GPS-lock, audit, and dispatch workflow.
      await triggerSOS(selectedCategory);
      const dialer = openEmergencyDialer();
      if (!dialer.ok) {
        setCallStatus('The emergency event was created, but this device could not open a phone dialer. Use a supported mobile device or call the contact manually.');
      } else if (dialer.isLikelyMobile) {
        setCallStatus(`Dialer requested for ${formatEmergencyContact(EMERGENCY_CONTACT_NUMBER)}. RESQLINK cannot confirm that the call was placed or connected.`);
      } else {
        setCallStatus(`Dialer requested for ${formatEmergencyContact(EMERGENCY_CONTACT_NUMBER)}. Desktop browsers may not support phone calls.`);
      }
    } catch {
      setCallStatus('The emergency request could not be created. Please try again or use your local emergency service.');
    } finally {
      setIsCallInProgress(false);
    }
  };

  return (
    <div
      className={`citizen-surface max-w-3xl mx-auto space-y-5 rounded-3xl p-3 sm:p-5 transition-colors duration-200 ${
        assistiveHighContrast ? 'bg-black text-yellow-300' : ''
      }`}
    >
      {/* Top Telemetry & Location Bar */}
      <div className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shadow-md">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                  {t('sos.gps_telemetry', 'GPS TELEMETRY')}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60">
                  {selectedPreset.isPeripheral ? t('sos.peripheral_ward', 'PERIPHERAL WARD') : t('sos.core_ward', 'CORE WARD')}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                {selectedPreset.name} <span className="text-slate-500 text-xs font-normal">({selectedPreset.ward})</span>
              </div>
            </div>
          </div>

          {/* Network Tier Pill */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-slate-900 shadow-inner">
            {networkTier === '5G_HIGH_SPEED' && (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">{t('sos.broadband_5g', '5G BROADBAND')}</span>
              </>
            )}
            {networkTier === '3G_SPOTTY' && (
              <>
                <Signal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">{t('sos.spotty_3g', '3G SPOTTY (JITTER)')}</span>
              </>
            )}
            {networkTier === '2G_SMS_FALLBACK' && (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-rose-300">{t('sos.fallback_2g', '2G SMS FALLBACK ACTIVE')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {callStatus && (
        <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 shadow-sm">
          <div>
            <strong className="block font-bold">Emergency call status</strong>
            <span>{callStatus}</span>
          </div>
          <button type="button" onClick={() => setCallStatus(null)} className="rounded-lg p-1 hover:bg-amber-100" aria-label="Dismiss call status">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
          {isCallPromptOpen && (
            <div role="dialog" aria-modal="true" aria-labelledby="emergency-call-title" className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white"><Phone className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <h2 id="emergency-call-title" className="font-bold text-rose-950">Call the configured emergency contact?</h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-900">This development contact is <strong>{formatEmergencyContact(EMERGENCY_CONTACT_NUMBER)}</strong>. Confirming will create the existing RESQLINK emergency event and ask your device to open its dialer. Opening the dialer does not confirm that a call was placed or connected.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setIsCallPromptOpen(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={() => void handleConfirmedEmergency()} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700" autoFocus>Call and request help</button>
              </div>
            </div>
          )}

          {/* Emergency Category Selector */}
          <div className="care-panel space-y-2.5 rounded-2xl border p-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('sos.select_classification', '1. SELECT EMERGENCY CLASSIFICATION:')}</span>
              </label>
              <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {t('sos.optional_detail', 'OPTIONAL DETAIL')}
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
                        ? 'bg-rose-50 border-rose-500 shadow-md ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSelected ? 'bg-rose-100 border-rose-600 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {cat.badge}
                      </span>
                    </div>
                    <div>
                      <div className={`font-bold text-xs leading-tight ${isSelected ? 'text-rose-950 font-extrabold' : 'text-slate-900'}`}>
                        {cat.label[language] || cat.label.en || cat.id}
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
                disabled={isSimulating || isCallInProgress}
                className={`relative w-48 h-48 rounded-full bg-rose-600 text-white font-black shadow-xl shadow-rose-600/35 border-4 border-white active:scale-95 transition-all duration-200 transform flex flex-col items-center justify-center gap-1 cursor-pointer group hover:bg-rose-700 ${
                  isSimulating || isCallInProgress ? 'opacity-70 animate-pulse' : ''
                }`}
                aria-label="One-tap SOS Emergency Button"
              >
                <span className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-md group-hover:scale-110 transition-transform">
                  SOS
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-4 text-center text-rose-100 leading-tight">
                  {t('sos.activate')}
                </span>
                <span className="text-[8px] text-white/90 font-mono tracking-widest font-bold mt-0.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                  {t('sos.get_help_now', 'GET HELP NOW')}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-600 max-w-lg mt-6 text-center leading-relaxed">
              {t('sos.helper_note', 'Request help first. RESQLINK will share your location with the response team. You can add more detail if you are able.')}
            </p>
          </div>

          {/* Quick Voice & Accessibility Help Banner */}
          <div className="care-panel p-3.5 rounded-2xl border flex items-center justify-between text-xs text-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">
                  {t('sos.voice_support_title', 'Voice and accessibility support')}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {t('sos.voice_support_desc', 'Guidance is available in English, ಕನ್ನಡ, and हिन्दी during an active response.')}
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
