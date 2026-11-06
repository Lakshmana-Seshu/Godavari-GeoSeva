import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  RefreshCw,
  Minus,
  Maximize2,
  ChevronDown,
  Navigation,
  Globe2,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { VoiceAssistant } from './VoiceAssistant';
import { assistantApi } from '../../api/assistantApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from '../../locales/languages';

const DEFAULT_WELCOME_MESSAGES = {
  te: 'నమస్కారం! నేను గోదావరి సేవ సహాయకుడిని. రాజమహేంద్రవరం మరియు కొవ్వూరు ప్రాంతాలలోని పుష్కరాల స్నాన ఘాట్లు, తాగునీరు, ఉచిత భోజన శాలలు, మరియు మెడికల్ క్యాంపుల వివరాల కోసం నన్ను అడగండి.',
  hi: 'नमस्ते! मैं गोदावरी सेवा सहायक हूँ। राजमहेंद्रवरम और कोव्वूर में पुष्करालु स्नान घाट, पीने का पानी, आश्रय स्थल और आपातकालीन सुविधाओं के बारे में मुझसे पूछें।',
  en: 'Namaste! I am your Godavari Seva Assistant. Ask me about Pushkaralu bathing ghats, drinking water points, medical camps, or emergency helplines in Rajahmundry & Kovvur.',
  ta: 'வணக்கம்! நான் கோதாவரி சேவா உதவியாளர். ராஜமகேந்திரவரம் மற்றும் கொவ்வூரில் புஷ்கராலு குளியல் படித்துறைகள், குடிநீர், மருத்துவ முகாம்கள் பற்றி கேளுங்கள்.',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ಗೋದಾವರಿ ಸೇವಾ ಸಹಾಯಕ. ರಾಜಮಹೇಂದ್ರವರಂ ಮತ್ತು ಕೊವ್ವೂರಿನಲ್ಲಿ ಪುಷ್ಕರ ಸ್ನಾನ ಘಟ್ಟಗಳು, ಕುಡಿಯುವ ನೀರು, ವೈದ್ಯಕೀಯ ಶಿಬಿರಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
  ur: 'آداب! میں گوداوری سیوا اسسٹنٹ ہوں۔ راجمندری اور کووور میں پشکرالو اشنان گھاٹ، پینے کا پانی اور طبی کیمپوں کے بارے میں مجھ سے پوچھیں۔',
};

const DEFAULT_SUGGESTIONS = {
  te: [
    'సమీప స్నాన ఘాట్ ఎక్కడ ఉంది?',
    'తాగునీటి కేంద్రాలు ఎక్కడ ఉన్నాయి?',
    'రాజమండ్రిలో మెడికల్ క్యాంపులు',
    'కొవ్వూరు ఘాట్లు',
    'అత్యవసర హెల్ప్‌లైన్ నంబర్లు',
  ],
  hi: [
    'निकटतम स्नान घाट कहाँ है?',
    'पीने के पानी के केंद्र',
    'राजमहेंद्रवरम में मेडिकल कैंप',
    'कोव्वूर घाट',
    'आपातकालीन हेल्पलाइन',
  ],
  en: [
    'Where is the nearest bathing ghat?',
    'Drinking water points nearby',
    'Medical camps in Rajahmundry',
    'Ghats in Kovvur',
    'Emergency helpline numbers',
  ],
  ta: [
    'அருகிலுள்ள குளியல் படித்துறை எங்கே உள்ளது?',
    'குடிநீர் புள்ளிகள்',
    'மருத்துவ முகாம்கள்',
    'அவசர உதவி எண்கள்',
  ],
  kn: [
    'ಹತ್ತಿರದ ಸ್ನಾನ ಘಟ್ಟ ಎಲ್ಲಿದೆ?',
    'ಕುಡಿಯುವ ನೀರಿನ ಕೇಂದ್ರಗಳು',
    'ವೈದ್ಯಕೀಯ ಶಿಬಿರಗಳು',
    'ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು',
  ],
  ur: [
    'قریبی اشنان گھاٹ کہاں ہے؟',
    'پینے کے پانی کے پوائنٹس',
    'طبی کیمپ',
    'ایمرجنسی ہیلپ لائن',
  ],
};

export const GodavariSevaChatbot = ({ onShowFacilityOnMap = null }) => {
  const { i18n } = useTranslation();
  const activeLangCode = (i18n.language || 'en').slice(0, 2);
  const activeLangMeta = getLanguageByCode(activeLangCode);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const { coordinates, getCurrentLocation, isLocating } = useGeolocation();

  // Initialize greeting on active language change or first render
  useEffect(() => {
    const welcomeText =
      DEFAULT_WELCOME_MESSAGES[activeLangCode] || DEFAULT_WELCOME_MESSAGES.en;
    
    // Only set initial greeting if messages is empty
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: welcomeText,
          language: activeLangCode,
          timestamp: new Date().toISOString(),
          facilities: [],
        },
      ]);
    }
  }, [activeLangCode]);

  // Load suggestions
  useEffect(() => {
    const defaultList =
      DEFAULT_SUGGESTIONS[activeLangCode] || DEFAULT_SUGGESTIONS.en;
    setSuggestions(defaultList);

    // Try fetching fresh suggestions from backend
    assistantApi
      .getSuggestions(activeLangCode)
      .then((res) => {
        if (res.data?.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      })
      .catch(() => {
        // Fallback to defaults gracefully
      });
  }, [activeLangCode]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend !== null ? textToSend : inputText).trim();
    if (!query || isLoading) return;

    // Pilgrim message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      language: activeLangCode,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await assistantApi.chat({
        message: query,
        language: activeLangCode,
        userLocation: coordinates || null,
        conversationHistory: historyPayload,
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data?.response || res.message,
        language: res.data?.language || activeLangCode,
        facilities: res.data?.facilities || [],
        helplineNumbers: res.data?.helplineNumbers || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorReply = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text:
          activeLangCode === 'te'
            ? 'క్షమించండి, సమాధానాన్ని పొందడంలో తాత్కాలిక లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
            : 'Apologies, we could not retrieve facility data right now. Please try again or check the live map.',
        language: activeLangCode,
        timestamp: new Date().toISOString(),
        facilities: [],
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscript = (transcript, isFinal) => {
    setInputText(transcript);
    if (isFinal) {
      // Automatically send query once complete sentence is captured
      handleSendMessage(transcript);
    }
  };

  const handleClearChat = () => {
    const welcomeText =
      DEFAULT_WELCOME_MESSAGES[activeLangCode] || DEFAULT_WELCOME_MESSAGES.en;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: welcomeText,
        language: activeLangCode,
        timestamp: new Date().toISOString(),
        facilities: [],
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-teal-800 to-teal-900 text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-saffron-400 cursor-pointer"
            aria-label="Open Godavari Seva Assistant"
          >
            {/* Sparkles indicator */}
            <div className="relative">
              <Sparkles className="w-5 h-5 text-saffron-300 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-teal-900 animate-pulse" />
            </div>

            <div className="text-left">
              <span className="block text-xs font-bold leading-tight tracking-wide text-white">
                Godavari Seva AI
              </span>
              <span className="block text-[10px] text-teal-200 font-medium">
                {activeLangMeta.nativeName} • Voice & GIS
              </span>
            </div>

            {/* Ripple halo effect */}
            <span className="absolute -inset-1 rounded-full border border-saffron-400/50 animate-ping pointer-events-none" />
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl bg-slate-50 border border-teal-200 flex flex-col overflow-hidden ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] h-[85vh] sm:h-[620px] max-h-[700px]'
          }`}
          dir={activeLangMeta.isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-3.5 flex items-center justify-between border-b border-teal-700/60 shadow-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-saffron-500/20 border border-saffron-400 flex items-center justify-center text-saffron-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Godavari Seva Assistant
                  </h3>
                  <span className="text-[9px] bg-teal-950/80 text-teal-200 border border-teal-700 font-mono px-1.5 py-0.2 rounded-full">
                    2027
                  </span>
                </div>
                <p className="text-[10px] text-teal-200 font-medium line-clamp-1">
                  {activeLangMeta.nativeName} ({activeLangMeta.name}) • Verified GIS Grounding
                </p>
              </div>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1 hover:text-white hover:bg-teal-700/50 rounded transition-colors"
                title="Restart conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white hover:bg-teal-700/50 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-rose-600 rounded transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Geolocation status ribbon */}
              <div className="bg-teal-50/80 px-3 py-1.5 border-b border-teal-100 flex items-center justify-between text-[11px] text-teal-900">
                <div className="flex items-center gap-1.5">
                  <MapPin className={`w-3.5 h-3.5 ${coordinates ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="font-semibold">
                    {coordinates
                      ? `GPS: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                      : 'GPS location inactive'}
                  </span>
                </div>

                {!coordinates && (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[10px] text-teal-800 font-bold bg-white px-2 py-0.5 rounded border border-teal-200 hover:bg-teal-100 cursor-pointer"
                  >
                    <Navigation className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'Enable Nearby GIS'}</span>
                  </button>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/50">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onShowOnMap={onShowFacilityOnMap}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-teal-100 max-w-[70%] shadow-xs">
                    <Sparkles className="w-4 h-4 text-saffron-500 animate-spin" />
                    <span className="text-xs text-slate-600 font-medium">
                      Consulting Pushkaralu GIS records...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips carousel */}
              {suggestions.length > 0 && (
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 flex-shrink-0">
                    <HelpCircle className="w-3 h-3 text-saffron-600" />
                    Ask:
                  </span>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      disabled={isLoading}
                      className="text-[11px] whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* Voice input button with BCP-47 language matching */}
                  <VoiceAssistant
                    language={activeLangCode}
                    onTranscript={handleVoiceTranscript}
                  />

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeLangCode === 'te'
                        ? 'గోదావరి పుష్కరాల గురించి అడగండి...'
                        : activeLangCode === 'hi'
                        ? 'गोदावरी पुष्करालु के बारे में पूछें...'
                        : 'Ask about ghats, water, medical camps...'
                    }
                    className="flex-1 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    disabled={isLoading}
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      inputText.trim() && !isLoading
                        ? 'bg-teal-800 hover:bg-teal-900 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Send Message"
                    aria-label="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GodavariSevaChatbot;

