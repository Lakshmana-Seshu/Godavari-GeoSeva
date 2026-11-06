import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineProvider>
          <RealtimeProvider>
            <AppRoutes />
          </RealtimeProvider>
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
