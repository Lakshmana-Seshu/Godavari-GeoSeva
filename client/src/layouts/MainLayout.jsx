import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { GodavariSevaChatbot } from '../components/assistant/GodavariSevaChatbot';

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <OfflineBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <GodavariSevaChatbot />
      <Footer />
    </div>
  );
};
