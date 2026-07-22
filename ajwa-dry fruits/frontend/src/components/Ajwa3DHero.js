import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// 4 Premium Dry Fruit Visual Showcase Items (100% Dry Fruits & Nuts - NO human figures)
const DRY_FRUITS = [
  {
    id: 1,
    title: "ROYAL AJWA DATES",
    category: "ORGANIC DATES",
    tagline: "DIRECT FROM MADINAH, SAUDI ARABIA",
    weight: "500g Pack",
    description: "Authentic Ajwa dates with dark velvety texture, rich honey sweetness, and high potassium & antioxidant power.",
    bg: '#2C1D1A', // Rich dark date brown
    accent: '#E5A93C', // Warm gold
    badge: 'TOP SELLER',
    productId: 1,
    nutType: 'date',
    svgGraphic: (
      <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
        <defs>
          <radialGradient id="dateGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#8C4A32" />
            <stop offset="50%" stopColor="#4A2113" />
            <stop offset="100%" stopColor="#1F0B05" />
          </radialGradient>
          <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDF73" />
            <stop offset="100%" stopColor="#D49B27" />
          </linearGradient>
        </defs>
        {/* Main 3D Date Figurine Visual */}
        <ellipse cx="100" cy="105" rx="55" ry="75" fill="url(#dateGrad)" transform="rotate(-12 100 105)" />
        <ellipse cx="85" cy="80" rx="20" ry="35" fill="#A3593D" opacity="0.4" transform="rotate(-12 85 80)" />
        <path d="M 80,45 Q 95,35 110,48" stroke="url(#goldGlow)" strokeWidth="3" fill="none" opacity="0.8" />
        <ellipse cx="75" cy="70" rx="6" ry="16" fill="#FFF" opacity="0.25" transform="rotate(-15 75 70)" />
      </svg>
    )
  },
  {
    id: 2,
    title: "CALIFORNIA ALMONDS",
    category: "RAW ALMONDS",
    tagline: "CRUNCHY & OMEGA-3 POWERHOUSE",
    weight: "1 kg Pack",
    description: "Premium sun-dried California almonds. Extra crisp, unpolished, and packed with vitamin E & healthy proteins.",
    bg: '#1E2D1F', // Deep forest green
    accent: '#65C474', // Green leaf accent
    badge: '100% NATURAL',
    productId: 2,
    nutType: 'almond',
    svgGraphic: (
      <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
        <defs>
          <radialGradient id="almondGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#D9A066" />
            <stop offset="60%" stopColor="#8C5427" />
            <stop offset="100%" stopColor="#4A290E" />
          </radialGradient>
        </defs>
        {/* Main 3D Almond Visual */}
        <path d="M 100,25 C 150,60 160,140 100,175 C 40,140 50,60 100,25 Z" fill="url(#almondGrad)" transform="rotate(8 100 100)" />
        <path d="M 90,40 C 130,70 135,130 90,155" stroke="#F5C493" strokeWidth="2.5" fill="none" opacity="0.5" />
        <ellipse cx="80" cy="75" rx="8" ry="25" fill="#FFF" opacity="0.2" transform="rotate(10 80 75)" />
      </svg>
    )
  },
  {
    id: 3,
    title: "KING JUMBO CASHEWS",
    tagline: "GRADE W240 WHOLE CASHEWS",
    weight: "750g Pack",
    description: "Hand-picked jumbo cashews with a rich buttery crunch. Lightly air-roasted for unforgettable natural creaminess.",
    bg: '#2E1F2B', // Deep plum/violet
    accent: '#E87DB9', // Magenta highlight
    badge: 'PREMIUM GRADE',
    productId: 3,
    nutType: 'cashew',
    svgGraphic: (
      <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
        <defs>
          <radialGradient id="cashewGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="50%" stopColor="#E6C594" />
            <stop offset="100%" stopColor="#9C7541" />
          </radialGradient>
        </defs>
        {/* 3D Crescent Cashew Visual */}
        <path d="M 70,50 C 130,30 170,90 140,140 C 110,180 50,150 60,110 C 65,85 95,85 105,100 C 115,115 105,130 85,125 C 70,120 75,90 90,75 Z" fill="url(#cashewGrad)" transform="rotate(-15 100 100)" />
        <path d="M 85,60 C 120,48 145,90 125,125" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 4,
    title: "PISTACHIOS & WALNUTS",
    tagline: "SALTED SHELL PISTACHIOS",
    weight: "500g Pack",
    description: "Naturally opened Jumbo Iranian pistachios and brain-boosting Chilean walnut kernels, roasted to perfection.",
    bg: '#1A2936', // Dark sapphire blue
    accent: '#5BBBEA', // Sky blue accent
    badge: 'ORGANIC CROP',
    productId: 4,
    nutType: 'pistachio',
    svgGraphic: (
      <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-2xl">
        <defs>
          <radialGradient id="pistaShell" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E6D3B8" />
            <stop offset="70%" stopColor="#A88B68" />
            <stop offset="100%" stopColor="#5E4931" />
          </radialGradient>
          <radialGradient id="pistaNut" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#A1E35F" />
            <stop offset="70%" stopColor="#5D9927" />
            <stop offset="100%" stopColor="#2D520E" />
          </radialGradient>
        </defs>
        {/* Open Shell Pistachio Visual */}
        <path d="M 50,100 C 50,40 120,30 145,75 C 130,95 100,105 70,100 Z" fill="url(#pistaShell)" />
        <ellipse cx="115" cy="95" rx="35" ry="45" fill="url(#pistaNut)" transform="rotate(25 115 95)" />
        <path d="M 60,105 C 65,160 140,165 160,115 C 135,115 100,110 60,105 Z" fill="url(#pistaShell)" />
      </svg>
    )
  }
];

export default function Ajwa3DHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Read real products from Redux store
  const { products = [] } = useSelector((state) => state.productsState || {});

  // Preload & resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3D Canvas Floating/Pouring Nut Particles Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleCanvasResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    window.addEventListener('resize', handleCanvasResize);

    // Generate 28 floating 3D nut particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 12 + 6,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 0.9 + 0.4, // Falling / pouring downward motion
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      opacity: Math.random() * 0.5 + 0.25,
      color: ['#D9A066', '#8C5427', '#E6C594', '#A1E35F', '#E5A93C'][Math.floor(Math.random() * 5)]
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX + mouseOffset.x * 0.05;
        p.y += p.speedY + mouseOffset.y * 0.05;
        p.rotation += p.rotationSpeed;

        // Wrap particles around screen edges for continuous pouring
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Draw 3D oval nut shape
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Highlighting glossy surface
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.3, -p.size * 0.2, p.size * 0.3, p.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
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
  }, [mouseOffset]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

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

  const activeItem = DRY_FRUITS[activeIndex];

  // Derive active roles for 3D stack
  const centerIndex = activeIndex;
  const leftIndex = (activeIndex + 3) % 4;
  const rightIndex = (activeIndex + 1) % 4;
  const backIndex = (activeIndex + 2) % 4;

  const getRoleStyle = (index) => {
    if (index === centerIndex) {
      return {
        transform: `translate(-50%, 0) scale(${isMobile ? 1.18 : 1.55}) translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0px)`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
        left: '50%',
        height: isMobile ? '55%' : '80%',
        bottom: isMobile ? '24%' : '5%',
        cursor: 'pointer'
      };
    }
    if (index === leftIndex) {
      return {
        transform: 'translate(-50%, 0) scale(0.95)',
        filter: 'blur(3px)',
        opacity: 0.75,
        zIndex: 10,
        left: isMobile ? '16%' : '28%',
        height: isMobile ? '18%' : '28%',
        bottom: isMobile ? '34%' : '14%',
        cursor: 'pointer'
      };
    }
    if (index === rightIndex) {
      return {
        transform: 'translate(-50%, 0) scale(0.95)',
        filter: 'blur(3px)',
        opacity: 0.75,
        zIndex: 10,
        left: isMobile ? '84%' : '72%',
        height: isMobile ? '18%' : '28%',
        bottom: isMobile ? '34%' : '14%',
        cursor: 'pointer'
      };
    }
    // Back role
    return {
      transform: 'translate(-50%, 0) scale(0.85)',
      filter: 'blur(5px)',
      opacity: 0.5,
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
      onMouseMove={handleMouseMove}
      style={{
        backgroundColor: activeItem.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        minHeight: '84vh',
        color: '#ffffff'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '84vh', overflow: 'hidden' }}>
        
        {/* 1. HTML5 Canvas Pouring Nut Particles */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 4
          }}
        />

        {/* 2. Grain Noise Texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            opacity: 0.3,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* 3. Giant Ghost Typography */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '12%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(70px, 20vw, 300px)',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.08)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap'
          }}
        >
          PREMIUM NUTS
        </div>

        {/* 4. Top Badge Bar */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: isMobile ? '16px' : '32px',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span
            style={{
              background: activeItem.accent,
              color: '#000',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            {activeItem.badge}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', opacity: 0.9, textTransform: 'uppercase' }}>
            AJWA 3D CRAFT
          </span>
        </div>

        {/* 5. 3D Dry Fruit Figurine Visuals */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 15 }}>
          {DRY_FRUITS.map((item, idx) => {
            const roleStyle = getRoleStyle(idx);
            const isCenter = idx === centerIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                title={`Click to buy ${item.title}`}
                style={{
                  position: 'absolute',
                  width: isMobile ? '240px' : '360px',
                  aspectRatio: '1 / 1',
                  transition: 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, filter, opacity',
                  ...roleStyle
                }}
              >
                {/* Center 3D Radial Glow Pedestal */}
                {isCenter && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '90%',
                      height: '40px',
                      background: `radial-gradient(ellipse at center, ${activeItem.accent} 0%, rgba(0,0,0,0) 75%)`,
                      borderRadius: '50%',
                      opacity: 0.6,
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  />
                )}
                
                {/* 3D Nut Render */}
                <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>
                  {item.svgGraphic}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. Bottom Left Info Card & Navigation */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '36px',
            left: isMobile ? '16px' : '48px',
            zIndex: 60,
            maxWidth: isMobile ? '260px' : '380px'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: activeItem.accent, fontWeight: 700, marginBottom: '4px' }}>
            {activeItem.tagline}
          </div>
          
          <h1
            style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: '6px',
              fontSize: isMobile ? '20px' : '28px',
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.01em'
            }}
          >
            {activeItem.title}
          </h1>

          {/* Dynamic Price badge from database if available */}
          {(() => {
            const matchedProduct = products.find(p => p._id === activeItem.productId || p.id === activeItem.productId) || products[activeIndex];
            const dynamicPrice = matchedProduct && matchedProduct.price ? `$${matchedProduct.price}` : null;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '8px' : '14px' }}>
                {dynamicPrice && (
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>{dynamicPrice}</span>
                )}
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{activeItem.weight}</span>
              </div>
            );
          })()}

          {!isMobile && (
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.5,
                marginBottom: '18px'
              }}
            >
              {activeItem.description}
            </p>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigateCarousel('prev')}
              aria-label="Previous Nut Visual"
              style={{
                width: isMobile ? '42px' : '52px',
                height: isMobile ? '42px' : '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 150ms ease, background-color 150ms ease',
                backdropFilter: 'blur(6px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigateCarousel('next')}
              aria-label="Next Nut Visual"
              style={{
                width: isMobile ? '42px' : '52px',
                height: isMobile ? '42px' : '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 150ms ease, background-color 150ms ease',
                backdropFilter: 'blur(6px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* 7. Bottom Right Direct Buy Action Button */}
        <div
          onClick={() => handleProductClick(activeItem)}
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '36px',
            right: isMobile ? '16px' : '40px',
            zIndex: 60,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(20px, 4vw, 42px)',
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            transition: 'transform 200ms ease, opacity 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(6px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span>ORDER THIS BATCH</span>
          <div
            style={{
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
              borderRadius: '50%',
              background: activeItem.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
