import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);

  const basePrice = Number(product.price || 0);
  const offerPercentage = Number(product.offerPercentage || 0);
  const hasOffer = offerPercentage > 0;
  const finalPrice = Math.round(hasOffer ? basePrice - (basePrice * offerPercentage) / 100 : basePrice);

  const relatedProducts = useMemo(() => {
    if (!product.category) return [];
    return (products || []).filter((p) => p._id !== product._id && p.category === product.category).slice(0, 4);
  }, [products, product]);

  const increaseQty = () => {
    if (product.stock === 0 || quantity >= product.stock) return;
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity((q) => q - 1);
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

  const buyNowHandler = async (method) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock", { position: toast.POSITION.BOTTOM_CENTER });
      return;
    }
    dispatch(addCartItem(product._id, quantity));
    try {
      const { data } = await axios.get(`/api/v1/payment/redirect/${method}`);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to redirect to payment", {
        position: toast.POSITION.BOTTOM_CENTER
      });
    }
  };

  useEffect(() => {
    if (isReviewSubmitted) {
      setShowReviewModal(false);
      setReviewImage(null);
      setComment("");
      toast.success("Review submitted successfully", { position: toast.POSITION.BOTTOM_CENTER });
      dispatch(clearReviewSubmitted());
    }

    if (error) {
      toast.error(error, { position: toast.POSITION.BOTTOM_CENTER });
      dispatch(clearError());
      return;
    }

    if (!product._id || String(product._id) !== String(id) || isReviewSubmitted) {
      dispatch(getProduct(id));
    }

    dispatch(getProducts(null, null, null, null, 1));

    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id, isReviewSubmitted, error, product._id]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={product.name} />
          <div className="row f-flex justify-content-around">
            <div className="col-12 col-lg-5 img-fluid" id="product_image">
              <Carousel pause="hover">
                {product.images && product.images.length > 0
                  ? product.images.map((image) => (
                      <Carousel.Item key={image._id}>
                        <img className="d-block w-100" src={image.image} alt={product.name} height="500" width="500" />
                      </Carousel.Item>
                    ))
                  : null}
              </Carousel>
            </div>

            <div className="col-12 col-lg-5 mt-5">
              <h3>{product.name}</h3>
              <p id="product_id">Product # {product._id}</p>
              <hr />

              <div className="rating-outer">
                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
              </div>
              <span id="no_of_reviews" className="ml-2">
                {Number(product.ratings || 0).toFixed(1)}/5 ({product.numOfReviews} Reviews)
              </span>

              <hr />

              <p id="product_price">
                {hasOffer ? <span className="ajwa-old-price mr-2">Rs.{Math.round(basePrice)}</span> : null}
                Rs.{finalPrice}
              </p>
              <div className="stockCounter d-inline">
                <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
                <input type="number" className="form-control count d-inline" value={quantity} readOnly />
                <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
              </div>

              <button
                type="button"
                id="cart_btn"
                disabled={product.stock === 0}
                onClick={() => {
                  dispatch(addCartItem(product._id, quantity));
                  toast.success("Cart Item Added!", { position: toast.POSITION.BOTTOM_CENTER });
                }}
                className="btn btn-primary d-inline ml-3"
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="btn btn-success d-inline ml-2"
                onClick={() => setShowBuyModal(true)}
                disabled={product.stock === 0}
              >
                Buy Now
              </button>

              <hr />

              <p>
                Status:{" "}
                <span className={product.stock > 0 ? "greenColor" : "redColor"} id="stock_status">
                  {product.salesStatus || (product.stock > 0 ? "In Stock" : "Out of Stock")}
                </span>
              </p>

              <hr />
              <h4 className="mt-2">Description:</h4>
              <p>{product.description}</p>
              <hr />
              <p id="product_seller mb-3">
                Sold by: <strong>{product.seller}</strong>
              </p>

              {user ? (
                <button onClick={() => setShowReviewModal(true)} id="review_btn" type="button" className="btn btn-primary mt-3">
                  Submit Your Review
                </button>
              ) : (
                <div className="alert alert-danger mt-4">Login to Post Review</div>
              )}
            </div>
          </div>

          {product.reviews && product.reviews.length > 0 ? <ProductReview reviews={product.reviews} /> : null}

          <div className="container mt-4 mb-5">
            <h4>Related Products</h4>
            <div className="row">
              {relatedProducts.map((rp) => (
                <div className="col-6 col-md-3 mb-3" key={rp._id}>
                  <Link to={`/product/${rp._id}`} className="text-decoration-none">
                    <div className="card p-2">
                      {rp.images && rp.images[0] ? (
                        <img src={rp.images[0].image} alt={rp.name} style={{ height: "120px", objectFit: "cover" }} />
                      ) : null}
                      <div className="mt-2 text-dark">{rp.name}</div>
                      <small className="text-muted">Rs.{Math.round(rp.price || 0)}</small>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Submit Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label className="d-block mb-1">Rating (out of 5)</label>
              <select
                className="form-control"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>5 / 5</option>
                <option value={4}>4 / 5</option>
                <option value={3}>3 / 5</option>
                <option value={2}>2 / 5</option>
                <option value={1}>1 / 5</option>
              </select>

              <ul className="stars mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <li key={star} onClick={() => setRating(star)} className={`star ${star <= rating ? "orange" : ""}`}>
                    <i className="fa fa-star"></i>
                  </li>
                ))}
              </ul>
              <textarea
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                name="review"
                id="review"
                className="form-control mt-3"
                placeholder="Write your review"
              />
              <label className="d-block mt-3 mb-1">Upload Photo (optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
              />
              <button disabled={loading} onClick={reviewHandler} className="btn my-3 float-right review-btn px-4 text-white">
                Submit
              </button>
            </Modal.Body>
          </Modal>

          <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Select Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <button className="btn btn-outline-success btn-block mb-2" onClick={() => buyNowHandler("upi")}>
                Pay with UPI
              </button>
              <button className="btn btn-outline-primary btn-block mb-2" onClick={() => buyNowHandler("card")}>
                Pay with Card
              </button>
              <button className="btn btn-outline-dark btn-block" onClick={() => buyNowHandler("netbanking")}>
                Pay with Net Banking
              </button>
            </Modal.Body>
          </Modal>
        </Fragment>
      )}
    </Fragment>
  );
}
