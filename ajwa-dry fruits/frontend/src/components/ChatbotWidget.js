import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCartItem } from '../actions/cartActions';
import { toast } from 'react-toastify';

const QUICK_PROMPTS = [
  "📞 Ajwa Customer Care number",
  "🔄 How to return an order?",
  "⛔ How to cancel order before shipping?",
  "🚚 Track my shipment status",
  "Dates for energy & stamina",
  "Weight loss mix under ₹1000"
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('advisor');
  const [query, setQuery] = useState('');
  const [aiReply, setAiReply] = useState("Greetings! I am the Ajwa AI Concierge. Ask me about our royal dry fruits collection, nutritional benefits, instant cancellations, 7-day returns, or 24/7 Customer Care helpline (+91 98765 43210)!");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [appliedBudget, setAppliedBudget] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Order Tracking State
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [orderStatusResult, setOrderStatusResult] = useState(null);

  const dispatch = useDispatch();

  // Listen to open event from Header
  useEffect(() => {
    const handleOpenConcierge = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ajwa-ai-concierge', handleOpenConcierge);
    return () => window.removeEventListener('open-ajwa-ai-concierge', handleOpenConcierge);
  }, []);

  const handleAskAi = async (overridePrompt) => {
    const promptToSend = overridePrompt || query;
    if (!promptToSend.trim()) return;

    setLoadingAi(true);
    try {
      const lower = promptToSend.toLowerCase();

      // Client-side instant policy & helpline responses for zero friction
      if (lower.includes('customer care') || lower.includes('phone') || lower.includes('call') || lower.includes('contact') || lower.includes('number') || lower.includes('helpline')) {
        setAiReply("📞 **Ajwa 24/7 Dedicated Customer Care Helpline:**\n• Phone: **+91 98765 43210** (Toll-Free Direct Line)\n• Email: **care@ajwadryfruits.com**\n• Operating Hours: 24 Hours, 7 Days a week\n\nOur support experts are ready to assist you with order tracking, refunds, returns, or product recommendations!");
        setRecommendedProducts([]);
        setAppliedBudget(null);
        setLoadingAi(false);
        return;
      }

      if (lower.includes('return') || lower.includes('refund policy')) {
        setAiReply("🔄 **Ajwa 7-Day Hassle-Free Return Policy:**\n1. Go to **My Orders** in your profile.\n2. Click **Track & Details** on any delivered order.\n3. Click **'Request 7-Day Return'** and choose your reason (e.g. damaged item, quality issue, incorrect product).\n4. Our team will verify and dispatch a replacement or initiate a 100% full refund to your original payment method!");
        setRecommendedProducts([]);
        setAppliedBudget(null);
        setLoadingAi(false);
        return;
      }

      if (lower.includes('cancel') || lower.includes('cancellation')) {
        setAiReply("⛔ **Instant Order Cancellation Policy:**\n• You can cancel your order anytime **before shipping** (when status is 'Processing' or 'Packaged') directly with 1-click in **My Orders**.\n• Full refund is automatically initiated to your UPI/Card account (3-5 business days).\n• Once an order is Shipped, you can request a 7-day return after delivery!");
        setRecommendedProducts([]);
        setAppliedBudget(null);
        setLoadingAi(false);
        return;
      }

      if (lower.includes('track') || lower.includes('status') || lower.includes('shipping stage')) {
        setActiveTab('orderTrack');
        setAiReply("📦 **Order Lifecycle Stages:**\n1. **Processing**: Order confirmed and payment verified.\n2. **Packaged**: Sealed with Freshness Lock.\n3. **Shipped**: Dispatched with courier partner & tracking AWB.\n4. **Out for Delivery**: Arriving at your doorstep today.\n5. **Delivered**: Successfully received!\n\nEnter your Order ID below to track live!");
        setLoadingAi(false);
        return;
      }

      const res = await axios.post('/api/v1/ai/sommelier-recommend', { query: promptToSend });
      if (res.data.success) {
        setAiReply(res.data.data.analysis);
        setRecommendedProducts(res.data.data.recommendedProducts || []);
        setAppliedBudget(res.data.data.budgetCap);
      }
    } catch (err) {
      setAiReply("I am here to help! You can reach our 24/7 Ajwa Helpline at +91 98765 43210 or care@ajwadryfruits.com for immediate support with orders, cancellations, and returns.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddToCart = (product) => {
    const targetId = product._id || product.id;
    dispatch(addCartItem(targetId, 1));
    toast.success(`${product.name} added to cart!`, { position: 'bottom-center' });
  };

  const handleOrderLookup = async (e) => {
    e.preventDefault();
    if (!orderIdSearch.trim()) return;

    try {
      const res = await axios.get(`/api/v1/order/${orderIdSearch.trim()}`);
      if (res.data.success && res.data.order) {
        const o = res.data.order;
        setOrderStatusResult({
          id: o._id || o.id,
          status: o.orderStatus || 'Processing',
          total: o.totalPrice,
          items: o.orderItems ? `${o.orderItems.length} item(s)` : 'N/A',
          courier: o.trackingInfo?.courier || 'Express Courier',
          trackingNumber: o.trackingInfo?.trackingNumber || 'Assigned upon dispatch',
          estimatedDelivery: o.trackingInfo?.estimatedDelivery || '2-4 business days'
        });
      }
    } catch (err) {
      toast.error('Order not found. Please verify your Order ID.');
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-warning rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '60px',
          height: '60px',
          zIndex: 9999,
          boxShadow: '0 8px 25px rgba(229, 169, 60, 0.6)',
          border: '2px solid #fff'
        }}
        title="Ajwa AI Concierge & Customer Care"
      >
        <i className={`fa ${isOpen ? 'fa-times' : 'fa-comments'} fa-2x text-dark`}></i>
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className="rounded p-3 text-white"
          style={{
            position: 'fixed',
            bottom: '95px',
            right: '25px',
            width: '380px',
            maxWidth: '92vw',
            zIndex: 9998,
            background: 'rgba(20, 10, 8, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 10px 35px rgba(0,0,0,0.85)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
            <div>
              <h6 className="m-0 font-weight-bold text-warning d-flex align-items-center">
                <i className="fa fa-robot mr-2"></i> Ajwa AI Concierge & Support
              </h6>
              <small className="text-muted">24/7 Helpline: +91 98765 43210</small>
            </div>
            <span className="badge badge-warning text-dark font-weight-bold">LIVE AI</span>
          </div>

          {/* Sub Navigation */}
          <div className="d-flex gap-2 mb-3">
            <button 
              className={`btn btn-xs btn-sm flex-fill ${activeTab === 'advisor' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
              onClick={() => setActiveTab('advisor')}
            >
              🥗 AI Advisor & Help
            </button>
            <button 
              className={`btn btn-xs btn-sm flex-fill ${activeTab === 'orderTrack' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
              onClick={() => setActiveTab('orderTrack')}
            >
              📦 Track Order
            </button>
          </div>

          {activeTab === 'advisor' ? (
            <div>
              {/* Quick AI Prompts */}
              <div className="small text-muted mb-1">Frequently Asked Queries:</div>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button 
                    key={idx}
                    type="button" 
                    className="btn btn-sm btn-outline-warning py-0 px-2 small rounded-pill mb-1"
                    style={{ fontSize: '0.72rem', backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                    onClick={() => handleAskAi(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="d-flex mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm bg-dark text-white border-secondary small"
                  placeholder="Ask about returns, orders, care helpline, health..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                />
                <button 
                  type="button" 
                  disabled={loadingAi}
                  className="btn btn-warning btn-sm ml-1 font-weight-bold text-dark" 
                  onClick={() => handleAskAi()}
                >
                  {loadingAi ? <i className="fa fa-spinner fa-spin"></i> : "Ask"}
                </button>
              </div>

              {/* AI Response Card */}
              <div 
                className="p-3 rounded mb-2 border border-secondary"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-warning font-weight-bold">
                    <i className="fa fa-sparkles mr-1"></i> AI Concierge Response
                  </span>
                  {appliedBudget && (
                    <span className="badge badge-success small">Budget: ≤ ₹{appliedBudget}</span>
                  )}
                </div>
                <p className="small text-light m-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {aiReply}
                </p>
              </div>

              {/* Matched Product Cards */}
              {recommendedProducts.length > 0 && (
                <div className="mt-2">
                  <div className="small font-weight-bold text-warning text-uppercase mb-2">
                    Verified Farm Inventory Matches:
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {recommendedProducts.map((p) => {
                      const img = (p.images && p.images[0] && p.images[0].image) ? p.images[0].image : '/images/products/1.jpg';
                      const targetId = p._id || p.id;
                      return (
                        <div 
                          key={targetId}
                          className="d-flex align-items-center justify-content-between p-2 rounded border border-secondary"
                          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                          <img 
                            src={img} 
                            alt={p.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            className="mr-2 border border-secondary"
                          />
                          <div className="flex-grow-1 pr-2">
                            <Link to={`/product/${targetId}`} className="text-white text-decoration-none font-weight-bold small d-block text-truncate" style={{ maxWidth: '170px' }}>
                              {p.name}
                            </Link>
                            <div className="small text-warning">
                              ₹{p.price} <span className="text-muted ml-1">⭐ {p.ratings || '4.8'}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="btn btn-xs btn-warning text-dark font-weight-bold rounded px-2 py-1 small"
                            style={{ fontSize: '0.72rem' }}
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Call Button inside Chat */}
              <div className="mt-3 pt-2 border-top border-secondary text-center">
                <a href="tel:+919876543210" className="btn btn-outline-warning btn-sm btn-block font-weight-bold">
                  <i className="fa fa-phone mr-1"></i> Call Ajwa Care: +91 98765 43210
                </a>
              </div>
            </div>
          ) : (
            <div>
              <p className="small mb-2 text-light">Enter your Order ID to track real-time delivery status:</p>
              <form onSubmit={handleOrderLookup}>
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="e.g. 1 or 2..."
                    value={orderIdSearch}
                    onChange={(e) => setOrderIdSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-warning btn-sm ml-1 font-weight-bold text-dark">
                    Track
                  </button>
                </div>
              </form>

              {orderStatusResult && (
                <div className="mt-3 p-3 bg-dark rounded border border-warning">
                  <div className="small font-weight-bold text-warning d-flex justify-content-between">
                    <span>Order #{orderStatusResult.id}</span>
                    <span className="badge badge-success">{orderStatusResult.status}</span>
                  </div>
                  <div className="small text-white mt-2">
                    <strong>Courier:</strong> {orderStatusResult.courier}
                  </div>
                  <div className="small text-muted mt-1">
                    <strong>Tracking / AWB:</strong> {orderStatusResult.trackingNumber}
                  </div>
                  <div className="small text-warning mt-1">
                    <strong>Est. Delivery:</strong> {orderStatusResult.estimatedDelivery}
                  </div>
                  {orderStatusResult.total && (
                    <div className="small text-light mt-1 border-top border-secondary pt-1">
                      Total: Rs. {orderStatusResult.total} ({orderStatusResult.items})
                    </div>
                  )}
                  <div className="mt-2">
                    <Link to={`/order/${orderStatusResult.id}`} className="btn btn-warning btn-xs btn-block text-dark font-weight-bold">
                      View Full Order Timeline & Receipt
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
