import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHeroSlides } from '../utils/heroService';

export default function Ajwa3DHero() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Load slides & listen for live updates from Admin Dashboard
  useEffect(() => {
    const loadSlides = () => {
      const allSlides = getHeroSlides();
      const activeOnly = allSlides.filter((s) => s.status === 'Active');
      setSlides(activeOnly);
    };

    loadSlides();

    const handleUpdate = () => {
      loadSlides();
    };

    window.addEventListener('ajwa_hero_update', handleUpdate);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('ajwa_hero_update', handleUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto slide interval
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Ambient gold particle canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : 600);

    const handleCanvasResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    window.addEventListener('resize', handleCanvasResize);

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.7,
      speedY: (Math.random() - 0.5) * 0.7,
      opacity: Math.random() * 0.6 + 0.25,
      color: ['#E5A93C', '#FFDF73', '#65C474', '#E87DB9', '#5BBBEA'][Math.floor(Math.random() * 5)]
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleCanvasResize);
    };
  }, [slides.length]);

  // If NO slides published by Admin, return null so NO dummy slides or simulated content appear!
  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[activeIndex % slides.length] || slides[0];

  const navigateCarousel = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Render Full-Screen Landscape Media Background (Video or Image)
  const renderLandscapeBackgroundMedia = (slide) => {
    if (slide.mediaType === 'video' || (slide.mediaUrl && slide.mediaUrl.match(/\.(mp4|webm|ogg)$/i))) {
      return (
        <video
          key={slide.id + '-vid'}
          src={slide.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="position-absolute inset-0 w-100 h-100"
          style={{ objectFit: 'cover', zIndex: 1 }}
        />
      );
    }

    if (
      slide.mediaUrl &&
      (slide.mediaUrl.includes('youtube.com') || slide.mediaUrl.includes('youtu.be') || slide.mediaUrl.includes('embed'))
    ) {
      let embedUrl = slide.mediaUrl;
      if (embedUrl.includes('watch?v=')) {
        const videoId = embedUrl.split('watch?v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;
      }
      return (
        <div
          className="position-absolute inset-0 w-100 h-100 overflow-hidden"
          style={{ zIndex: 1, pointerEvents: 'none' }}
        >
          <iframe
            className="w-100 h-100 border-0"
            src={embedUrl}
            title={slide.title}
            allow="autoplay; encrypted-media"
            style={{
              transform: 'scale(1.25)',
              objectFit: 'cover'
            }}
          />
        </div>
      );
    }

    return (
      <img
        key={slide.id + '-img'}
        src={slide.mediaUrl}
        alt={slide.title}
        className="position-absolute inset-0 w-100 h-100 transition-all duration-700"
        style={{
          objectFit: 'cover',
          zIndex: 1
        }}
      />
    );
  };

  return (
    <div
      className="ajwa-landscape-hero-container position-relative overflow-hidden shadow-2-strong mb-4"
      style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        minHeight: isMobile ? '580px' : '80vh',
        maxHeight: '800px',
        backgroundColor: '#0A0503',
        color: '#FFFFFF'
      }}
    >
      {/* 1. FULL-SCREEN LANDSCAPE MEDIA (PHOTO OR VIDEO) */}
      {renderLandscapeBackgroundMedia(currentSlide)}

      {/* 2. CINEMATIC GRADIENT OVERLAY FOR READABILITY */}
      <div
        className="position-absolute inset-0 w-100 h-100"
        style={{
          zIndex: 2,
          background: isMobile
            ? 'linear-gradient(to top, rgba(10,5,3,0.95) 0%, rgba(10,5,3,0.65) 50%, rgba(10,5,3,0.3) 100%)'
            : 'linear-gradient(to right, rgba(10,5,3,0.95) 0%, rgba(10,5,3,0.75) 45%, rgba(10,5,3,0.25) 85%, rgba(10,5,3,0.4) 100%)'
        }}
      />

      {/* 3. PARTICLE CANVAS OVERLAY */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />

      {/* 4. HERO CONTENT & OVERLAYS — ONLY RENDER WHAT ADMIN EXPLICITLY TYPED */}
      <div
        className="container-fluid h-100 position-relative d-flex flex-column justify-content-between py-4 px-4 px-md-5"
        style={{ zIndex: 10, minHeight: isMobile ? '580px' : '80vh' }}
      >
        {/* Top Badges */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {currentSlide.badge && (
              <span
                className="badge px-3 py-2 rounded-pill font-weight-bold text-uppercase shadow-lg"
                style={{ background: '#E5A93C', color: '#000000', fontSize: '11px', letterSpacing: '1.5px' }}
              >
                {currentSlide.badge}
              </span>
            )}
            {currentSlide.offerHighlight && (
              <span
                className="badge badge-danger px-3 py-2 rounded-pill font-weight-bold text-uppercase shadow-lg"
                style={{ fontSize: '11px', letterSpacing: '1px' }}
              >
                🔥 {currentSlide.offerHighlight}
              </span>
            )}
          </div>
        </div>

        {/* Middle Main Content Block */}
        <div className="my-auto py-4" style={{ maxWidth: '650px' }}>
          
          {/* Subtitle / Tagline */}
          {currentSlide.tagline && (
            <h6 className="text-warning text-uppercase font-weight-bold letter-spacing-2 mb-2 small">
              <i className="fa fa-star text-warning mr-1"></i> {currentSlide.tagline}
            </h6>
          )}

          {/* Main Title */}
          {currentSlide.title && (
            <h1
              className="font-weight-bold text-uppercase mb-3"
              style={{
                fontSize: isMobile ? '2.2rem' : '3.4rem',
                lineHeight: 1.1,
                color: '#FFFFFF',
                textShadow: '0 4px 16px rgba(0,0,0,0.95)',
                letterSpacing: '-0.02em'
              }}
            >
              {currentSlide.title}
            </h1>
          )}

          {/* Price Tag */}
          {currentSlide.price && (
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div
                className="d-flex align-items-baseline px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1.5px solid rgba(229, 169, 60, 0.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span className="text-muted small mr-2 font-weight-bold">PRICE:</span>
                <span
                  className="font-weight-bold text-warning"
                  style={{ fontSize: '2.2rem', textShadow: '0 2px 10px rgba(229,169,60,0.5)' }}
                >
                  {currentSlide.price.toString().startsWith('₹') || currentSlide.price.toString().startsWith('Rs')
                    ? currentSlide.price
                    : `₹${currentSlide.price}`}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {currentSlide.description && (
            <p
              className="text-light mb-4 lead small"
              style={{
                opacity: 0.92,
                lineHeight: 1.6,
                maxWidth: '540px',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)'
              }}
            >
              {currentSlide.description}
            </p>
          )}

          {/* Action Button & Carousel Nav */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (currentSlide.link) navigate(currentSlide.link);
                else navigate('/cart');
              }}
              className="btn btn-warning btn-lg font-weight-bold px-4 py-3 rounded-pill shadow-2-strong text-dark d-flex align-items-center gap-2"
              style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>SHOP NOW</span>
              <i className="fa fa-arrow-right"></i>
            </button>

            {/* Prev / Next Controls */}
            {slides.length > 1 && (
              <div className="d-flex align-items-center gap-2 ml-md-3">
                <button
                  type="button"
                  onClick={() => navigateCarousel('prev')}
                  className="btn btn-outline-warning rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{
                    width: '46px',
                    height: '46px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(6px)',
                    border: '1.5px solid rgba(229,169,60,0.6)'
                  }}
                  aria-label="Previous Slide"
                >
                  <i className="fa fa-chevron-left text-warning"></i>
                </button>

                <button
                  type="button"
                  onClick={() => navigateCarousel('next')}
                  className="btn btn-outline-warning rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{
                    width: '46px',
                    height: '46px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(6px)',
                    border: '1.5px solid rgba(229,169,60,0.6)'
                  }}
                  aria-label="Next Slide"
                >
                  <i className="fa fa-chevron-right text-warning"></i>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Slide Indicators */}
        {slides.length > 1 && (
          <div className="d-flex align-items-center justify-content-between pb-2 border-top border-secondary pt-3">
            <div className="d-flex align-items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className="border-0 rounded-pill transition-all"
                  style={{
                    width: activeIndex === idx ? '36px' : '12px',
                    height: '8px',
                    backgroundColor: activeIndex === idx ? '#E5A93C' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="small text-muted font-weight-bold">
              0{activeIndex + 1} / 0{slides.length}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
