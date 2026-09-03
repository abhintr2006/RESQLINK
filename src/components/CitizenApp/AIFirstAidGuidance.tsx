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
  Zap,
  CheckCircle,
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
      header: 'AI Emergency First-Aid Protocol (Pre-Arrival)',
      alertBanner: 'Paramedics Dispatched • Execute Immediate First-Response:',
    },
    kn: {
      header: 'ಎಐ ತುರ್ತು ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ (ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೆ)',
      alertBanner: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನೆಯಾಗಿದೆ • ಈ ಕೆಳಗಿನ ಕ್ರಮಗಳನ್ನು ತಕ್ಷಣ ಅನುಸರಿಸಿ:',
    },
    hi: {
      header: 'एआई आपातकालीन प्राथमिक चिकित्सा निर्देश (आगमन पूर्व)',
      alertBanner: 'एम्बुलेंस रवाना हो चुकी है • तुरंत इन निर्देशों का पालन करें:',
    },
  };

  const langContent = titlesByLang[language] || titlesByLang.en;

  return (
    <div className="double-bezel shadow-xl">
      <div className="double-bezel-inner p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <HeartPulse className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white font-mono">
                <span>{langContent.header}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">AI CO-PILOT</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                TRIAGE: <strong className="text-white">{category.replace('_', ' ')}</strong> &bull; URGENCY: <strong className="text-rose-400">{aiTriage.urgencyLevel}</strong>
              </p>
            </div>
          </div>

          {/* Audio Speech Readout Button */}
          <button
            onClick={handleToggleVoice}
            className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/60 text-cyan-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>MUTE TTS</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>LISTEN TTS</span>
              </>
            )}
          </button>
        </div>

        {/* Immediate Instruction Steps */}
        <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{langContent.alertBanner}</span>
          </div>

          <ul className="space-y-2">
            {aiTriage.firstAidInstructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ALS Ambulance Capability Notification */}
        {aiTriage.suggestedALS && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-rose-950/40 border border-rose-800/60 text-rose-200 px-3 py-2 rounded-xl">
            <Activity className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>
              Advanced Life Support (ALS) with Defibrillator, Multipara Monitor &amp; Ventilator en route.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
