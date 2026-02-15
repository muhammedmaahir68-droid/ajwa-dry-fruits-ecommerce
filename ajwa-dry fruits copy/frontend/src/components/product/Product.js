import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addCartItem } from '../../actions/cartActions';

export default function Product({ product, col }) {
  const dispatch = useDispatch();

  const basePrice = Number(product.price || 0);
  const offerPercentage = Number(product.offerPercentage || 0);
  const hasOffer = offerPercentage > 0;
  const currentPrice = Math.round(hasOffer ? basePrice - (basePrice * offerPercentage) / 100 : basePrice);
  const oldPrice = Math.round(basePrice);

  const quickAddToCart = () => {
    if (product.stock < 1) {
      toast.error('Out of stock', { position: toast.POSITION.BOTTOM_CENTER });
      return;
    }

    dispatch(addCartItem(product._id, 1));
    toast.success('Added to cart', { position: toast.POSITION.BOTTOM_CENTER });
  };

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} mb-3`}>
      <div className="card ajwa-card rounded">
        <div className="ajwa-card-media">
          {product.images.length > 0 ? (
            <img className="card-img-top mx-auto" src={product.images[0].image} alt={product.name} />
          ) : null}
          <button type="button" className="add-circle-btn" onClick={quickAddToCart} aria-label="Add to cart">
            +
          </button>
        </div>

        <div className="card-body">
          <h5 className="card-title ajwa-product-title">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h5>

          <div className="ajwa-rating-row">
            {hasOffer ? <span className="ajwa-old-price">Rs.{oldPrice}</span> : null}
            <div className="rating-outer">
              <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
            </div>
            <span id="no_of_reviews">{Number(product.ratings || 0).toFixed(1)}</span>
          </div>

          <div className="ajwa-card-bottom-row">
            <p className="card-text ajwa-price">Rs.{currentPrice}</p>
            <div className="ajwa-round-icons">
              <button type="button" className="ajwa-round-icon" aria-label="wishlist"></button>
              <button type="button" className="ajwa-round-icon" aria-label="bookmark"></button>
            </div>
          </div>

          <button type="button" className="btn ajwa-add-cart-btn" onClick={quickAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
