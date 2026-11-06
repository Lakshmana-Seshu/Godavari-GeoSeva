import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Layers,
  Building2,
  AlertCircle,
  PhoneCall,
  LayoutGrid,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../language/LanguageSelector';
import './MainNavbar.css';

export const MainNavbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, isAdmin, isVolunteer } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      name: t('nav.home', 'Home'),
      path: '/',
      icon: Home,
    },
    {
      name: t('nav.map', 'Explore GIS Map'),
      path: '/map',
      icon: Layers,
      isLive: true,
    },
    {
      name: t('nav.facilities', 'Facilities Directory'),
      path: '/facilities',
      icon: Building2,
    },
    {
      name: t('nav.reportIssue', 'Report Civic Issue'),
      path: '/report-issue',
      icon: AlertCircle,
    },
    {
      name: t('nav.emergency', 'Emergency Helpline'),
      path: '/emergency',
      icon: PhoneCall,
      isEmergency: true,
    },
  ];

  return (
    <nav className="main-navbar-wrapper" aria-label="Main Navigation">
      <div className="floating-navbar">
        {/* Left Side: Core Navigation Items */}
        <div className="nav-items-group" role="menubar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                role="menuitem"
                className={`nav-link-pill ${active ? 'active' : ''} ${
                  item.isEmergency ? 'emergency-pill' : ''
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="nav-icon" aria-hidden="true" />
                <span>{item.name}</span>
                {item.isLive && (
                  <span className="map-live-dot" title="Live GIS Data Active" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Language, Dashboard & Admin Profile */}
        <div className="nav-actions-group">
          {/* 6. Language: Languages icon selector */}
          <div title="Change Language / భాషను మార్చండి">
            <LanguageSelector iconOnly />
          </div>

          <div className="nav-menu-separator" aria-hidden="true" />

          {/* 7. Dashboard: Prominent Dark Green Button */}
          <Link
            to="/admin/dashboard"
            className="dashboard-btn-prominent"
            title="Open GIS Command Center Dashboard"
          >
            <LayoutGrid className="dashboard-icon" aria-hidden="true" />
            <span>{t('nav.dashboard', 'Dashboard')}</span>
          </Link>

          <div className="nav-menu-separator" aria-hidden="true" />

          {/* 8. Admin Profile: User icon with ADMIN badge */}
          {isAuthenticated ? (
            <div className="admin-profile-pill">
              <User className="admin-avatar-icon" aria-hidden="true" />
              <span className="admin-name" title={user?.email}>
                {user?.name?.split(' ')[0] || 'Official'}
              </span>
              <span className="admin-tag-badge">
                {isAdmin ? 'ADMIN' : isVolunteer ? 'STAFF' : user?.role || 'USER'}
              </span>
              <button
                type="button"
                onClick={logout}
                className="admin-signout-btn"
                title="Sign Out of Portal"
                aria-label="Sign Out"
              >
                <LogOut style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="login-btn-prominent"
              title="Official Portal Sign In"
            >
              <Shield className="login-icon" aria-hidden="true" />
              <span>{t('nav.login', 'Admin Login')}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;

