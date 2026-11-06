import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Languages, ChevronDown, Check, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../locales/languages';

export const LanguageSelector = ({ compact = false, iconOnly = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const currentLang = getLanguageByCode(i18n.language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`Select Interface Language. Current: ${currentLang.name}`}
          title={`Translate / Language (${currentLang.name})`}
          className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-teal-900 hover:bg-teal-50 hover:border-teal-400 transition-all shadow-xs cursor-pointer flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          <Languages className="w-5 h-5 text-teal-800 group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-1 -right-1 text-[9px] font-black uppercase tracking-wider bg-teal-800 text-white px-1 py-0.2 rounded-full border border-white shadow-2xs leading-none">
            {currentLang.code.slice(0, 2).toUpperCase()}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Select Interface Language"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200/90 bg-white/95 text-slate-800 hover:bg-teal-50 hover:border-teal-400 transition-all shadow-xs cursor-pointer ${
            compact ? 'text-xs' : 'text-xs sm:text-sm font-semibold'
          }`}
        >
          <Globe className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span className="font-bold text-teal-950 font-serif">
            {currentLang.nativeName}
          </span>
          <span className="hidden md:inline text-[11px] text-slate-500 font-normal">
            ({currentLang.name})
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase text-teal-900 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                Select Indian Language (22)
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            </div>

            {/* Language Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language / భాష..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                autoFocus
              />
            </div>
          </div>

          {/* Languages Scroll List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching Indian language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full px-3 py-2 text-left rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 font-serif">
                          {lang.nativeName}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          · {lang.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {lang.region}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

