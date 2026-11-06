import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  AlertCircle,
  BarChart3,
  Users,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { RealtimeAlertBanner } from '../components/common/RealtimeAlertBanner';
import { LanguageSelector } from '../components/language/LanguageSelector';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { isConnected, notificationCount } = useRealtime();

  const isActive = (path) => location.pathname === path;

  const adminNav = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'GIS Infrastructure Map', path: '/admin/map', icon: MapPin },
    { name: 'Facility Management', path: '/admin/facilities', icon: Layers },
    { name: 'Civic Issue Reports', path: '/admin/issues', icon: AlertCircle },
    { name: 'Spatial Analytics & Gaps', path: '/admin/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'User Access Control', path: '/admin/users', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <OfflineBanner />
      <RealtimeAlertBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform transform md:translate-x-0 md:static md:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Sidebar Brand Header */}
            <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  GS
                </div>
                <div>
                  <span className="font-bold text-sm text-white tracking-tight">GeoSeva Authority</span>
                  <span className="text-[10px] text-teal-400 block font-medium">Pushkaralu 2027</span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Header Card */}
            <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-900 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-saffron-400">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="px-3 py-2 space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-saffron-400' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.path === '/admin/issues' && notificationCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                        +{notificationCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Pilgrim Portal</span>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700" />
                <h1 className="text-sm font-bold text-slate-800">
                  Authority Control & GIS Command Center
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <LanguageSelector compact />
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isConnected ? 'Live Sync Active' : 'Connecting Stream...'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                Pushkaralu 2027 Database
              </span>
            </div>
          </header>

          {/* Page body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
