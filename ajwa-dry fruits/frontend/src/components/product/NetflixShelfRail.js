import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

export default function NetflixShelfRail({ title, subtitle, icon, products = [], badgeText }) {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock < 1) {
      return toast.error('Product currently out of stock', { position: 'bottom-center' });
    }
    const targetId = p._id || p.id;
    dispatch(addCartItem(targetId, 1));
    toast.success(`Added ${p.name} to cart!`, { position: 'bottom-center' });
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

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="d-flex gap-3 pb-3"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((p) => {
          const imgUrl = (p.images && p.images[0] && p.images[0].image) ? p.images[0].image : '/images/products/1.jpg';
          const targetId = p._id || p.id;
          const offer = p.offerPercentage || 0;
          const finalPrice = offer > 0 ? Math.round(p.price - (p.price * offer) / 100) : p.price;

          return (
            <div
              key={targetId}
              className="flex-shrink-0"
              style={{
                width: '260px',
                scrollSnapAlign: 'start'
              }}
            >
              <div
                className="card h-100 rounded-lg text-white border transition-all position-relative shadow-lg overflow-hidden"
                style={{
                  backgroundColor: 'rgba(26, 13, 8, 0.95)',
                  borderColor: 'rgba(212, 175, 55, 0.25)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(212, 175, 55, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Badges */}
                <div className="position-absolute top-0 left-0 m-2 d-flex flex-column gap-1" style={{ zIndex: 3 }}>
                  <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 small">
                    {p.category || 'Gourmet'}
                  </span>
                  {offer > 0 && (
                    <span className="badge badge-danger text-white font-weight-bold px-2 py-1 small">
                      {offer}% OFF
                    </span>
                  )}
                </div>

                {/* Status or Reason Badge */}
                {p.recommendation_reason && (
                  <span
                    className="badge badge-dark text-warning position-absolute top-0 right-0 m-2 px-2 py-1 border border-warning small"
                    style={{ zIndex: 3, fontSize: '0.65rem' }}
                  >
                    {p.recommendation_reason.includes('Pairing') ? '⚡ Pairing' : '⭐ Top Pick'}
                  </span>
                )}

                {/* Media Image */}
                <Link to={`/product/${targetId}`} className="d-block text-center p-3 bg-dark">
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="img-fluid rounded"
                    style={{ height: '160px', width: '100%', objectFit: 'contain' }}
                  />
                </Link>

                {/* Card Body */}
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div>
                    <Link
                      to={`/product/${targetId}`}
                      className="text-decoration-none text-white font-weight-bold d-block text-truncate mb-1"
                      title={p.name}
                    >
                      {p.name}
                    </Link>

                    <div className="d-flex align-items-center justify-content-between small text-muted mb-2">
                      <span className="text-warning">
                        ⭐ {p.ratings || '4.8'} <span className="text-muted">({p.numOfReviews || 24})</span>
                      </span>
                      <span className={p.stock > 0 ? 'text-success' : 'text-danger'}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
                          ₹{p.price}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(p, e)}
                      className="btn btn-sm btn-warning text-dark font-weight-bold rounded-pill px-3 py-1 shadow"
                      title="Quick Add to Cart"
                    >
                      <i className="fa fa-shopping-cart mr-1"></i> Add
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
