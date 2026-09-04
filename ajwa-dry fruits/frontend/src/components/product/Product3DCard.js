import { getProductImage } from '../../utils/productImage';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

export default function Product3DCard({ product, col = 4 }) {
  const dispatch = useDispatch();
  const cardRef = useRef(null);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState('500g');

  const getWeightMultiplier = (w) => {
    if (w === '250g') return 0.55;
    if (w === '1kg') return 1.9;
    return 1.0; // 500g default
  };

  const basePrice = Number(product.price || 0) * getWeightMultiplier(selectedWeight);
  const offerPercentage = Number(product.offerPercentage || 0);
  const hasOffer = offerPercentage > 0;
  const currentPrice = Math.round(hasOffer ? basePrice - (basePrice * offerPercentage) / 100 : basePrice);
  const oldPrice = Math.round(basePrice);

  // 3D Perspective Tilt on Mouse Move
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

  // Touch Move / Touch Interaction
  const handleTouchMove = (e) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.4
    });
  };

  // Touch Start: Immediately highlight and zoom
  const handleTouchStart = () => {
    setIsHovered(true);
    setIsZoomed(true);
  };

  // Touch End / Mouse Leave: Instantly return to normal actual size
  const handleReset = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(prev => !prev);
  };

  const quickAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This royal harvest is currently out of stock', { position: 'bottom-center' });
      return;
    }
    const targetId = product._id || product.id;
    dispatch(addCartItem(targetId, 1));
    toast.success(`Added ${product.name} (${selectedWeight}) to cart!`, { position: 'bottom-center' });
  };

  const imgUrl = getProductImage(product);

  const targetId = product._id || product.id;

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} mb-4`}>
      <div
        ref={cardRef}
        className={`ajwa-3d-card-wrapper position-relative ${isZoomed ? 'ajwa-3d-zoomed' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleReset}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleReset}
        onTouchCancel={handleReset}
        style={{
          perspective: '1200px',
          zIndex: isZoomed ? 9999 : 1
        }}
      >
        <div
          className="card h-100 rounded-xl text-white position-relative shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'rgba(22, 11, 7, 0.95)',
            border: isZoomed ? '2px solid #D4AF37' : (isHovered ? '1.5px solid rgba(212, 175, 55, 0.8)' : '1px solid rgba(212, 175, 55, 0.25)'),
            transformStyle: 'preserve-3d',
            transform: isZoomed
              ? 'scale(1.18) translateZ(60px)'
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
            boxShadow: isZoomed
              ? '0 30px 60px rgba(0,0,0,0.95), 0 0 35px rgba(212, 175, 55, 0.5)'
              : (isHovered ? '0 18px 36px rgba(0,0,0,0.85), 0 0 20px rgba(212, 175, 55, 0.3)' : '0 10px 20px rgba(0,0,0,0.6)'),
            transition: isHovered && !isZoomed ? 'transform 0.08s ease-out' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Dynamic Specular Light Glare Layer */}
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

          {/* Floating Layer 1: Badges */}
          <div
            className="position-absolute top-0 left-0 m-2 d-flex flex-column gap-1"
            style={{
              zIndex: 12,
              transform: 'translateZ(55px)',
              transition: 'transform 0.3s ease'
            }}
          >
            <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 shadow small">
              {product.category || 'Gourmet'}
            </span>
            {hasOffer && (
              <span className="badge badge-danger text-white font-weight-bold px-2 py-1 shadow small">
                {offerPercentage}% OFF
              </span>
            )}
          </div>

          {/* Touch-to-Zoom Inspect Button Toggle */}
          <button
            type="button"
            onClick={toggleZoom}
            className={`btn btn-sm position-absolute top-0 right-0 m-2 rounded-circle shadow d-flex align-items-center justify-content-center ${isZoomed ? 'btn-warning text-dark' : 'btn-dark text-warning border-warning'}`}
            style={{
              zIndex: 14,
              width: '32px',
              height: '32px',
              transform: 'translateZ(60px)',
              fontSize: '0.8rem'
            }}
            title={isZoomed ? 'Click to Return Normal State' : 'Touch to Zoom'}
            aria-label="Zoom Inspect"
          >
            <i className={`fa ${isZoomed ? 'fa-compress' : 'fa-search-plus'}`}></i>
          </button>

          {/* Floating Layer 2: Real Product Photo Media */}
          <div
            className="ajwa-card-media position-relative text-center p-2"
            style={{
              transform: isZoomed ? 'translateZ(50px) scale(1.1)' : 'translateZ(35px)',
              transition: 'transform 0.3s ease',
              background: 'radial-gradient(circle at center, rgba(35, 18, 12, 0.6), transparent 70%)'
            }}
          >
            <img
              className="card-img-top mx-auto img-fluid rounded"
              src={imgUrl}
              alt={product.name}
              style={{
                height: isZoomed ? '210px' : '175px',
                width: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                filter: isHovered ? 'drop-shadow(0 10px 15px rgba(212, 175, 55, 0.4))' : 'none',
                transition: 'filter 0.3s ease, height 0.3s ease'
              }}
            />
          </div>

          {/* Floating Layer 3: Details & Actions */}
          <div
            className="card-body d-flex flex-column justify-content-between p-3"
            style={{
              transform: 'translateZ(45px)',
              transition: 'transform 0.3s ease'
            }}
          >
            <div>
              <h5 className="card-title ajwa-product-title mb-1">
                <Link to={`/product/${targetId}`} className="text-decoration-none text-white font-weight-bold">
                  {product.name}
                </Link>
              </h5>

              {/* Weight Selector Pill Buttons */}
              <div className="ajwa-weight-selector my-2 d-flex gap-1 justify-content-center">
                {['250g', '500g', '1kg'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeight(w);
                    }}
                    className={`btn btn-xs py-1 px-2 font-weight-bold rounded-pill transition-all ${selectedWeight === w ? 'btn-warning text-dark scale-105' : 'btn-outline-secondary text-white'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="ratings mt-auto mb-2 d-flex align-items-center justify-content-between">
                <div className="rating-outer" style={{ fontSize: '0.8rem' }}>
                  <div className="rating-inner" style={{ width: `${((product.ratings || 4.8) / 5) * 100}%` }}></div>
                </div>
                <span id="no_of_reviews" className="small text-muted">({product.numOfReviews || 24} Reviews)</span>
              </div>
            </div>

            {/* Price & Action Section */}
            <div className="pt-2 border-top border-secondary d-flex align-items-center justify-content-between">
              <div>
                <span className="font-weight-bold text-warning h5 m-0">₹{currentPrice}</span>
                {hasOffer && (
                  <span className="text-muted text-decoration-line-through small ml-2">₹{oldPrice}</span>
                )}
              </div>

              <div className="d-flex gap-2 align-items-center">
                <button
                  type="button"
                  onClick={quickAddToCart}
                  className="btn btn-warning btn-sm font-weight-bold text-dark rounded-pill px-3 shadow"
                  title="Add to Cart"
                >
                  <i className="fa fa-shopping-cart mr-1"></i> Add
                </button>
              </div>
            </div>

            {isZoomed && (
              <div className="mt-2 text-center small text-warning font-weight-bold">
                <i className="fa fa-info-circle mr-1"></i> Touch or leave to return normal size
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
