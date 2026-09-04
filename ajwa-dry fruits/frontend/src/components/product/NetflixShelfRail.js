import { getProductImage } from '../../utils/productImage';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

function NetflixShelfCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
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

  const handleReset = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  const targetId = product._id || product.id;

  const quickAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addCartItem(targetId, 1));
    toast.success(`${product.name} added to cart!`, { position: 'bottom-center' });
  };

  const handleCardClick = (e) => {
    if (e && e.target.closest('button')) return;
    navigate(`/product/${targetId}`);
  };

  const imgUrl = getProductImage(product);

  return (
    <div
      ref={cardRef}
      className="ajwa-shelf-card-3d position-relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleReset}
      onClick={handleCardClick}
      style={{
        flex: '0 0 240px',
        maxWidth: '240px',
        perspective: '1000px',
        cursor: 'pointer'
      }}
    >
      <div
        className="card h-100 rounded text-white shadow-lg overflow-hidden position-relative"
        style={{
          backgroundColor: 'rgba(22, 11, 7, 0.95)',
          border: isHovered ? '1.5px solid rgba(212, 175, 55, 0.8)' : '1px solid rgba(212, 175, 55, 0.3)',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
          boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.8), 0 0 15px rgba(212, 175, 55, 0.3)' : '0 8px 16px rgba(0,0,0,0.5)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s ease, box-shadow 0.3s ease'
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
            transition: 'opacity 0.2s ease',
            borderRadius: 'inherit'
          }}
        />

        {/* Category Pill */}
        <div className="position-absolute top-0 left-0 m-2" style={{ zIndex: 6, transform: 'translateZ(30px)' }}>
          <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 shadow small" style={{ fontSize: '0.68rem' }}>
            {product.category || 'Royal'}
          </span>
        </div>

        {/* Product Media Image (Clickable Link) */}
        <Link to={`/product/${targetId}`} className="d-block text-decoration-none" style={{ cursor: 'pointer' }}>
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
        </Link>

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
              onClick={quickAddToCart}
              className="btn btn-xs btn-outline-warning rounded-pill px-2 py-1 small"
              style={{ fontSize: '0.75rem' }}
            >
              + Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NetflixShelfRail({ title, subtitle, products = [], icon = 'fa-star' }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="ajwa-netflix-shelf my-4 position-relative">
      <div className="d-flex align-items-center justify-content-between mb-2 px-3">
        <div>
          <h4 className="mb-0 text-white font-weight-bold d-flex align-items-center gap-2">
            <i className={`fa ${icon} text-warning mr-2`}></i> {title}
          </h4>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="btn btn-sm btn-dark rounded-circle text-warning border-warning shadow"
            style={{ width: '32px', height: '32px', padding: 0 }}
            aria-label="Scroll left"
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <button
            onClick={() => scroll('right')}
            className="btn btn-sm btn-dark rounded-circle text-warning border-warning shadow"
            style={{ width: '32px', height: '32px', padding: 0 }}
            aria-label="Scroll right"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="d-flex gap-3 px-3 py-2 overflow-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory'
        }}
      >
        {products.map((p, idx) => (
          <NetflixShelfCard key={p._id || p.id || idx} product={p} />
        ))}
      </div>
    </div>
  );
}
