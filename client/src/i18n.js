import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './locales';
import { getLanguageByCode } from './locales/languages';

const savedLanguage = localStorage.getItem('geoseva_language') || 'te';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
});

// Update document language and text direction attributes
const updateDocumentAttributes = (langCode) => {
  const langMeta = getLanguageByCode(langCode);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = langCode;
    document.documentElement.dir = langMeta?.isRTL ? 'rtl' : 'ltr';
  }
};

updateDocumentAttributes(savedLanguage);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('geoseva_language', lng);
  updateDocumentAttributes(lng);
});

export default i18n;

