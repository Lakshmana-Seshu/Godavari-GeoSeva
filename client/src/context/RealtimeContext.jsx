import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const RealtimeContext = createContext(null);

const BROADCAST_CHANNEL_NAME = 'godavari_geoseva_realtime_bus';
const STORAGE_EVENT_KEY = 'geoseva_last_broadcast';

// Gentle two-tone audio chime using Web Audio API (zero audio file dependencies)
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.55);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const listenersRef = useRef(new Set());
  const channelRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Broadcast an event locally across browser tabs and localStorage
  const broadcastLocalEvent = useCallback((eventPayload) => {
    const payload = {
      ...eventPayload,
      timestamp: eventPayload.timestamp || new Date().toISOString(),
      source: 'local_broadcast'
    };

    // 1. Post to BroadcastChannel
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(payload);
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Storage event fallback for cross-tab sync
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify({ payload, t: Date.now() }));
    } catch {
      // Storage quota or privacy mode
    }

    // Dispatch locally in this tab as well
    handleIncomingEvent(payload);
  }, []);

  // Internal event handler
  const handleIncomingEvent = useCallback((event) => {
    if (!event || !event.type) return;

    setLatestEvent(event);

    if (event.type === 'ISSUE_REPORTED') {
      const issue = event.issue || {};
      setActiveAlert({
        id: event.referenceCode || issue.referenceCode || 'NEW-' + Date.now(),
        title: issue.title || 'New Civic Grievance Logged',
        category: issue.category || 'CIVIC_DEFECT',
        referenceCode: event.referenceCode || issue.referenceCode,
        timestamp: event.timestamp || new Date().toISOString(),
        issue
      });
      setNotificationCount((prev) => prev + 1);
      playNotificationChime();
    } else if (event.type === 'ISSUE_STATUS_UPDATED') {
      // Status update event
    }

    // Notify all registered listeners
    listenersRef.current.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in realtime event listener:', err);
      }
    });
  }, []);

  // Set up EventSource SSE connection
  useEffect(() => {
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        const streamUrl = '/api/v1/events/stream';
        const es = new EventSource(streamUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            handleIncomingEvent(data);
          } catch (err) {
            // Not a JSON message (e.g. heartbeat)
          }
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          // Attempt reconnection after 5 seconds
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('[Realtime] EventSource connection failed, relying on BroadcastChannel fallback');
      }
    };

    connectSSE();

    // Set up BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current = bc;
        bc.onmessage = (msgEvent) => {
          if (msgEvent.data) {
            handleIncomingEvent(msgEvent.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization:', err);
      }
    }

    // Set up localStorage storage event fallback for cross-tab sync
    const handleStorage = (storageEvent) => {
      if (storageEvent.key === STORAGE_EVENT_KEY && storageEvent.newValue) {
        try {
          const parsed = JSON.parse(storageEvent.newValue);
          if (parsed && parsed.payload) {
            handleIncomingEvent(parsed.payload);
          }
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [handleIncomingEvent]);

  // Subscribe helper for components
  const subscribe = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        latestEvent,
        activeAlert,
        notificationCount,
        dismissAlert,
        subscribe,
        broadcastLocalEvent,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

