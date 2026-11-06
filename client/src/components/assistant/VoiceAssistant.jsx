import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { getLanguageByCode } from '../../locales/languages';

/**
 * VoiceAssistant component
 * Provides speech-to-text input using the browser's Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * tailored to the 22 Indian languages via BCP-47 locale tagging.
 */
export const VoiceAssistant = ({
  language = 'en',
  onTranscript,
  onSpeechEnd,
  isListeningExternal = false,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const activeLangMeta = getLanguageByCode(language);

  // Stop listening when unmounted or externally triggered
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMsg(null);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = activeLangMeta.bcp47 || 'te-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = final || interim;
        if (onTranscript && combined) {
          onTranscript(combined, Boolean(final));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak clearly into your microphone.');
        } else if (event.error === 'network') {
          setErrorMsg('Network error encountered during speech recognition.');
        } else {
          setErrorMsg(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (onSpeechEnd) {
          onSpeechEnd();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setErrorMsg('Failed to start voice recognition. Please try typing your question.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Microphone toggle button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`relative p-2.5 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm ${
          isListening
            ? 'bg-rose-600 text-white shadow-rose-300 ring-4 ring-rose-200 animate-pulse'
            : 'bg-teal-700 hover:bg-teal-800 text-white'
        }`}
        title={
          isListening
            ? `Listening in ${activeLangMeta.name} (${activeLangMeta.bcp47}). Click to stop.`
            : `Speak in ${activeLangMeta.name} (${activeLangMeta.nativeName})`
        }
        aria-label={isListening ? 'Stop listening' : 'Start speaking'}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5 px-1">
            <MicOff className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline text-xs font-bold">Listening...</span>
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}

        {/* Pulse ripple rings when active */}
        {isListening && (
          <span className="absolute -inset-1 rounded-full border-2 border-rose-400 opacity-75 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Audio Wave Visualizer bar if listening */}
      {isListening && (
        <div className="ml-2 flex items-center gap-0.5 h-4 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-full">
          <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
          <span className="w-1 bg-rose-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
          <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
          <span className="w-1 bg-rose-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3.5" />
          <span className="text-[10px] text-rose-700 font-mono font-bold ml-1">
            {activeLangMeta.bcp47}
          </span>
        </div>
      )}

      {/* Error alert toast */}
      {errorMsg && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-rose-900 text-white text-[11px] p-2 rounded-lg shadow-lg flex items-center gap-1.5 max-w-xs animate-in fade-in duration-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-rose-300 hover:text-white font-bold text-xs"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

