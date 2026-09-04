import { getProductImage } from '../../utils/productImage';
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Carousel, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../layouts/Loader";
import MetaData from "../layouts/MetaData";
import ProductReview from "./ProductReview";
import { addCartItem } from "../../actions/cartActions";
import { createReview, getProduct, getProducts } from "../../actions/productActions";
import { clearError, clearProduct, clearReviewSubmitted } from "../../slices/productSlice";

export default function ProductDetail() {
  const { loading, product = {}, isReviewSubmitted, error } = useSelector((state) => state.productState);
  const { products = [] } = useSelector((state) => state.productsState);
  const { user } = useSelector((state) => state.authState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [pincode, setPincode] = useState("600001");
  const [activeTab, setActiveTab] = useState("description");

  const getWeightMultiplier = (w) => {
    if (w === '250g') return 0.55;
    if (w === '1kg') return 1.9;
    return 1.0; // 500g default
  };

  const basePrice = Math.round(Number(product.price || 0) * getWeightMultiplier(selectedWeight));
  const offerPercentage = Number(product.offerPercentage || 15);
  const hasOffer = offerPercentage > 0;
  const finalPrice = Math.round(hasOffer ? basePrice - (basePrice * offerPercentage) / 100 : basePrice);
  const savings = basePrice - finalPrice;

  const targetProductId = product._id || product.id;

  // Curate 4 related products for the bottom section
  const relatedProducts = useMemo(() => {
    const currentId = String(targetProductId || id);
    const currentCat = (product.category || '').toLowerCase();
    
    let matches = (products || []).filter(p => {
      const pid = String(p._id || p.id);
      return pid !== currentId && (p.category || '').toLowerCase() === currentCat;
    });

    if (matches.length < 4) {
      const others = (products || []).filter(p => {
        const pid = String(p._id || p.id);
        return pid !== currentId && !matches.some(m => String(m._id || m.id) === pid);
      });
      matches = [...matches, ...others];
    }
    return matches.slice(0, 4);
  }, [products, product, targetProductId, id]);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("This royal item is currently out of stock", { position: 'bottom-center' });
      return;
    }
    dispatch(addCartItem(targetProductId, quantity));
    toast.success(`Added ${quantity} x ${product.name} (${selectedWeight}) to cart!`, { position: 'bottom-center' });
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error("This royal item is currently out of stock", { position: 'bottom-center' });
      return;
    }
    dispatch(addCartItem(targetProductId, quantity));
    navigate('/shipping');
  };

  const reviewHandler = () => {
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("productId", id);
    if (reviewImage) {
      formData.append("reviewImage", reviewImage);
    }
    dispatch(createReview(formData));
  };

  const directPaymentHandler = async (method) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock", { position: 'bottom-center' });
      return;
    }
    dispatch(addCartItem(targetProductId, quantity));
    try {
      const { data } = await axios.get(`/api/v1/payment/redirect/${method}`);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to redirect to payment", {
        position: 'bottom-center'
      });
    }
  };

  useEffect(() => {
    if (isReviewSubmitted) {
      setShowReviewModal(false);
      setReviewImage(null);
      setComment("");
      toast.success("Review submitted successfully", { position: 'bottom-center' });
      dispatch(clearReviewSubmitted());
    }

    if (error) {
      toast.error(error, { position: 'bottom-center' });
      dispatch(clearError());
      return;
    }

    if (!targetProductId || String(targetProductId) !== String(id) || isReviewSubmitted) {
      dispatch(getProduct(id));
    }

    // Ensure catalog products are available for the related products section
    dispatch(getProducts(null, null, null, null, 1));

    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id, isReviewSubmitted, error, targetProductId]);

  const mainImage = getProductImage(product);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`${product.name || 'Gourmet Selection'} - Ajwa Dry Fruits`} />

          {/* Amazon-style Breadcrumbs */}
          <nav aria-label="breadcrumb" className="my-3">
            <ol className="breadcrumb bg-transparent p-0 small text-muted">
              <li className="breadcrumb-item"><Link to="/" className="text-warning">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/" className="text-warning">{product.category || 'Dry Fruits'}</Link></li>
              <li className="breadcrumb-item active text-white" aria-current="page">{product.name}</li>
            </ol>
          </nav>

          {/* Amazon-Style 3-Column Main Showcase */}
          <div className="row">
            
            {/* COLUMN 1: High-Resolution Media Gallery (col-lg-5) */}
            <div className="col-12 col-md-6 col-lg-5 mb-4">
              <div 
                className="card p-3 shadow-lg rounded-xl position-relative overflow-hidden"
                style={{
                  backgroundColor: 'rgba(20, 10, 7, 0.95)',
                  border: '1.5px solid rgba(212, 175, 55, 0.4)'
                }}
              >
                {/* Product Badge */}
                <div className="position-absolute top-0 left-0 m-3 d-flex flex-column gap-1" style={{ zIndex: 5 }}>
                  <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 shadow">
                    ⭐ {product.category || 'Royal Selection'}
                  </span>
                  {hasOffer && (
                    <span className="badge badge-danger text-white font-weight-bold px-2 py-1 shadow">
                      {offerPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Main Hero Image Carousel */}
                <div className="text-center py-2">
                  <Carousel pause="hover" indicators={false}>
                    {(product.images && product.images.length > 0
                      ? product.images
                      : [{ _id: 'default', image: mainImage }]
                    ).map((image, idx) => (
                      <Carousel.Item key={image._id || idx}>
                        <img
                          className="d-block w-100 rounded-lg shadow"
                          src={image.image || mainImage}
                          alt={product.name}
                          style={{
                            height: '380px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>

                {/* 4 Trust & Safety Pillars (Amazon Style) */}
                <div className="row text-center mt-3 pt-3 border-top border-secondary">
                  <div className="col-3 p-1">
                    <i className="fa fa-leaf text-success mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="small font-weight-bold text-white" style={{ fontSize: '0.68rem' }}>100% Pure</div>
                    <div className="text-muted" style={{ fontSize: '0.62rem' }}>Organic</div>
                  </div>
                  <div className="col-3 p-1">
                    <i className="fa fa-shield-alt text-warning mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="small font-weight-bold text-white" style={{ fontSize: '0.68rem' }}>Grade-A</div>
                    <div className="text-muted" style={{ fontSize: '0.62rem' }}>Certified</div>
                  </div>
                  <div className="col-3 p-1">
                    <i className="fa fa-truck text-info mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="small font-weight-bold text-white" style={{ fontSize: '0.68rem' }}>Express</div>
                    <div className="text-muted" style={{ fontSize: '0.62rem' }}>Delivery</div>
                  </div>
                  <div className="col-3 p-1">
                    <i className="fa fa-undo text-danger mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="small font-weight-bold text-white" style={{ fontSize: '0.68rem' }}>7-Day</div>
                    <div className="text-muted" style={{ fontSize: '0.62rem' }}>Returns</div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Product Overview & Highlights (col-lg-4) */}
            <div className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="pr-lg-2">
                <h2 className="font-weight-bold text-white mb-1" style={{ fontSize: '1.6rem', lineHeight: '1.3' }}>
                  {product.name}
                </h2>
                <div className="small text-warning mb-2">
                  <span className="text-muted">Brand: </span>Ajwa Royal Gourmet Direct
                </div>

                {/* Rating & Amazon Choice Badge */}
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <div className="rating-outer" style={{ fontSize: '0.85rem' }}>
                    <div className="rating-inner" style={{ width: `${((product.ratings || 4.9) / 5) * 100}%` }}></div>
                  </div>
                  <span className="font-weight-bold text-warning small">{Number(product.ratings || 4.9).toFixed(1)} / 5</span>
                  <span className="text-muted small">({product.numOfReviews || 128} ratings)</span>
                  <span className="badge badge-dark text-warning border border-warning px-2 py-1 small ml-1">
                    Amazon's Choice
                  </span>
                </div>

                <hr className="border-secondary my-2" />

                {/* Amazon Price Box */}
                <div className="my-2 p-2 rounded" style={{ backgroundColor: 'rgba(255, 216, 20, 0.06)', borderLeft: '4px solid #FFD814' }}>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="text-danger font-weight-bold" style={{ fontSize: '1.4rem' }}>-{offerPercentage}%</span>
                    <span className="text-white font-weight-bold" style={{ fontSize: '1.8rem' }}>₹{finalPrice}</span>
                  </div>
                  <div className="text-muted small">
                    M.R.P.: <span className="text-decoration-line-through" style={{ textDecoration: 'line-through' }}>₹{basePrice}</span>
                    <span className="text-success font-weight-bold ml-2">You Save ₹{savings} ({offerPercentage}%)</span>
                  </div>
                  <div className="text-muted small mt-1">Inclusive of all taxes. Free shipping over ₹499.</div>
                </div>

                {/* Pack Size / Weight Selector */}
                <div className="my-3">
                  <label className="font-weight-bold text-white small mb-1">Select Pack Size:</label>
                  <div className="d-flex gap-2">
                    {['250g', '500g', '1kg'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`btn btn-sm px-3 py-1 font-weight-bold rounded-pill transition-all ${
                          selectedWeight === w
                            ? 'btn-warning text-dark shadow-sm'
                            : 'btn-outline-secondary text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Payment Methods (Amazon Style) */}
                <div 
                  className="p-3 my-3 rounded"
                  style={{
                    backgroundColor: 'rgba(30, 15, 10, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="font-weight-bold text-warning small">
                      <i className="fa fa-lock mr-1"></i> Available Payment Methods:
                    </span>
                    <span className="badge badge-success small">100% Secure</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2 text-white small" style={{ fontSize: '0.78rem' }}>
                    <span className="badge badge-dark border border-secondary px-2 py-1">
                      📱 <strong>UPI Direct</strong> (GPay, PhonePe, Paytm, BHIM)
                    </span>
                    <span className="badge badge-dark border border-secondary px-2 py-1">
                      💳 <strong>Credit / Debit Cards</strong> (Visa, MasterCard, RuPay)
                    </span>
                    <span className="badge badge-dark border border-secondary px-2 py-1">
                      🏦 <strong>Net Banking</strong> (All Indian Banks)
                    </span>
                    <span className="badge badge-dark border border-secondary px-2 py-1">
                      💵 <strong>Cash on Delivery (COD)</strong> Available
                    </span>
                  </div>
                </div>

                {/* Key Highlights / Bullet Points */}
                <div className="my-3">
                  <h6 className="text-warning font-weight-bold mb-2">About this item:</h6>
                  <ul className="text-white small pl-3 mb-0" style={{ lineHeight: '1.7' }}>
                    <li>🌿 <strong>100% Pure & Handpicked:</strong> Graded for supreme size, rich texture, and peak natural sweetness.</li>
                    <li>⚡ <strong>Rich in Essential Nutrients:</strong> Packed with dietary fiber, plant protein, potassium, and vital antioxidants.</li>
                    <li>🔒 <strong>Freshness Vacuum Lock:</strong> Sealed in food-grade insulated pouches to lock in natural moisture and aroma.</li>
                    <li>🚫 <strong>Zero Artificial Additives:</strong> Free from added sugar, chemical preservatives, or coloring agents.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Amazon-Style Sticky Buy Box (col-lg-3) */}
            <div className="col-12 col-lg-3 mb-4">
              <div 
                className="card p-3 shadow-lg rounded-xl position-sticky"
                style={{
                  top: '90px',
                  backgroundColor: 'rgba(25, 12, 8, 0.98)',
                  border: '1.5px solid #FFD814',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}
              >
                {/* Price in Buy Box */}
                <div className="mb-2">
                  <span className="text-white font-weight-bold" style={{ fontSize: '1.7rem' }}>₹{finalPrice}</span>
                  <div className="small text-success font-weight-bold">
                    <i className="fa fa-check-circle mr-1"></i> FREE Delivery
                  </div>
                  <div className="small text-muted">For orders above ₹499</div>
                </div>

                {/* Delivery Location */}
                <div className="small text-white mb-3 d-flex align-items-center gap-1">
                  <i className="fa fa-map-marker-alt text-warning"></i>
                  <span>Deliver to: <strong>India ({pincode})</strong></span>
                </div>

                {/* Stock Status (Product Available) */}
                <div className="mb-3">
                  {product.stock > 0 ? (
                    <div>
                      <div className="font-weight-bold text-success" style={{ fontSize: '1.2rem' }}>
                        In Stock.
                      </div>
                      <div className="small text-muted">Ships within 24 Hours.</div>
                    </div>
                  ) : (
                    <div className="font-weight-bold text-danger" style={{ fontSize: '1.1rem' }}>
                      Currently Out of Stock.
                    </div>
                  )}
                </div>

                {/* Amazon Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-3">
                    <label className="small text-white font-weight-bold mb-1">Quantity:</label>
                    <select
                      className="form-control form-control-sm text-white"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{
                        backgroundColor: '#1a0a00',
                        border: '1.5px solid #FFD814',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                        <option key={num} value={num} disabled={num > product.stock}>
                          {num} {num === 1 ? 'pack' : 'packs'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amazon Signature Action Buttons */}
                <div className="d-flex flex-column gap-2 mb-3">
                  <button
                    type="button"
                    id="cart_btn"
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                    className="btn btn-block font-weight-bold shadow-sm py-2"
                    style={{
                      backgroundColor: '#FFD814',
                      borderColor: '#FCD200',
                      color: '#0F1111',
                      borderRadius: '25px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <i className="fa fa-shopping-cart mr-1"></i> Add to Cart
                  </button>

                  <button
                    type="button"
                    className="btn btn-block font-weight-bold shadow-sm py-2"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    style={{
                      backgroundColor: '#FFA41C',
                      borderColor: '#FF8F00',
                      color: '#0F1111',
                      borderRadius: '25px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <i className="fa fa-bolt mr-1"></i> Buy Now
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBuyModal(true)}
                    disabled={product.stock === 0}
                    className="btn btn-sm btn-outline-warning btn-block rounded-pill mt-1"
                    style={{ fontSize: '0.8rem' }}
                  >
                    ⚡ Instant UPI / Quick Pay
                  </button>
                </div>

                {/* Amazon Trust Metadata */}
                <div className="small text-muted pt-2 border-top border-secondary">
                  <div className="d-flex justify-content-between py-1">
                    <span>Payment:</span>
                    <span className="text-white font-weight-bold"><i className="fa fa-lock text-success"></i> Secure transaction</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Ships from:</span>
                    <span className="text-white">Ajwa Express Hub</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Sold by:</span>
                    <span className="text-white">{product.seller || 'Ajwa Dry Fruits Direct'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Returns:</span>
                    <span className="text-warning">7-Day Replacement / Refund</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOWN SCROLL SECTION 1: Detailed Product Description & Specifications */}
          <div className="my-5 p-4 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(20, 10, 7, 0.95)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div className="d-flex gap-3 border-bottom border-secondary pb-2 mb-4">
              <button
                className={`btn btn-sm font-weight-bold px-3 py-2 rounded-pill ${activeTab === 'description' ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                onClick={() => setActiveTab('description')}
              >
                📖 Product Description
              </button>
              <button
                className={`btn btn-sm font-weight-bold px-3 py-2 rounded-pill ${activeTab === 'nutrition' ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                onClick={() => setActiveTab('nutrition')}
              >
                🥗 Nutritional & Health Facts
              </button>
              <button
                className={`btn btn-sm font-weight-bold px-3 py-2 rounded-pill ${activeTab === 'storage' ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                onClick={() => setActiveTab('storage')}
              >
                📦 Storage & Origin Info
              </button>
            </div>

            {activeTab === 'description' && (
              <div>
                <h5 className="text-warning font-weight-bold mb-3">Product Overview & Heritage</h5>
                <p className="text-white" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                  {product.description || "Authentic, soft, and nutrient-dense royal gourmet harvest directly imported and sealed at source. Loaded with vital minerals, plant-based proteins, and dietary fiber."}
                </p>
                <div className="row mt-4">
                  <div className="col-md-4 mb-3">
                    <div className="p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <h6 className="text-warning font-weight-bold">🌞 Sun-Ripened Harvest</h6>
                      <p className="small text-muted mb-0">Harvested at peak physiological maturity to retain intense natural flavor profile.</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <h6 className="text-warning font-weight-bold">🧪 Zero Chemicals</h6>
                      <p className="small text-muted mb-0">No sulfur dioxide, no synthetic preservatives, and zero artificial sweeteners.</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <h6 className="text-warning font-weight-bold">💎 Gourmet Culinary Grade</h6>
                      <p className="small text-muted mb-0">Perfect for daily wellness rituals, post-workout replenishment, or royal gifting.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h5 className="text-warning font-weight-bold mb-3">Nutritional Profile (Per 100g serving)</h5>
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-bordered">
                    <thead>
                      <tr>
                        <th className="text-warning">Nutrient</th>
                        <th className="text-warning">Amount per 100g</th>
                        <th className="text-warning">% Daily Value*</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Energy</td>
                        <td>282 kcal / 1180 kJ</td>
                        <td>14%</td>
                      </tr>
                      <tr>
                        <td>Dietary Fiber</td>
                        <td>8.0 g</td>
                        <td>29%</td>
                      </tr>
                      <tr>
                        <td>Plant Protein</td>
                        <td>2.5 g - 21.0 g</td>
                        <td>12%</td>
                      </tr>
                      <tr>
                        <td>Potassium</td>
                        <td>656 mg</td>
                        <td>19%</td>
                      </tr>
                      <tr>
                        <td>Magnesium & Iron</td>
                        <td>43 mg</td>
                        <td>15%</td>
                      </tr>
                      <tr>
                        <td>Natural Antioxidants (Polyphenols)</td>
                        <td>High Activity</td>
                        <td>Beneficial</td>
                      </tr>
                    </tbody>
                  </table>
                  <small className="text-muted">*Percent Daily Values are based on a 2,000 calorie diet.</small>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div>
                <h5 className="text-warning font-weight-bold mb-3">Packaging & Shelf Life Guidance</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-white font-weight-bold">📦 Freshness Instructions:</h6>
                    <ul className="text-muted small pl-3">
                      <li>Store in a cool, dry place away from direct sunlight and moisture.</li>
                      <li>For maximum longevity and crispness, refrigerate after opening in an airtight container.</li>
                      <li>Best consumed within 9 to 12 months from the packaging date.</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-white font-weight-bold">📍 Origin & Sourcing:</h6>
                    <ul className="text-muted small pl-3">
                      <li>Country of Origin: Saudi Arabia / California / Iran / Afghanistan (Authentic Import)</li>
                      <li>Processed & Packed by: Ajwa Dry Fruits & Nuts Direct, India</li>
                      <li>Customer Care Contact: 9843571235 | ajwadryfruits.nuts@gmail.com</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DOWN SCROLL SECTION 2: Customer Reviews & Ratings */}
          <div className="my-5 p-4 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(20, 10, 7, 0.95)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h4 className="text-white font-weight-bold mb-1">Customer Reviews & Ratings</h4>
                <div className="d-flex align-items-center gap-2">
                  <div className="rating-outer">
                    <div className="rating-inner" style={{ width: `${((product.ratings || 4.9) / 5) * 100}%` }}></div>
                  </div>
                  <span className="text-warning font-weight-bold">{Number(product.ratings || 4.9).toFixed(1)} out of 5</span>
                  <span className="text-muted small">({product.numOfReviews || 128} verified reviews)</span>
                </div>
              </div>

              {user ? (
                <button
                  onClick={() => setShowReviewModal(true)}
                  id="review_btn"
                  type="button"
                  className="btn btn-warning text-dark font-weight-bold rounded-pill px-4"
                >
                  <i className="fa fa-pen mr-1"></i> Write a Customer Review
                </button>
              ) : (
                <Link to="/login" className="btn btn-outline-warning rounded-pill px-3">
                  Login to Post Review
                </Link>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <ProductReview reviews={product.reviews} />
            ) : (
              <div className="alert alert-dark text-muted mb-0">
                ⭐ No customer reviews yet. Be the first royal connoisseur to share your feedback!
              </div>
            )}
          </div>

          {/* DOWN SCROLL SECTION 3: Related Products (Amazon Style "Customers who viewed this item also viewed") */}
          <div className="my-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h4 className="text-white font-weight-bold mb-0">
                  <i className="fa fa-fire text-warning mr-2"></i> Customers Who Viewed This Item Also Viewed
                </h4>
                <small className="text-muted">Handpicked companion dry fruits, nuts, and royal selections</small>
              </div>
            </div>

            <div className="row">
              {relatedProducts.map((rp) => {
                const rpImg = getProductImage(rp);
                const rpid = rp._id || rp.id;
                return (
                  <div className="col-12 col-sm-6 col-md-3 mb-4" key={rpid}>
                    <div
                      className="card h-100 rounded-xl text-white shadow-lg overflow-hidden position-relative"
                      style={{
                        backgroundColor: 'rgba(22, 11, 7, 0.95)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                    >
                      {/* Thumbnail Link */}
                      <Link to={`/product/${rpid}`} className="d-block text-decoration-none">
                        <div className="p-2 text-center">
                          <img
                            src={rpImg}
                            alt={rp.name}
                            style={{
                              height: '160px',
                              width: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          <span className="badge badge-warning text-dark font-weight-bold px-2 py-1 small mb-1">
                            {rp.category || 'Gourmet'}
                          </span>
                          <h6 className="card-title text-truncate font-weight-bold mb-1">
                            <Link to={`/product/${rpid}`} className="text-white text-decoration-none">
                              {rp.name}
                            </Link>
                          </h6>
                          <div className="small text-warning mb-2">
                            ⭐ {Number(rp.ratings || 4.8).toFixed(1)} <span className="text-muted">({rp.numOfReviews || 45})</span>
                          </div>
                        </div>

                        <div className="pt-2 border-top border-secondary d-flex align-items-center justify-content-between">
                          <span className="font-weight-bold text-warning" style={{ fontSize: '1.1rem' }}>
                            ₹{Math.round(rp.price || 0)}
                          </span>
                          <Link
                            to={`/product/${rpid}`}
                            className="btn btn-xs btn-outline-warning rounded-pill px-2 py-1 small"
                            style={{ fontSize: '0.78rem' }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Modal */}
          <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
            <Modal.Header closeButton style={{ backgroundColor: '#1a0a00', color: '#fff', borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <Modal.Title>Write a Customer Review</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#1a0a00', color: '#fff' }}>
              <label className="d-block mb-1 font-weight-bold text-warning">Overall Rating</label>
              <select
                className="form-control"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ backgroundColor: '#0d0605', color: '#fff', border: '1px solid #D4AF37' }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 / 5 - Exceptional)</option>
                <option value={4}>⭐⭐⭐⭐ (4 / 5 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 / 5 - Average)</option>
                <option value={2}>⭐⭐ (2 / 5 - Below Average)</option>
                <option value={1}>⭐ (1 / 5 - Poor)</option>
              </select>

              <textarea
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                name="review"
                id="review"
                rows="4"
                className="form-control mt-3"
                placeholder="What did you like or dislike about this royal harvest?"
                style={{ backgroundColor: '#0d0605', color: '#fff', border: '1px solid rgba(212, 175, 55, 0.4)' }}
              />
              <label className="d-block mt-3 mb-1 text-muted small">Attach Photo (Optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
              />
              <button
                disabled={loading}
                onClick={reviewHandler}
                className="btn btn-warning text-dark font-weight-bold my-3 float-right px-4 rounded-pill"
              >
                Submit Review
              </button>
            </Modal.Body>
          </Modal>

          {/* Quick Payment Modal */}
          <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
            <Modal.Header closeButton style={{ backgroundColor: '#1a0a00', color: '#fff', borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <Modal.Title>Choose Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#1a0a00', color: '#fff' }}>
              <div className="mb-3 text-center">
                <h5 className="text-warning font-weight-bold mb-1">Total: ₹{finalPrice * quantity}</h5>
                <div className="small text-muted">{product.name} ({quantity} x {selectedWeight})</div>
              </div>
              <button className="btn btn-success btn-block mb-3 py-2 font-weight-bold rounded-pill" onClick={() => directPaymentHandler("upi")}>
                📱 Pay via Instant UPI (GPay / PhonePe / Paytm / QR)
              </button>
              <button className="btn btn-primary btn-block mb-3 py-2 font-weight-bold rounded-pill" onClick={() => directPaymentHandler("card")}>
                💳 Pay via Credit / Debit Card (Visa, RuPay, Master)
              </button>
              <button className="btn btn-dark btn-block py-2 font-weight-bold rounded-pill border-secondary" onClick={() => directPaymentHandler("netbanking")}>
                🏦 Pay via Net Banking (All Indian Banks)
              </button>
            </Modal.Body>
          </Modal>
        </Fragment>
      )}
    </Fragment>
  );
}
