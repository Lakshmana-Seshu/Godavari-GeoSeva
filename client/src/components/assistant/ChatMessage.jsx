import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldCheck, User, Sparkles, AlertCircle } from 'lucide-react';
import { ChatFacilityCard } from './ChatFacilityCard';
import { getLanguageByCode } from '../../locales/languages';

export const ChatMessage = ({ message, onShowOnMap = null }) => {
  const isBot = message.sender === 'bot';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(message.text);

    // Pick appropriate BCP-47 voice
    const langMeta = getLanguageByCode(message.language || 'te');
    utterance.lang = langMeta?.bcp47 || 'te-IN';

    // Attempt to match available voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(langMeta?.code || 'te') || v.lang === langMeta?.bcp47
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1.5 max-w-[92%]`}>
      {/* Sender indicator */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
        {isBot ? (
          <>
            <Sparkles className="w-3 h-3 text-saffron-500" />
            <span>Godavari Seva Assistant</span>
            <span className="text-[9px] bg-teal-50 text-teal-800 font-mono px-1 rounded border border-teal-200">
              Verified DB
            </span>
          </>
        ) : (
          <>
            <span>You (Pilgrim)</span>
            <User className="w-3 h-3 text-slate-400" />
          </>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isBot
            ? 'bg-white border border-teal-100 shadow-xs text-slate-800 rounded-tl-sm'
            : 'bg-teal-800 text-white shadow-sm rounded-tr-sm font-medium'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* TTS speaker trigger for assistant messages */}
        {isBot && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            <button
              type="button"
              onClick={handleSpeak}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-saffron-100 text-saffron-800 animate-pulse'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-teal-900'
              }`}
              title={isSpeaking ? 'Stop Audio' : 'Listen Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 text-saffron-600" /> : <Volume2 className="w-3 h-3 text-teal-700" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Facilities Cards Attachment */}
      {isBot && message.facilities && message.facilities.length > 0 && (
        <div className="w-full space-y-2 pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
            Matching Facilities on Ground:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {message.facilities.map((fac) => (
              <ChatFacilityCard key={fac.id || fac._id} facility={fac} onShowOnMap={onShowOnMap} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

