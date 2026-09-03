import { LanguageCode } from '../types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;        // English name
  nativeName: string;  // Name in native script
  bcp47: string;       // BCP 47 tag for speech synthesis
  region: string;      // Geographical region in India
}

/**
 * All 22 Eighth Schedule languages of the Constitution of India + English.
 * Ordered by approximate number of speakers (descending).
 */
export const INDIAN_LANGUAGES: LanguageInfo[] = [
  { code: 'en',  name: 'English',    nativeName: 'English',     bcp47: 'en-IN',  region: 'Pan-India' },
  { code: 'hi',  name: 'Hindi',      nativeName: 'हिन्दी',       bcp47: 'hi-IN',  region: 'North India' },
  { code: 'bn',  name: 'Bengali',    nativeName: 'বাংলা',       bcp47: 'bn-IN',  region: 'East India' },
  { code: 'mr',  name: 'Marathi',    nativeName: 'मराठी',        bcp47: 'mr-IN',  region: 'West India' },
  { code: 'te',  name: 'Telugu',     nativeName: 'తెలుగు',      bcp47: 'te-IN',  region: 'South India' },
  { code: 'ta',  name: 'Tamil',      nativeName: 'தமிழ்',       bcp47: 'ta-IN',  region: 'South India' },
  { code: 'gu',  name: 'Gujarati',   nativeName: 'ગુજરાતી',     bcp47: 'gu-IN',  region: 'West India' },
  { code: 'ur',  name: 'Urdu',       nativeName: 'اردو',        bcp47: 'ur-IN',  region: 'Pan-India' },
  { code: 'kn',  name: 'Kannada',    nativeName: 'ಕನ್ನಡ',       bcp47: 'kn-IN',  region: 'South India' },
  { code: 'or',  name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',       bcp47: 'or-IN',  region: 'East India' },
  { code: 'ml',  name: 'Malayalam',  nativeName: 'മലയാളം',     bcp47: 'ml-IN',  region: 'South India' },
  { code: 'pa',  name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',      bcp47: 'pa-IN',  region: 'North India' },
  { code: 'as',  name: 'Assamese',   nativeName: 'অসমীয়া',     bcp47: 'as-IN',  region: 'Northeast India' },
  { code: 'mai', name: 'Maithili',   nativeName: 'मैथिली',       bcp47: 'mai-IN', region: 'North India' },
  { code: 'sa',  name: 'Sanskrit',   nativeName: 'संस्कृतम्',    bcp47: 'sa-IN',  region: 'Pan-India' },
  { code: 'kok', name: 'Konkani',    nativeName: 'कोंकणी',       bcp47: 'kok-IN', region: 'West India' },
  { code: 'ne',  name: 'Nepali',     nativeName: 'नेपाली',       bcp47: 'ne-IN',  region: 'Northeast India' },
  { code: 'sd',  name: 'Sindhi',     nativeName: 'سنڌي',        bcp47: 'sd-IN',  region: 'West India' },
  { code: 'doi', name: 'Dogri',      nativeName: 'डोगरी',        bcp47: 'doi-IN', region: 'North India' },
  { code: 'mni', name: 'Manipuri',   nativeName: 'মৈতৈলোন্',    bcp47: 'mni-IN', region: 'Northeast India' },
  { code: 'brx', name: 'Bodo',       nativeName: 'बड़ो',         bcp47: 'brx-IN', region: 'Northeast India' },
  { code: 'sat', name: 'Santali',    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',    bcp47: 'sat-IN', region: 'East India' },
  { code: 'ks',  name: 'Kashmiri',   nativeName: 'کٲشُر',       bcp47: 'ks-IN',  region: 'North India' },
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
