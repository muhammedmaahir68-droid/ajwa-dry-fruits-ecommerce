import { getProductImage } from '../../utils/productImage';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

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

  const handleTouchStart = () => {
    setIsHovered(true);
    setIsZoomed(true);
  };

  const handleReset = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
    setIsZoomed(false);
  };

  const quickAddToCart = (e) => {
    e.stopPropagation();
    const targetId = product._id || product.id;
    dispatch(addCartItem(targetId, 1));
    toast.success(`${product.name} added to cart!`, { position: 'bottom-center' });
  };

  const imgUrl = getProductImage(product);

  const targetId = product._id || product.id;

  return (
    <div
      ref={cardRef}
      className={`ajwa-shelf-card-3d position-relative ${isZoomed ? 'ajwa-3d-zoomed' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleReset}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleReset}
      onTouchCancel={handleReset}
      style={{
        flex: '0 0 240px',
        maxWidth: '240px',
        perspective: '1000px',
        zIndex: isZoomed ? 9999 : 1
      }}
    >
      <div
        className="card h-100 rounded text-white shadow-lg overflow-hidden position-relative"
        style={{
          backgroundColor: 'rgba(22, 11, 7, 0.95)',
          border: isZoomed ? '2px solid #D4AF37' : (isHovered ? '1.5px solid rgba(212, 175, 55, 0.8)' : '1px solid rgba(212, 175, 55, 0.3)'),
          transformStyle: 'preserve-3d',
          transform: isZoomed
            ? 'scale(1.15) translateZ(40px)'
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
          boxShadow: isZoomed
            ? '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.5)'
            : (isHovered ? '0 15px 30px rgba(0,0,0,0.8), 0 0 15px rgba(212, 175, 55, 0.3)' : '0 8px 16px rgba(0,0,0,0.5)'),
          transition: isHovered && !isZoomed ? 'transform 0.08s ease-out' : 'transform 0.35s ease, box-shadow 0.3s ease'
        }}
      >
        {/* Dynamic Specular Light */}
        <div
          className="position-absolute w-100 h-100 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            zIndex: 5,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 230, 150, ${glare.opacity}) 0%, transparent 60%)`,
            transition: 'opacity 0.2s ease'
          }}
        />

        {/* Category Pill */}
        <div className="position-absolute top-0 left-0 m-2" style={{ zIndex: 6, transform: 'translateZ(30px)' }}>
          <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 shadow small" style={{ fontSize: '0.68rem' }}>
            {product.category || 'Royal'}
          </span>
        </div>

        {/* Product Media Image */}
        <div className="p-2 text-center" style={{ transform: 'translateZ(20px)' }}>
          <img
            src={imgUrl}
            alt={product.name}
            style={{
              height: '135px',
              width: '100%',
              objectFit: 'cover',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* Card Body */}
        <div className="card-body p-2 d-flex flex-column justify-content-between" style={{ transform: 'translateZ(25px)' }}>
          <h6 className="card-title text-truncate mb-1 font-weight-bold">
            <Link to={`/product/${targetId}`} className="text-white text-decoration-none small">
              {product.name}
            </Link>
          </h6>
          <div className="small text-muted mb-2">
            ⭐ {product.ratings || '4.8'} <span className="text-success ml-1">In Stock</span>
          </div>
          <div className="d-flex align-items-center justify-content-between pt-1 border-top border-secondary">
            <span className="font-weight-bold text-warning small">₹{product.price}</span>
            <button
              type="button"
              onClick={quickAddToCart}
              className="btn btn-xs btn-warning text-dark font-weight-bold px-2 py-1 rounded"
              style={{ fontSize: '0.72rem' }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NetflixShelfRail({ title, subtitle, badgeText, products = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="ajwa-shelf-rail mb-5">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="ajwa-shelf-title m-0 text-warning font-weight-bold">{title}</h4>
            {badgeText && <span className="badge badge-warning text-dark font-weight-bold small">{badgeText}</span>}
          </div>
          {subtitle && <p className="ajwa-shelf-subtitle m-0 text-muted small">{subtitle}</p>}
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-dark text-warning border-warning rounded-circle shadow"
            style={{ width: '32px', height: '32px' }}
            onClick={() => scroll('left')}
            aria-label="Previous"
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-dark text-warning border-warning rounded-circle shadow"
            style={{ width: '32px', height: '32px' }}
            onClick={() => scroll('right')}
            aria-label="Next"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="d-flex gap-3 overflow-auto pb-3 ajwa-shelf-scroll"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p) => (
          <NetflixShelfCard key={p._id || p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
