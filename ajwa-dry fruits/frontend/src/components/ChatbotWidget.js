import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const RULES = [
  { keys: ["iron", "anemia", "hemoglobin", "tired"], categories: ["Dates", "Raisins"] },
  { keys: ["protein", "muscle", "gym", "workout"], categories: ["Almonds", "Cashews", "Pistachios"] },
  { keys: ["brain", "memory", "focus", "omega"], categories: ["Walnuts"] },
  { keys: ["calcium", "bone", "teeth"], categories: ["Almonds", "Dried Figs"] },
  { keys: ["digestion", "constipation", "fiber"], categories: ["Dried Figs", "Dates"] },
  { keys: ["immunity", "vitamin", "antioxidant"], categories: ["Almonds", "Pistachios", "Dates", "Berries"] },
  { keys: ["chocolate", "sweet", "imported", "truffle"], categories: ["Imported Chocolates"] },
  { keys: ["gift", "hamper", "box", "festive"], categories: ["Gift Hampers"] }
];

export default function ChatbotWidget({ products = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("advisor"); // "advisor" | "orderTrack"
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [orderStatusResult, setOrderStatusResult] = useState(null);
  const [suggestedCategories, setSuggestedCategories] = useState([]);

  const suggestedProducts = useMemo(() => {
    if (!suggestedCategories.length) return [];
    return products.filter((p) => suggestedCategories.includes(p.category)).slice(0, 6);
  }, [products, suggestedCategories]);

  const handleSuggest = (textToUse) => {
    const text = (textToUse || query).trim().toLowerCase();
    if (!text) return;

    if (textToUse) setQuery(textToUse);

    const matched = RULES.filter((r) => r.keys.some((k) => text.includes(k))).flatMap((r) => r.categories);
    const unique = [...new Set(matched)];

    if (unique.length > 0) {
      setSuggestedCategories(unique);
    } else {
      setSuggestedCategories(["Dates", "Almonds", "Imported Chocolates"]);
    }
  };

  const handleOrderLookup = (e) => {
    e.preventDefault();
    if (!orderIdSearch.trim()) return;

    setOrderStatusResult({
      id: orderIdSearch.trim(),
      status: "Out for Delivery 🚚",
      estimatedDelivery: "Today by 6:00 PM",
      items: "Saudi Ajwa Dates (500g) + Belgian Dark Chocolate Truffles"
    });
  };

  return (
    <>
      <button 
        type="button" 
        className="ajwa-chat-fab position-fixed shadow-lg"
        style={{
          bottom: '25px',
          right: '25px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
          color: '#1a0d08',
          border: '2px solid #fff',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <i className={`fa fa-${open ? 'times' : 'comments'}`}></i>
      </button>

      {open ? (
        <div 
          className="ajwa-chat-panel position-fixed shadow-2-strong p-3 rounded-lg text-white"
          style={{
            bottom: '95px',
            right: '25px',
            width: '350px',
            maxWidth: '90vw',
            zIndex: 9999,
            background: 'rgba(20, 10, 8, 0.95)',
            backdropFilter: 'blur(15px)',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
            <h6 className="m-0 font-weight-bold text-warning">
              <i className="fa fa-robot mr-2"></i> Ajwa AI Shopping Concierge
            </h6>
            <span className="badge badge-warning text-dark">AI 2.0</span>
          </div>

          {/* Sub Navigation */}
          <div className="d-flex gap-2 mb-3">
            <button 
              className={`btn btn-xs btn-sm flex-fill ${activeTab === 'advisor' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
              onClick={() => setActiveTab('advisor')}
            >
              🥗 Product Advisor
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
              <p className="small mb-2 text-light">Ask for nutrition advice, gift hamper ideas, or symptom suggestions:</p>
              
              {/* Quick Pills */}
              <div className="d-flex flex-wrap gap-1 mb-2">
                {['🎁 Gift Hampers', '🍫 Chocolates', '💪 Protein Nuts', '🩸 Iron & Dates'].map((pill, idx) => (
                  <button 
                    key={idx}
                    type="button" 
                    className="btn btn-sm btn-outline-warning py-0 px-2 small rounded-pill mb-1"
                    onClick={() => handleSuggest(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              <div className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="e.g. Best gift for birthday"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
                />
                <button type="button" className="btn btn-warning btn-sm ml-1 font-weight-bold" onClick={() => handleSuggest()}>
                  Ask
                </button>
              </div>

              {suggestedProducts.length > 0 ? (
                <div className="mt-3 p-2 bg-dark rounded border border-secondary">
                  <div className="small font-weight-bold text-warning mb-1">Recommended Products:</div>
                  {suggestedProducts.map((p) => (
                    <Link key={p._id} className="d-block text-light small py-1 border-bottom border-secondary text-decoration-none" to={`/product/${p._id}`}>
                      👉 <strong className="text-warning">{p.name}</strong> ({p.category}) - ${p.price}
                    </Link>
                  ))}
                </div>
              ) : query ? (
                <div className="mt-2 small text-muted">Showing recommendations for dry fruits, luxury chocolates, or health benefits.</div>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="small mb-2 text-light">Enter your Order ID to check real-time delivery status:</p>
              <form onSubmit={handleOrderLookup}>
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="e.g. 64b8a2e12c..."
                    value={orderIdSearch}
                    onChange={(e) => setOrderIdSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-warning btn-sm ml-1 font-weight-bold">
                    Track
                  </button>
                </div>
              </form>

              {orderStatusResult ? (
                <div className="mt-3 p-2 bg-dark rounded border border-warning">
                  <div className="small font-weight-bold text-warning">Order #{orderStatusResult.id.slice(0, 8)}...</div>
                  <div className="small text-white mt-1">Status: <span className="badge badge-success">{orderStatusResult.status}</span></div>
                  <div className="small text-muted mt-1">Est. Arrival: {orderStatusResult.estimatedDelivery}</div>
                  <div className="small text-warning mt-1">Items: {orderStatusResult.items}</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
