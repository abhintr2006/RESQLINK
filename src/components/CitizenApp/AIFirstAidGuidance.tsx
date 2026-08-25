import React, { useState } from 'react';
import { EmergencyAlert, LanguageCode } from '../../types';
import { audioService } from '../../services/audioService';
import {
  HeartPulse,
  Volume2,
  VolumeX,
  AlertTriangle,
  Activity,
  Sparkles,
} from 'lucide-react';

interface AIFirstAidGuidanceProps {
  alert: EmergencyAlert;
  language: LanguageCode;
}

export const AIFirstAidGuidance: React.FC<AIFirstAidGuidanceProps> = ({ alert, language }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const { aiTriage, category } = alert;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      audioService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak =
        aiTriage.speechSummary[language] || aiTriage.speechSummary.en;
      audioService.speak(textToSpeak, language);
    }
  };

  const titlesByLang: Record<LanguageCode, { header: string; alertBanner: string }> = {
    en: {
      header: 'AI Emergency Medical Assistant (While You Wait)',
      alertBanner: 'Paramedics Dispatched • Follow these immediate actions:',
    },
    kn: {
      header: 'ಎಐ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು (ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೆ)',
      alertBanner: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನೆಯಾಗಿದೆ • ಈ ಕೆಳಗಿನ ಕ್ರಮಗಳನ್ನು ತಕ್ಷಣ ಅನುಸರಿಸಿ:',
    },
    hi: {
      header: 'एआई आपातकालीन चिकित्सा सहायता (एम्बुलेंस आने तक)',
      alertBanner: 'एम्बुलेंस रवाना हो चुकी है • तुरंत इन निर्देशों का पालन करें:',
    },
  };

  const langContent = titlesByLang[language] || titlesByLang.en;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-900/50 rounded-2xl p-4 shadow-xl shadow-indigo-950/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-white">
              <span>{langContent.header}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] text-indigo-300">
              Protocol: {category.replace('_', ' ')} • Urgency: {aiTriage.urgencyLevel}
            </p>
          </div>
        </div>

        {/* Audio Speech Readout Button */}
        <button
          onClick={handleToggleVoice}
          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>

      {/* Immediate Instruction Steps */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{langContent.alertBanner}</span>
        </div>

        <ul className="space-y-2">
          {aiTriage.firstAidInstructions.map((instruction, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ALS Ambulance Capability Notification */}
      {aiTriage.suggestedALS && (
        <div className="mt-3 flex items-center gap-2 text-[11px] bg-rose-950/40 border border-rose-800/60 text-rose-200 px-3 py-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span>
            Advanced Life Support (ALS) with Defibrillator &amp; Ventilator en route to your location.
          </span>
        </div>
      )}
    </div>
  );
};
