import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import { createStructuredData, localeCodes } from './metadata';

export const supportedLanguages = ['en', 'fr', 'hi'] as const;
export type Language = typeof supportedLanguages[number];
export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

export function isLanguage(value: string | null | undefined): value is Language {
  return supportedLanguages.some((language) => language === value);
}

export function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(saved) ? saved : 'fr';
  } catch {
    // Language switching still works when browser storage is unavailable.
    return 'fr';
  }
}

function syncDocument(language: string) {
  const active = isLanguage(language) ? language : 'fr';
  document.documentElement.lang = active;
  document.title = i18n.t('metadata.title');
  const metadata: Record<string, string> = {
    'meta[name="description"]': 'metadata.description',
    'meta[name="language"]': 'language.name',
    'meta[property="og:title"]': 'metadata.socialTitle',
    'meta[property="og:description"]': 'metadata.socialDescription',
    'meta[property="og:image:alt"]': 'metadata.imageAlt',
    'meta[name="twitter:title"]': 'metadata.socialTitle',
    'meta[name="twitter:description"]': 'metadata.socialDescription',
    'meta[name="twitter:image:alt"]': 'metadata.imageAlt',
  };
  Object.entries(metadata).forEach(([selector, key]) => {
    document.querySelector(selector)?.setAttribute('content', i18n.t(key));
  });
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', localeCodes[active]);
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((meta) => meta.remove());
  supportedLanguages.filter((code) => code !== active).forEach((code) => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:locale:alternate');
    meta.content = localeCodes[code];
    document.head.appendChild(meta);
  });
  const structuredData = document.getElementById('business-structured-data');
  if (structuredData) structuredData.textContent = JSON.stringify(createStructuredData(active));
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, active);
  } catch {
    // Storage restrictions must not prevent the interface from translating.
  }
}

// Resources are bundled locally, so initialization completes before React renders.
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, hi: { translation: hi } },
  lng: getInitialLanguage(),
  fallbackLng: 'fr',
  supportedLngs: [...supportedLanguages],
  initAsync: false,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', syncDocument);
syncDocument(i18n.resolvedLanguage || i18n.language);

export default i18n;
