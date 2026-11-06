import React from 'react';
import { Calendar, MapPin, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './TopGovernmentBar.css';

export const TopGovernmentBar = () => {
  const { i18n, t } = useTranslation();

  const currentLang = i18n.language || 'en';

  const quickLanguages = [
    { code: 'en', label: 'EN', title: 'English' },
    { code: 'te', label: 'తెలుగు', title: 'Telugu' },
    { code: 'hi', label: 'हिन्दी', title: 'Hindi' },
  ];

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="top-gov-bar" role="region" aria-label="Official Government Header">
      <div className="top-gov-container">
        {/* Left: Government of Andhra Pradesh & Pushkaralu 2027 */}
        <div className="top-gov-left">
          <a
            href="https://www.ap.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="gov-branding-link"
            title="Government of Andhra Pradesh Official Portal"
          >
            <img
              src="/images/logos/ap-govt-emblem.png"
              alt="Government of Andhra Pradesh Official Seal"
              className="gov-emblem-small"
            />
            <span className="gov-title-text">
              Govt of Andhra Pradesh
              <span className="gov-telugu-hint">• ఆంధ్రప్రదేశ్ ప్రభుత్వం</span>
            </span>
          </a>

          <div className="gov-separator" aria-hidden="true" />

          <div className="pushkaralu-calendar-tag">
            <Calendar className="pushkaralu-calendar-icon" aria-hidden="true" />
            <span>PUSHKARALU 2027</span>
          </div>
        </div>

        {/* Right: Geographic Corridor & Quick Language Selector */}
        <div className="top-gov-right">
          <a
            href="tel:1077"
            className="top-emergency-hotline"
            title="Official 24/7 Pushkaralu Control Room: 1077"
          >
            <PhoneCall className="w-3 h-3" style={{ width: 11, height: 11 }} />
            <span>Control Room: 1077</span>
          </a>

          <div className="gov-separator" aria-hidden="true" />

          <div className="location-indicator">
            <MapPin className="location-icon" aria-hidden="true" />
            <span className="location-text">Rajamahendravaram – Kovvur</span>
          </div>

          <div className="gov-separator" aria-hidden="true" />

          {/* Language Selector: EN, తెలుగు, हिन्दी */}
          <div className="quick-lang-selector" role="group" aria-label="Quick language selector">
            {quickLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLangChange(lang.code)}
                className={`quick-lang-btn ${currentLang === lang.code ? 'active' : ''}`}
                title={`Switch to ${lang.title}`}
                aria-pressed={currentLang === lang.code}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopGovernmentBar;

