import { LanguageCode } from '../types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;        // English name
  nativeName: string;  // Name in native script
  bcp47: string;       // BCP 47 tag for speech synthesis
  ttsCode?: string;    // Fallback tag for regional TTS engine
  region: string;      // Geographical region in India
  sampleGreeting?: string; // Emergency greeting in native script
}

/**
 * All 22 Eighth Schedule languages of the Constitution of India + English.
 * Ordered by approximate number of speakers (descending).
 */
export const INDIAN_LANGUAGES: LanguageInfo[] = [
  { code: 'en',  name: 'English',    nativeName: 'English',     bcp47: 'en-IN', ttsCode: 'en-IN', region: 'Pan-India', sampleGreeting: 'Emergency Assistance' },
  { code: 'hi',  name: 'Hindi',      nativeName: 'हिन्दी',       bcp47: 'hi-IN', ttsCode: 'hi-IN', region: 'North & Central India', sampleGreeting: 'आपातकालीन सहायता' },
  { code: 'bn',  name: 'Bengali',    nativeName: 'বাংলা',       bcp47: 'bn-IN', ttsCode: 'bn-IN', region: 'East India (West Bengal/Tripura)', sampleGreeting: 'জরুরি সাহায্য' },
  { code: 'mr',  name: 'Marathi',    nativeName: 'मराठी',        bcp47: 'mr-IN', ttsCode: 'mr-IN', region: 'West India (Maharashtra/Goa)', sampleGreeting: 'आपत्कालीन मदत' },
  { code: 'te',  name: 'Telugu',     nativeName: 'తెలుగు',      bcp47: 'te-IN', ttsCode: 'te-IN', region: 'South India (AP & Telangana)', sampleGreeting: 'అత్యవసర సహాయం' },
  { code: 'ta',  name: 'Tamil',      nativeName: 'தமிழ்',       bcp47: 'ta-IN', ttsCode: 'ta-IN', region: 'South India (Tamil Nadu/Puducherry)', sampleGreeting: 'அவசர உதவி' },
  { code: 'gu',  name: 'Gujarati',   nativeName: 'ગુજરાતી',     bcp47: 'gu-IN', ttsCode: 'gu-IN', region: 'West India (Gujarat/DNHDD)', sampleGreeting: 'કટોકટી સહાય' },
  { code: 'ur',  name: 'Urdu',       nativeName: 'اردو',        bcp47: 'ur-IN', ttsCode: 'ur-IN', region: 'Pan-India (Telangana/J&K/UP)', sampleGreeting: 'ہنگامی مدد' },
  { code: 'kn',  name: 'Kannada',    nativeName: 'ಕನ್ನಡ',       bcp47: 'kn-IN', ttsCode: 'kn-IN', region: 'South India (Karnataka Native)', sampleGreeting: 'ತುರ್ತು ನೆರವು' },
  { code: 'or',  name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',       bcp47: 'or-IN', ttsCode: 'or-IN', region: 'East India (Odisha)', sampleGreeting: 'ଜରୁରୀକାଳୀନ ସହାୟତା' },
  { code: 'ml',  name: 'Malayalam',  nativeName: 'മലയാളം',     bcp47: 'ml-IN', ttsCode: 'ml-IN', region: 'South India (Kerala/Lakshadweep)', sampleGreeting: 'അടിയന്തര സഹായം' },
  { code: 'pa',  name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',      bcp47: 'pa-IN', ttsCode: 'pa-IN', region: 'North India (Punjab/Chandigarh)', sampleGreeting: 'ਸੰਕਟਕਾਲੀਨ ਸਹਾਇਤਾ' },
  { code: 'as',  name: 'Assamese',   nativeName: 'অসমীয়া',     bcp47: 'as-IN', ttsCode: 'as-IN', region: 'Northeast India (Assam)', sampleGreeting: 'জৰুৰীকালীন সাহায্য' },
  { code: 'mai', name: 'Maithili',   nativeName: 'मैथिली',       bcp47: 'mai-IN', ttsCode: 'hi-IN', region: 'North India (Bihar/Jharkhand)', sampleGreeting: 'आपातकालीन सहायता' },
  { code: 'sa',  name: 'Sanskrit',   nativeName: 'संस्कृतम्',    bcp47: 'sa-IN', ttsCode: 'hi-IN', region: 'Pan-India (Classical)', sampleGreeting: 'आत्ययिक साहाय्यम्' },
  { code: 'kok', name: 'Konkani',    nativeName: 'कोंकणी',       bcp47: 'kok-IN', ttsCode: 'mr-IN', region: 'West India (Goa/Coastal Karnataka)', sampleGreeting: 'तात्काळ मदत' },
  { code: 'ne',  name: 'Nepali',     nativeName: 'नेपाली',       bcp47: 'ne-IN', ttsCode: 'ne-NP', region: 'Northeast India (Sikkim/West Bengal)', sampleGreeting: 'आपतकालीन सहयोग' },
  { code: 'sd',  name: 'Sindhi',     nativeName: 'سنڌي',        bcp47: 'sd-IN', ttsCode: 'hi-IN', region: 'West India (Gujarat/Maharashtra)', sampleGreeting: 'ہنگامي مدد' },
  { code: 'doi', name: 'Dogri',      nativeName: 'डोगरी',        bcp47: 'doi-IN', ttsCode: 'hi-IN', region: 'North India (J&K/Himachal)', sampleGreeting: 'आपातकालीन मदद' },
  { code: 'mni', name: 'Manipuri',   nativeName: 'মৈতৈলোন্',    bcp47: 'mni-IN', ttsCode: 'bn-IN', region: 'Northeast India (Manipur)', sampleGreeting: 'অকুপ্পা মতেং' },
  { code: 'brx', name: 'Bodo',       nativeName: 'बड़ो',         bcp47: 'brx-IN', ttsCode: 'as-IN', region: 'Northeast India (Bodoland/Assam)', sampleGreeting: 'गोनांथार हेफाजाब' },
  { code: 'sat', name: 'Santali',    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',    bcp47: 'sat-IN', ttsCode: 'bn-IN', region: 'East India (Jharkhand/Odisha/WB)', sampleGreeting: 'ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱜᱚᱲᱚ' },
  { code: 'ks',  name: 'Kashmiri',   nativeName: 'کٲشُر',       bcp47: 'ks-IN', ttsCode: 'ur-IN', region: 'North India (Jammu & Kashmir)', sampleGreeting: 'ہنگامی امداد' },
];

/** Alias for backward compatibility */
export const ALL_INDIAN_LANGUAGES = INDIAN_LANGUAGES;

/** Frequently selected languages for quick-access buttons */
export const POPULAR_INDIAN_LANGUAGES: LanguageCode[] = [
  'en',
  'kn',
  'hi',
  'ta',
  'te',
  'ml',
  'mr',
  'bn',
  'gu',
  'pa',
];

/** Quick lookup map from code → LanguageInfo */
export const LANGUAGE_MAP: Record<LanguageCode, LanguageInfo> = Object.fromEntries(
  INDIAN_LANGUAGES.map((lang) => [lang.code, lang])
) as Record<LanguageCode, LanguageInfo>;

/** All valid language codes */
export const ALL_LANGUAGE_CODES: LanguageCode[] = INDIAN_LANGUAGES.map((l) => l.code);

/** Get display label for a language code: "nativeName (name)" */
export function getLanguageLabel(code: LanguageCode): string {
  const info = LANGUAGE_MAP[code];
  if (!info) return code.toUpperCase();
  return info.code === 'en' ? 'English' : `${info.nativeName} (${info.name})`;
}

/** Get short display label for nav pills */
export function getLanguageShortLabel(code: LanguageCode): string {
  return code.toUpperCase();
}
