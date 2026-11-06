import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectBranding.css';

export const ProjectBranding = () => {
  return (
    <div className="project-branding" role="banner">
      <div className="branding-container">
        {/* Left & Center Branding Link */}
        <Link to="/" className="branding-main-group" title="Godavari GeoSeva 2027 Home">
          {/* Left: Official State & Pushkaralu Emblems */}
          <div className="branding-logos">
            <div className="logo-badge-ap">
              <img
                src="/images/logos/ap-govt-emblem.png"
                alt="Government of Andhra Pradesh Emblem"
                className="logo-img-ap"
              />
            </div>

            <div className="branding-divider-line" aria-hidden="true" />

            <div className="logo-badge-pushkaram">
              <img
                src="/images/logos/godavari-maha-pushkaram-2027.png"
                alt="Godavari Maha Pushkaram 2027 Emblem"
                className="logo-img-pushkaram"
                onError={(e) => {
                  if (!e.target.dataset.tried) {
                    e.target.dataset.tried = 'true';
                    e.target.src = '/images/logos/godavari-maha-pushkaram-2027.jpg';
                  }
                }}
              />
            </div>
          </div>

          <div className="branding-divider-line" aria-hidden="true" />

          {/* Center: Main Project Typography */}
          <div className="branding-typography">
            <div className="branding-top-dept">
              <span>Govt of Andhra Pradesh</span>
              <span className="dept-dot">•</span>
              <span className="dept-tag">Pushkaralu Corridor</span>
            </div>

            <div className="branding-heading-row">
              <h1 className="branding-title">
                Godavari <span className="branding-title-accent">GeoSeva</span>
              </h1>
              <span className="badge-2027">2027</span>
            </div>

            <p className="branding-subtitle">
              Rajamahendravaram – Kovvur GIS & Civic Platform
            </p>
          </div>
        </Link>

        {/* Right: Panoramic Godavari River & Heritage Banner */}
        <div className="branding-panoramic-wrapper" aria-hidden="true">
          <img
            src="/images/banner/godavari-river-banner.jpg"
            alt="Godavari River Heritage & Bridge Panorama"
            className="godavari-banner-img"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectBranding;

