/**
 * The 22 Scheduled Indian Languages + English
 * Complete metadata for UI display, script rendering, RTL detection,
 * and BCP-47 speech recognition / synthesis locale mapping.
 */
export const SUPPORTED_LANGUAGES = [
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    bcp47: 'te-IN',
    isRTL: false,
    region: 'Andhra Pradesh & Telangana (Local Event Language)'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    bcp47: 'hi-IN',
    isRTL: false,
    region: 'North & Central India'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47: 'en-IN',
    isRTL: false,
    region: 'National Fallback'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    bcp47: 'ta-IN',
    isRTL: false,
    region: 'Tamil Nadu & Puducherry'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    bcp47: 'kn-IN',
    isRTL: false,
    region: 'Karnataka'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    bcp47: 'ml-IN',
    isRTL: false,
    region: 'Kerala & Lakshadweep'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    bcp47: 'bn-IN',
    isRTL: false,
    region: 'West Bengal & Tripura'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    bcp47: 'mr-IN',
    isRTL: false,
    region: 'Maharashtra & Goa'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    bcp47: 'gu-IN',
    isRTL: false,
    region: 'Gujarat'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    bcp47: 'or-IN',
    isRTL: false,
    region: 'Odisha'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    bcp47: 'pa-IN',
    isRTL: false,
    region: 'Punjab'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    bcp47: 'as-IN',
    isRTL: false,
    region: 'Assam'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    bcp47: 'ur-IN',
    isRTL: true,
    region: 'Pan-India'
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    bcp47: 'sa-IN',
    isRTL: false,
    region: 'Classical Heritage'
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'کٲشُر / कॉशुर',
    bcp47: 'ks-IN',
    isRTL: true,
    region: 'Jammu & Kashmir'
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    bcp47: 'kok-IN',
    isRTL: false,
    region: 'Goa & Konkan'
  },
  {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্',
    bcp47: 'mni-IN',
    isRTL: false,
    region: 'Manipur'
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    bcp47: 'ne-IN',
    isRTL: false,
    region: 'Sikkim & West Bengal'
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    bcp47: 'brx-IN',
    isRTL: false,
    region: 'Bodoland, Assam'
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    bcp47: 'doi-IN',
    isRTL: false,
    region: 'Jammu'
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    bcp47: 'sat-IN',
    isRTL: false,
    region: 'Jharkhand & Odisha'
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिंधी',
    bcp47: 'sd-IN',
    isRTL: true,
    region: 'Pan-India Sindhi Community'
  }
];

export const getLanguageByCode = (code = 'en') => {
  const normalized = code.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.find((l) => l.code === normalized) || SUPPORTED_LANGUAGES[2]; // Default English
};

