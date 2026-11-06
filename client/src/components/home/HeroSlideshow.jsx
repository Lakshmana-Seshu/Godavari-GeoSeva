import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Layers,
  Compass,
  Waves,
  Droplets,
  Bath,
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  MapPin,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { getSlides } from '../../data/slides';
import './HeroSlideshow.css';

// Icon mapping helper for dynamic button & badge icons
const ICON_MAP = {
  Layers,
  Compass,
  Waves,
  Droplets,
  Bath,
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  MapPin,
  Sparkles,
  ShieldCheck,
  Info,
};

const AUTOPLAY_DURATION = 5000; // 5 seconds per slide (Section 2)

export const HeroSlideshow = ({ customSlides = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir ? i18n.dir() === 'rtl' : false;

  const slides = customSlides || getSlides();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const containerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const timerRef = useRef(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        setIsPlaying(false);
      }
    }
  }, []);

  // Preload first slide immediately, and lazy preload upcoming slides
  useEffect(() => {
    if (slides && slides.length > 0) {
      const firstImg = new Image();
      firstImg.src = slides[0].image;

      // Also preload the second slide
      if (slides[1]) {
        const nextImg = new Image();
        nextImg.src = slides[1].image;
      }
    }
  }, [slides]);

  // Navigate to Next Slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Navigate to Previous Slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Jump to specific slide
  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Autoplay timer with pause on hover or manual pause
  useEffect(() => {
    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, AUTOPLAY_DURATION);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, nextSlide]);

  // Preload upcoming slide on index change
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % slides.length;
    if (slides[nextIdx]?.image) {
      const img = new Image();
      img.src = slides[nextIdx].image;
    }
  }, [currentIndex, slides]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      if (isRTL) prevSlide();
      else nextSlide();
    } else if (e.key === 'ArrowLeft') {
      if (isRTL) nextSlide();
      else prevSlide();
    } else if (e.key === ' ') {
      // Space bar toggles play/pause
      if (e.target === containerRef.current) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    }
  };

  // Touch Swipe Handlers for mobile (Section 7)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    // Trigger only if horizontal swipe dominates vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left
        if (isRTL) prevSlide();
        else nextSlide();
      } else {
        // Swiped Right
        if (isRTL) nextSlide();
        else prevSlide();
      }
    }
  };

  // Gracefully handle image load failure
  const handleImageError = (slideId, fallbackUrl) => {
    setImageErrors((prev) => ({
      ...prev,
      [slideId]: fallbackUrl || true,
    }));
  };

  return (
    <section
      ref={containerRef}
      className="hero-slideshow-container relative w-full h-[540px] sm:h-[580px] md:h-[620px] lg:h-[660px] select-none focus:outline-none"
      aria-roledescription="carousel"
      aria-label={t('slideshow.ariaLabel', { defaultValue: 'Godavari Pushkaralu Highlights Slideshow' })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Slides Deck */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const displayImg =
            imageErrors[slide.id] === true
              ? slide.fallbackImage || slide.image
              : imageErrors[slide.id] || slide.image;

          // Multilingual translated text with fallback to slide default
          const badgeText = slide.badgeKey ? t(slide.badgeKey, { defaultValue: slide.badge }) : slide.badge;
          const headingText = slide.headingKey ? t(slide.headingKey, { defaultValue: slide.heading }) : slide.heading;
          const subheadingText = slide.subheadingKey ? t(slide.subheadingKey, { defaultValue: slide.subheading }) : slide.subheading;
          const descriptionText = slide.descriptionKey ? t(slide.descriptionKey, { defaultValue: slide.description }) : slide.description;

          const PrimaryIcon = slide.primaryButton?.iconName ? ICON_MAP[slide.primaryButton.iconName] || Layers : Layers;
          const SecondaryIcon = slide.secondaryButton?.iconName ? ICON_MAP[slide.secondaryButton.iconName] || Compass : Compass;

          return (
            <div
              key={slide.id}
              className={`hero-slide ${isActive ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={t('slideshow.slideOf', {
                current: index + 1,
                total: slides.length,
                defaultValue: `Slide ${index + 1} of ${slides.length}`,
              })}
              aria-hidden={!isActive}
            >
              {/* Slide Background Image */}
              <img
                src={displayImg}
                alt={slide.alt || slide.heading}
                className="hero-slide-image"
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={() => handleImageError(slide.id, slide.fallbackImage)}
              />

              {/* Multi-layered Cinematic Gradient Overlays (Section 2) */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-teal-950/40 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className={`absolute inset-0 ${
                  isRTL
                    ? 'bg-gradient-to-l from-slate-950/90 via-slate-950/60 to-transparent'
                    : 'bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent'
                } pointer-events-none`}
                aria-hidden="true"
              />

              {/* Geometric River Texture Overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.4) 0%, transparent 60%)',
                }}
              />

              {/* Slide Content Box */}
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl space-y-4 sm:space-y-5 text-white">
                    {/* Badge Pill */}
                    {badgeText && (
                      <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/80 border border-teal-600/60 text-xs font-semibold text-saffron-300 backdrop-blur-md shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-saffron-400 flex-shrink-0" />
                        <span>{badgeText}</span>
                      </div>
                    )}

                    {/* Main Heading (Section 3) */}
                    <h1 className="hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                      {headingText}
                    </h1>

                    {/* Subheading */}
                    {subheadingText && (
                      <h2 className="hero-subheading text-base sm:text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron-300 via-amber-200 to-teal-200 leading-snug">
                        {subheadingText}
                      </h2>
                    )}

                    {/* Description */}
                    <p className="hero-description text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl font-normal drop-shadow-sm">
                      {descriptionText}
                    </p>

                    {/* Action Buttons (Section 3) */}
                    <div className="hero-actions flex flex-wrap items-center gap-3 pt-2">
                      {slide.primaryButton && (
                        <Link
                          to={slide.primaryButton.to}
                          className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-saffron-500/25 hover:shadow-saffron-500/40 transform hover:-translate-y-0.5"
                        >
                          <PrimaryIcon className="w-4 h-4 text-slate-950" />
                          <span>
                            {slide.primaryButton.labelKey
                              ? t(slide.primaryButton.labelKey, {
                                  defaultValue: slide.primaryButton.label,
                                })
                              : slide.primaryButton.label}
                          </span>
                        </Link>
                      )}

                      {slide.secondaryButton && (
                        <Link
                          to={slide.secondaryButton.to}
                          className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all border border-slate-700/80 hover:border-teal-500/60 backdrop-blur-md shadow-lg transform hover:-translate-y-0.5"
                        >
                          <SecondaryIcon className="w-4 h-4 text-teal-400" />
                          <span>
                            {slide.secondaryButton.labelKey
                              ? t(slide.secondaryButton.labelKey, {
                                  defaultValue: slide.secondaryButton.label,
                                })
                              : slide.secondaryButton.label}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution / Location Tag (Bottom Right) */}
              {slide.attribution && (
                <div
                  className={`absolute bottom-4 ${
                    isRTL ? 'left-4' : 'right-4'
                  } z-20 hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/80 backdrop-blur-xs`}
                >
                  <MapPin className="w-3 h-3 text-saffron-400" />
                  <span>{slide.attribution}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows: Previous & Next (Section 2) */}
      <button
        type="button"
        onClick={isRTL ? nextSlide : prevSlide}
        className={`slideshow-nav-btn ${isRTL ? 'right-4 sm:right-6' : 'left-4 sm:left-6'}`}
        aria-label={t('slideshow.prevSlide', { defaultValue: 'Previous Slide' })}
        title="Previous Slide (Left Arrow)"
      >
        {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </button>

      <button
        type="button"
        onClick={isRTL ? prevSlide : nextSlide}
        className={`slideshow-nav-btn ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}`}
        aria-label={t('slideshow.nextSlide', { defaultValue: 'Next Slide' })}
        title="Next Slide (Right Arrow)"
      >
        {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      {/* Bottom Floating Controls: Pagination Dots & Play/Pause */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 shadow-xl">
        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={
            isPlaying
              ? t('slideshow.pauseAutoplay', { defaultValue: 'Pause Slideshow Autoplay' })
              : t('slideshow.startAutoplay', { defaultValue: 'Resume Slideshow Autoplay' })
          }
          title={isPlaying ? 'Pause Autoplay' : 'Resume Autoplay'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-saffron-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <div className="h-3 w-[1px] bg-slate-700" aria-hidden="true" />

        {/* Pagination Dots (Section 2) */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slideshow pagination">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={t('slideshow.goToSlide', { slide: idx + 1, defaultValue: `Go to slide ${idx + 1}` })}
              onClick={() => goToSlide(idx)}
              className={`slideshow-dot ${idx === currentIndex ? 'active w-6' : 'w-2.5'}`}
            />
          ))}
        </div>

        <div className="h-3 w-[1px] bg-slate-700" aria-hidden="true" />

        {/* Slide Counter Text */}
        <span className="text-[11px] font-mono text-slate-300 font-bold">
          {currentIndex + 1} / {slides.length}
        </span>
      </div>
    </section>
  );
};

