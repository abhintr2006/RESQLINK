import { useResqLink } from '../context/ResqLinkContext';
import { LanguageCode } from '../types';
import { t } from './translations';
import { INDIAN_LANGUAGES, LANGUAGE_MAP, getLanguageLabel, type LanguageInfo } from './languages';

/**
 * Convenient React hook that connects to ResqLinkContext and provides
 * translation helpers plus language metadata.
 *
 * Usage:
 *   const { t, language, setLanguage, languages, currentLanguage } = useTranslation();
 *   <span>{t('sos.cardiac')}</span>
 */
export function useTranslation() {
  const { language, setLanguage } = useResqLink();

  return {
    /** Translate a key into the current language (auto English fallback) */
    t: (key: string, fallback?: string) => t(key, language, fallback),
    /** Current language code */
    language,
    /** Set the active language */
    setLanguage,
    /** All available Indian languages */
    languages: INDIAN_LANGUAGES,
    /** Language metadata map */
    languageMap: LANGUAGE_MAP,
    /** Current language metadata */
    currentLanguage: LANGUAGE_MAP[language] as LanguageInfo,
    /** Get display label for any language code */
    getLanguageLabel,
  };
}
