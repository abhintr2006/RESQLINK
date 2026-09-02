import React, { useState } from 'react';
import { EmergencyAlert, LanguageCode } from '../../types';
import { audioService } from '../../services/audioService';
import { ALL_INDIAN_LANGUAGES } from '../../data/languages';
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

  const currentLangObj = ALL_INDIAN_LANGUAGES.find((l) => l.code === language) || ALL_INDIAN_LANGUAGES[0];

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      audioService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak =
        aiTriage.speechSummary[language] ||
        aiTriage.speechSummary.en ||
        `Emergency response dispatched for ${category.replace('_', ' ')}. Please stay calm.`;
      audioService.speak(textToSpeak, language);
    }
  };

  const getLocalizedHeader = (lang: LanguageCode) => {
    const map: Partial<Record<LanguageCode, { header: string; alertBanner: string }>> = {
      en: { header: 'AI Emergency Medical Assistant (While You Wait)', alertBanner: 'Paramedics Dispatched • Follow these immediate actions:' },
      kn: { header: 'ಎಐ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು (ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೆ)', alertBanner: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನೆಯಾಗಿದೆ • ಈ ಕ್ರಮಗಳನ್ನು ತಕ್ಷಣ ಅನುಸರಿಸಿ:' },
      hi: { header: 'एआई आपातकालीन चिकित्सा सहायता (एम्बुलेंस आने तक)', alertBanner: 'एम्बुलेंस रवाना हो चुकी है • तुरंत इन निर्देशों का पालन करें:' },
      ta: { header: 'AI அவசர மருத்துவ உதவி (ஆம்புலன்ஸ் வரும் வரை)', alertBanner: 'ஆம்புலன்ஸ் புறப்பட்டது • இந்த நடவடிக்கைகளை உடனடியாகப் பின்பற்றவும்:' },
      te: { header: 'AI అత్యవసర వైద్య సహాయం (అంబులెన్స్ వచ్చే వరకు)', alertBanner: 'అంబులెన్స్ బయలుదేరింది • వెంటనే ఈ సూచనలను పాటించండి:' },
      ml: { header: 'AI അടിയന്തര മെഡിക്കൽ സഹായം (ആംബുലൻസ് എത്തുന്നതുവരെ)', alertBanner: 'ആംബുലൻസ് പുറപ്പെട്ടു • ഉടനടി ഈ നടപടികൾ സ്വീകരിക്കുക:' },
      mr: { header: 'AI आपत्कालीन वैद्यकीय मदत (रुग्णवाहिका येईपर्यंत)', alertBanner: 'रुग्णवाहिका निघाली आहे • त्वरित खालील कृती करा:' },
      bn: { header: 'AI জরুরি চিকিৎসা সহায়তা (অ্যাম্বুলেন্স আসা পর্যন্ত)', alertBanner: 'অ্যাম্বুলেন্স রওনা হয়েছে • অবিলম্বে এই পদক্ষেপগুলি অনুসরণ করুন:' },
      gu: { header: 'AI કટોકટી તબીબી સહાય (એમ્બ્યુલન્સ આવે ત્યાં સુધી)', alertBanner: 'એમ્બ્યુલન્સ રવાના થઈ ગઈ છે • તાત્કાલિક આ પગલાં અનુસરો:' },
      pa: { header: 'AI ਸੰਕਟਕਾਲੀਨ ਡਾਕਟਰੀ ਸਹਾਇਤਾ (ਐਂਬੂਲੈਂਸ ਆਉਣ ਤੱਕ)', alertBanner: 'ਐਂਬੂਲੈਂਸ ਰਵਾਨਾ ਹੋ ਚੁੱਕੀ ਹੈ • ਤੁਰੰਤ ਇਹ ਕਦਮ ਚੁੱਕੋ:' },
      or: { header: 'AI ଜରୁରୀକାଳୀନ ଡାକ୍ତରୀ ସହାୟତା (ଆମ୍ବୁଲାନ୍ସ ଆସିବା ପର୍ଯ୍ୟନ୍ତ)', alertBanner: 'ଆମ୍ବୁଲାନ୍ସ ବାହାରି ସାରିଛି • ତୁରନ୍ତ ଏହି ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ:' },
      as: { header: 'AI জৰুৰীকালীন চিকিৎসা সহায় (এম্বুলেন্স অহালৈকে)', alertBanner: 'এম্বুলেন্স ৰাওনা হৈছে • ততালিকে এই নিৰ্দেশনাৱলী পালন কৰক:' },
      ur: { header: 'AI ہنگامی طبی امداد (ایمبولینس آنے تک)', alertBanner: 'ایمبولینس روانہ ہو چکی ہے • فوراً ان ہدایات پر عمل کریں:' },
    };
    return map[lang] || {
      header: `AI Emergency Assistant (${currentLangObj.nativeName})`,
      alertBanner: 'Paramedics Dispatched • Follow these immediate actions:',
    };
  };

  const langContent = getLocalizedHeader(language);

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
          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audio ({currentLangObj.nativeName})</span>
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
