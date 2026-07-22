import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

export default function Product({ product, col }) {
  const dispatch = useDispatch();
  const [selectedWeight, setSelectedWeight] = useState('500g'); // default 500g

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

  const quickAddToCart = () => {
    if (product.stock < 1) {
      toast.error('Out of stock', { position: 'bottom-center' });
      return;
    }

    dispatch(addCartItem(product._id, 1));
    toast.success(`Added ${product.name} (${selectedWeight}) to cart!`, { position: 'bottom-center' });
  };

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} mb-4`}>
      <div className="card ajwa-card rounded h-100 shadow-sm border border-secondary position-relative">
        {/* Category Badge */}
        <span 
          className="badge badge-warning text-dark font-weight-bold position-absolute top-0 left-0 m-2 px-2 py-1 shadow"
          style={{ zIndex: 5, fontSize: '0.75rem' }}
        >
          {product.category || 'Gourmet'}
        </span>

        <div className="ajwa-card-media position-relative text-center p-3">
          {product.images && product.images.length > 0 ? (
            <img className="card-img-top mx-auto img-fluid rounded" src={product.images[0].image} alt={product.name} style={{ maxHeight: '180px', objectFit: 'contain' }} />
          ) : (
            <img className="card-img-top mx-auto img-fluid rounded" src="/images/products/1.jpg" alt={product.name} style={{ maxHeight: '180px', objectFit: 'contain' }} />
          )}
          <button type="button" className="add-circle-btn" onClick={quickAddToCart} aria-label="Add to cart">
            +
          </button>
        </div>

        <div className="card-body d-flex flex-column justify-content-between p-3">
          <div>
            <h5 className="card-title ajwa-product-title mb-1">
              <Link to={`/product/${product._id}`} className="text-decoration-none text-white font-weight-bold">{product.name}</Link>
            </h5>

            {/* Weight Variant Selector */}
            <div className="d-flex gap-1 my-2 justify-content-center">
              {['250g', '500g', '1kg'].map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`btn btn-xs px-2 py-0 small font-weight-bold rounded-pill ${selectedWeight === w ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setSelectedWeight(w)}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="ajwa-rating-row d-flex align-items-center justify-content-center gap-2 mb-2">
              {hasOffer ? <span className="ajwa-old-price text-muted text-decoration-line-through small">Rs.{oldPrice}</span> : null}
              <div className="rating-outer">
                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
              </div>
              <span id="no_of_reviews" className="small text-warning">({Number(product.ratings || 0).toFixed(1)})</span>
            </div>
          </div>

          <div>
            <div className="ajwa-card-bottom-row d-flex justify-content-between align-items-center mb-2">
              <p className="card-text ajwa-price font-weight-bold text-warning h5 mb-0">Rs.{currentPrice}</p>
              <span className="small text-muted font-italic">{selectedWeight} pack</span>
            </div>

            <button type="button" className="btn ajwa-add-cart-btn btn-warning btn-block font-weight-bold text-dark shadow" onClick={quickAddToCart}>
              <i className="fa fa-shopping-basket mr-1"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
