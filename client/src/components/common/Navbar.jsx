import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  ChevronRight,
  Home,
  Layers,
  Building2,
  AlertCircle,
  PhoneCall,
  LayoutGrid,
  Shield,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../language/LanguageSelector';
import { TopGovernmentBar } from './TopGovernmentBar';
import { ProjectBranding } from './ProjectBranding';
import { MainNavbar } from './MainNavbar';
import './Navbar.css';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, isAdmin, isVolunteer } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Shrink Navigation on Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mobileNavItems = [
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
    <header className={`portal-master-header ${isScrolled ? 'is-scrolled' : ''}`}>
      {/* ==================================================================== */}
      {/* DESKTOP VIEW: 3-Tier Government Portal Header                         */}
      {/* ==================================================================== */}
      <div className="navbar-desktop-view">
        {/* Tier A: Top Government Information Bar */}
        <TopGovernmentBar />

        {/* Tier B: Branding and Panoramic Hero Banner */}
        <ProjectBranding />

        {/* Tier C: Main Floating Navigation Menu */}
        <MainNavbar />
      </div>

      {/* ==================================================================== */}
      {/* MOBILE / TABLET VIEW: Compact Official Header & Drawer               */}
      {/* ==================================================================== */}
      <div className="navbar-mobile-header">
        <Link
          to="/"
          className="mobile-brand-link"
          onClick={() => setIsOpen(false)}
          title="Godavari GeoSeva 2027 Home"
        >
          <img
            src="/images/logos/ap-govt-emblem.png"
            alt="AP Govt Emblem"
            className="mobile-emblem-small"
          />
          <img
            src="/images/logos/godavari-maha-pushkaram-2027.png"
            alt="Godavari Maha Pushkaram 2027 Official Logo"
            className="mobile-pushkaram-small"
            onError={(e) => {
              if (!e.target.dataset.tried) {
                e.target.dataset.tried = 'true';
                e.target.src = '/images/logos/godavari-maha-pushkaram-2027.jpg';
              }
            }}
          />
          <div className="mobile-title-block">
            <span className="mobile-main-title">
              Godavari GeoSeva
              <span className="mobile-badge-2027">2027</span>
            </span>
            <span className="mobile-dept-text">Govt of Andhra Pradesh</span>
          </div>
        </Link>

        <div className="mobile-header-actions">
          <LanguageSelector iconOnly />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {isOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          {/* Godavari Panoramic Banner Card */}
          <div className="mobile-drawer-banner-card">
            <img
              src="/images/banner/godavari-river-banner.jpg"
              alt="Godavari River Pushkaram 2027"
              className="mobile-drawer-banner-img"
            />
            <div className="mobile-drawer-banner-overlay">
              <span className="mobile-drawer-banner-title">Godavari Maha Pushkaram 2027</span>
              <span className="mobile-drawer-banner-sub">Rajamahendravaram – Kovvur Corridor</span>
            </div>
          </div>

          {/* Quick Pushkaralu Emergency Helplines Strip */}
          <div className="mobile-emergency-grid">
            <a
              href="tel:1077"
              className="mobile-emergency-item control-room"
              title="Official Pushkaralu Control Room"
            >
              <span className="mobile-emergency-number">1077</span>
              <span className="mobile-emergency-label">Control Room</span>
            </a>
            <a
              href="tel:108"
              className="mobile-emergency-item ambulance"
              title="24/7 Medical Ambulance"
            >
              <span className="mobile-emergency-number">108</span>
              <span className="mobile-emergency-label">Ambulance</span>
            </a>
            <a
              href="tel:112"
              className="mobile-emergency-item police"
              title="National Emergency & Disaster"
            >
              <span className="mobile-emergency-number">112</span>
              <span className="mobile-emergency-label">Emergency</span>
            </a>
          </div>

          {/* Navigation Links List */}
          <ul className="mobile-menu-list">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-nav-item-link ${active ? 'active' : ''} ${item.isEmergency ? 'emergency-link' : ''
                      }`}
                  >
                    <div className="mobile-link-left">
                      <Icon style={{ width: 18, height: 18 }} />
                      <span>{item.name}</span>
                      {item.isLive && (
                        <span className="mobile-link-badge-live">LIVE</span>
                      )}
                    </div>
                    {active ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>•</span>
                    ) : (
                      <ChevronRight style={{ width: 16, height: 16, opacity: 0.4 }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Bottom Actions: Dashboard & Admin Profile */}
          <div className="mobile-drawer-bottom">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="mobile-dashboard-link"
            >
              <LayoutGrid style={{ width: 17, height: 17, color: '#F59E0B' }} />
              <span>{t('nav.dashboard', 'Command Center Dashboard')}</span>
            </Link>

            {isAuthenticated ? (
              <div className="mobile-auth-section">
                <div className="mobile-user-info">
                  <span className="mobile-user-name">{user?.name}</span>
                  <span className="mobile-user-role">
                    {isAdmin ? 'ADMINISTRATOR' : isVolunteer ? 'FIELD VOLUNTEER' : user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="mobile-signout-btn"
                >
                  <LogOut style={{ width: 13, height: 13 }} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mobile-login-link"
              >
                <Shield style={{ width: 16, height: 16, color: '#F59E0B' }} />
                <span>Official Authority Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
