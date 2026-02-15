import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const RULES = [
  { keys: ["iron", "anemia", "hemoglobin", "tired"], categories: ["Dates", "Raisins"] },
  { keys: ["protein", "muscle", "gym"], categories: ["Almonds", "Cashews"] },
  { keys: ["brain", "memory", "focus", "omega"], categories: ["Walnuts"] },
  { keys: ["calcium", "bone"], categories: ["Almonds", "Dried Figs"] },
  { keys: ["digestion", "constipation", "fiber"], categories: ["Dried Figs", "Dates"] },
  { keys: ["immunity", "vitamin"], categories: ["Almonds", "Pistachios", "Dates"] }
];

export default function ChatbotWidget({ products = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestedCategories, setSuggestedCategories] = useState([]);

  const suggestedProducts = useMemo(() => {
    if (!suggestedCategories.length) return [];
    return products.filter((p) => suggestedCategories.includes(p.category)).slice(0, 6);
  }, [products, suggestedCategories]);

  const handleSuggest = () => {
    const text = query.trim().toLowerCase();
    if (!text) return;
    const matched = RULES.filter((r) => r.keys.some((k) => text.includes(k))).flatMap((r) => r.categories);
    const unique = [...new Set(matched)];
    setSuggestedCategories(unique);
  };

  return (
    <>
      <button type="button" className="ajwa-chat-fab" onClick={() => setOpen((v) => !v)}>
        AI
      </button>

      {open ? (
        <div className="ajwa-chat-panel">
          <h6>Ajwa Assistant</h6>
          <p className="mb-2">Enter symptom or vitamin deficiency for suggestions.</p>
          <div className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="e.g. iron deficiency"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="btn btn-success ml-2" onClick={handleSuggest}>
              Ask
            </button>
          </div>
          <small className="d-block mt-2 text-muted">Not a medical diagnosis.</small>

          {suggestedProducts.length ? (
            <div className="mt-3">
              {suggestedProducts.map((p) => (
                <Link key={p._id} className="d-block ajwa-chat-link" to={`/product/${p._id}`}>
                  {p.name} ({p.category})
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="mt-3">No exact match found. Try: iron, digestion, immunity, calcium, protein.</div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
