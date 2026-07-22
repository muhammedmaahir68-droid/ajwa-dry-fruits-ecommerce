import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 4 Premium 3D Dry Fruit Figurines & Images
const IMAGES = [
  {
    id: 1,
    title: "ROYAL AJWA DATES",
    tagline: "ORGANIC SAUDI ARABIA DATES",
    description: "Flawless 3D craft of rich, premium Ajwa dates. Shipped fresh, loaded with natural minerals & anti-oxidants.",
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#C2593F',
    panel: '#D97258',
    productId: 1
  },
  {
    id: 2,
    title: "CALIFORNIA ALMONDS",
    tagline: "CRUNCHY & OMEGA-3 RICH",
    description: "Flawless raw almonds with natural sheen & crisp taste. Hand-picked for top nutritional density.",
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#458552',
    panel: '#5C9E6A',
    productId: 2
  },
  {
    id: 3,
    title: "KING CASHEWS",
    tagline: "CREAMY W240 GRADE",
    description: "Super jumbo roasted cashews. Soft creamy bite, pristine texture, and 100% natural processing.",
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#B8558A',
    panel: '#CF6F9F',
    productId: 3
  },
  {
    id: 4,
    title: "TURKISH PISTACHIOS",
    tagline: "SALTED & LIGHTLY ROASTED",
    description: "Delicious lightly salted pistachios in open shell. High protein power snack packed with rich flavor.",
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#4683C9',
    panel: '#5E9AE0',
    productId: 4
  }
];

export default function Ajwa3DHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const navigate = useNavigate();

  // Preload images on mount
  useEffect(() => {
    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateCarousel = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % 4);
    } else {
      setActiveIndex((prev) => (prev + 3) % 4);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  const activeItem = IMAGES[activeIndex];

  // Derive roles
  const centerIndex = activeIndex;
  const leftIndex = (activeIndex + 3) % 4;
  const rightIndex = (activeIndex + 1) % 4;
  const backIndex = (activeIndex + 2) % 4;

  const getRoleStyle = (index) => {
    if (index === centerIndex) {
      return {
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
        left: '50%',
        height: isMobile ? '58%' : '88%',
        bottom: isMobile ? '24%' : '2%',
        cursor: 'pointer'
      };
    }
    if (index === leftIndex) {
      return {
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? '18%' : '30%',
        height: isMobile ? '18%' : '28%',
        bottom: isMobile ? '34%' : '14%',
        cursor: 'pointer'
      };
    }
    if (index === rightIndex) {
      return {
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? '82%' : '70%',
        height: isMobile ? '18%' : '28%',
        bottom: isMobile ? '34%' : '14%',
        cursor: 'pointer'
      };
    }
    // Back role
    return {
      transform: 'translateX(-50%) scale(1)',
      filter: 'blur(4px)',
      opacity: 0.7,
      zIndex: 5,
      left: '50%',
      height: isMobile ? '14%' : '22%',
      bottom: isMobile ? '34%' : '14%',
      cursor: 'pointer'
    };
  };

  const handleProductClick = (item) => {
    if (item.productId) {
      navigate(`/product/${item.productId}`);
    } else {
      navigate('/cart');
    }
  };

  return (
    <div
      style={{
        backgroundColor: activeItem.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        minHeight: '82vh',
        color: '#ffffff'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '82vh', overflow: 'hidden' }}>
        
        {/* 1. Grain Noise Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            opacity: 0.35,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* 2. Giant Ghost Typography */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '14%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(80px, 24vw, 340px)',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap'
          }}
        >
          3D SHAPE
        </div>

        {/* 3. Top Brand Badge */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: isMobile ? '16px' : '32px',
            zIndex: 60,
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#ffffff',
            opacity: 0.95,
            letterSpacing: '0.18em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>TOONHUB 3D</span>
          <span>AJWA CRAFT</span>
        </div>

        {/* 4. 3D Carousel Figurines */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          {IMAGES.map((item, idx) => {
            const roleStyle = getRoleStyle(idx);
            const isCenter = idx === centerIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                title={`Click to view ${item.title}`}
                style={{
                  position: 'absolute',
                  aspectRatio: '0.6 / 1',
                  transition: 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, filter, opacity',
                  ...roleStyle
                }}
              >
                {/* Glowing pedestal effect for center product */}
                {isCenter && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: '30px',
                      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
                      borderRadius: '50%',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  />
                )}
                <img
                  src={item.src}
                  alt={item.title}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                    position: 'relative',
                    zIndex: 2,
                    filter: isCenter ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' : 'none'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-Left Details & Navigation Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '40px',
            left: isMobile ? '16px' : '48px',
            zIndex: 60,
            maxWidth: isMobile ? '240px' : '340px'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.85, fontWeight: 600, marginBottom: '4px' }}>
            {activeItem.tagline}
          </div>
          <h2
            style={{
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: isMobile ? '6px' : '10px',
              fontSize: isMobile ? '18px' : '24px',
              color: '#ffffff',
              opacity: 0.98,
              letterSpacing: '0.02em',
              lineHeight: 1.2
            }}
          >
            {activeItem.title}
          </h2>

          {!isMobile && (
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.5,
                marginBottom: '16px'
              }}
            >
              {activeItem.description}
            </p>
          )}

          {/* Navigation Arrow Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigateCarousel('prev')}
              aria-label="Previous 3D Product"
              style={{
                width: isMobile ? '42px' : '54px',
                height: isMobile ? '42px' : '54px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 150ms ease, background-color 150ms ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigateCarousel('next')}
              aria-label="Next 3D Product"
              style={{
                width: isMobile ? '42px' : '54px',
                height: isMobile ? '42px' : '54px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 150ms ease, background-color 150ms ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* 6. Bottom-Right Action Link */}
        <div
          onClick={() => handleProductClick(activeItem)}
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '40px',
            right: isMobile ? '16px' : '40px',
            zIndex: 60,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(20px, 4.5vw, 48px)',
            fontWeight: 400,
            color: '#ffffff',
            opacity: 0.95,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            transition: 'opacity 200ms ease, transform 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.95';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span>BUY THIS 3D ART</span>
          <svg width={isMobile ? "20" : "32"} height={isMobile ? "20" : "32"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

      </div>
    </div>
  );
}
