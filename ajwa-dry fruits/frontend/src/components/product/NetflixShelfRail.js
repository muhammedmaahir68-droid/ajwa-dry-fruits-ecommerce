import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

// Individual 3D Interactive Carousel Card with Layering & Touch Zoom
function NetflixShelfCard({ product }) {
  const dispatch = useDispatch();
  const cardRef = useRef(null);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (isZoomed || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35
    });
  };

  const handleTouchMove = (e) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((y - centerY) / centerY) * -14);
    setRotateY(((x - centerX) / centerX) * 14);
  };

  const handleReset = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsZoomed(prev => !prev);
    if (!isZoomed) {
      toast.info(`🔍 3D Inspect: ${product.name}`, { position: 'bottom-center', autoClose: 1500 });
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) {
      return toast.error('Product currently out of stock', { position: 'bottom-center' });
    }
    const targetId = product._id || product.id;
    dispatch(addCartItem(targetId, 1));
    toast.success(`Added ${product.name} to cart!`, { position: 'bottom-center' });
  };

  const imgUrl = (product.images && product.images[0] && product.images[0].image)
    ? product.images[0].image
    : '/images/products/1.jpg';
  const targetId = product._id || product.id;
  const offer = product.offerPercentage || 0;
  const finalPrice = offer > 0 ? Math.round(product.price - (product.price * offer) / 100) : product.price;

  return (
    <div
      className="flex-shrink-0"
      style={{
        width: '265px',
        scrollSnapAlign: 'start',
        perspective: '1200px',
        zIndex: isZoomed ? 9999 : 1
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleReset}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleReset}
        onClick={() => isZoomed && setIsZoomed(false)}
        className="card h-100 rounded-lg text-white border position-relative shadow-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(22, 11, 7, 0.95)',
          borderColor: isZoomed ? '#D4AF37' : (isHovered ? 'rgba(212, 175, 55, 0.8)' : 'rgba(212, 175, 55, 0.25)'),
          transformStyle: 'preserve-3d',
          transform: isZoomed
            ? 'scale(1.15) translateZ(50px)'
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.03 : 1})`,
          boxShadow: isZoomed
            ? '0 25px 50px rgba(0,0,0,0.95), 0 0 30px rgba(212, 175, 55, 0.5)'
            : (isHovered ? '0 16px 32px rgba(0,0,0,0.85), 0 0 20px rgba(212, 175, 55, 0.3)' : '0 8px 16px rgba(0,0,0,0.6)'),
          transition: isHovered && !isZoomed ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease'
        }}
      >
        {/* Specular Glare Layer */}
        <div
          className="position-absolute w-100 h-100 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            zIndex: 10,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 230, 150, ${glare.opacity}) 0%, transparent 60%)`,
            transition: 'opacity 0.2s ease',
            borderRadius: 'inherit'
          }}
        />

        {/* Floating Layer 1: Badges (translateZ 55px) */}
        <div
          className="position-absolute top-0 left-0 m-2 d-flex flex-column gap-1"
          style={{ zIndex: 12, transform: 'translateZ(55px)' }}
        >
          <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 small">
            {product.category || 'Gourmet'}
          </span>
          {offer > 0 && (
            <span className="badge badge-danger text-white font-weight-bold px-2 py-1 small">
              {offer}% OFF
            </span>
          )}
        </div>

        {/* 3D Zoom Button Toggle (translateZ 60px) */}
        <button
          type="button"
          onClick={toggleZoom}
          className={`btn btn-sm position-absolute top-0 right-0 m-2 rounded-circle shadow d-flex align-items-center justify-content-center ${isZoomed ? 'btn-warning text-dark' : 'btn-dark text-warning border-warning'}`}
          style={{
            zIndex: 14,
            width: '30px',
            height: '30px',
            transform: 'translateZ(60px)',
            fontSize: '0.75rem'
          }}
          title={isZoomed ? 'Return to Normal' : '3D Zoom Inspect'}
        >
          <i className={`fa ${isZoomed ? 'fa-compress' : 'fa-search-plus'}`}></i>
        </button>

        {/* Floating Layer 2: Media Image (translateZ 35px) */}
        <Link
          to={`/product/${targetId}`}
          className="d-block text-center p-3 bg-dark"
          style={{
            transform: isZoomed ? 'translateZ(45px) scale(1.08)' : 'translateZ(35px)',
            transition: 'transform 0.3s ease'
          }}
        >
          <img
            src={imgUrl}
            alt={product.name}
            className="img-fluid rounded"
            style={{
              height: isZoomed ? '190px' : '160px',
              width: '100%',
              objectFit: 'contain',
              filter: isHovered ? 'drop-shadow(0 8px 12px rgba(212, 175, 55, 0.35))' : 'none',
              transition: 'filter 0.3s ease, height 0.3s ease'
            }}
          />
        </Link>

        {/* Floating Layer 3: Body & Action (translateZ 45px) */}
        <div
          className="card-body p-3 d-flex flex-column justify-content-between"
          style={{ transform: 'translateZ(45px)', transition: 'transform 0.3s ease' }}
        >
          <div>
            <Link
              to={`/product/${targetId}`}
              className="text-decoration-none text-white font-weight-bold d-block text-truncate mb-1"
              title={product.name}
            >
              {product.name}
            </Link>

            <div className="d-flex align-items-center justify-content-between small text-muted mb-2">
              <span className="text-warning">
                ⭐ {product.ratings || '4.8'} <span className="text-muted">({product.numOfReviews || 24})</span>
              </span>
              <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Price and Instant Quick Add */}
          <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary">
            <div>
              <span className="font-weight-bold text-warning h6 m-0">
                ₹{finalPrice}
              </span>
              {offer > 0 && (
                <span className="text-muted small text-decoration-line-through ml-2">
                  ₹{product.price}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="btn btn-sm btn-warning text-dark font-weight-bold rounded-pill px-3 py-1 shadow"
              title="Quick Add to Cart"
            >
              <i className="fa fa-shopping-cart mr-1"></i> Add
            </button>
          </div>

          {isZoomed && (
            <div className="mt-2 text-center small text-warning font-weight-bold">
              <i className="fa fa-info-circle mr-1"></i> Tap to exit zoom
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function NetflixShelfRail({ title, subtitle, icon, products = [], badgeText }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="ajwa-netflix-rail mb-5 position-relative px-2 px-md-4">
      {/* Rail Header */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="text-warning font-weight-bold m-0 d-flex align-items-center">
              {icon && <i className={`fa ${icon} mr-2 text-warning`}></i>}
              {title}
            </h4>
            {badgeText && (
              <span className="badge badge-warning text-dark font-weight-bold ml-2 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-muted small m-0 mt-1">{subtitle}</p>}
        </div>

        {/* Scroll Nav Buttons */}
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="btn btn-sm btn-outline-warning text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px', backgroundColor: 'rgba(20, 10, 8, 0.7)' }}
            title="Scroll Left"
            aria-label="Scroll Left"
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="btn btn-sm btn-outline-warning text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px', backgroundColor: 'rgba(20, 10, 8, 0.7)' }}
            title="Scroll Right"
            aria-label="Scroll Right"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track with 3D perspective */}
      <div
        ref={scrollRef}
        className="d-flex gap-3 pb-4 pt-2 px-1"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((p) => (
          <NetflixShelfCard key={p._id || p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
