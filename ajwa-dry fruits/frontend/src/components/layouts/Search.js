import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const TRENDING_SEARCHES = [
  'Royal Ajwa Dates',
  'Belgian Chocolate Truffles',
  'California Almonds',
  'Iranian Salted Pistachios',
  'Afghan Dried Figs',
  'Kashmiri Walnuts',
  'Gift Hamper'
];

const HEALTH_GOALS = [
  { label: '💪 Muscle & Gym', query: 'Almonds' },
  { label: '🧠 Brain & Focus', query: 'Walnuts' },
  { label: '🩸 Diabetes Friendly', query: 'Figs' },
  { label: '❤️ Heart Vitality', query: 'Ajwa Dates' },
  { label: '🎁 Luxury Hampers', query: 'Hamper' }
];

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const searchContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  const searchHandler = (e) => {
    if (e) e.preventDefault();
    const value = keyword.trim();
    setShowDropdown(false);
    navigate(value ? `/search/${value}` : '/');
  };

  const handleSelectQuery = (query) => {
    setKeyword(query);
    setShowDropdown(false);
    navigate(`/search/${query}`);
  };

  // Debounced Auto-Suggestion Fetcher
  useEffect(() => {
    if (!keyword.trim() || keyword.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await axios.get(`/api/v1/products?keyword=${encodeURIComponent(keyword.trim())}`);
        if (data && data.products) {
          setSuggestions(data.products.slice(0, 4));
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Click outside to close Netflix dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-Time Voice Search Engine
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser. Try Chrome or Edge.', { position: 'bottom-center' });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('🎙️ Listening... Speak dry fruit name (e.g. "Ajwa Dates" or "Almonds")', { position: 'bottom-center' });
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(res => res[0])
          .map(res => res.transcript)
          .join('');

        setKeyword(transcript);

        if (event.results[0].isFinal) {
          toast.success(`Voice Recognized: "${transcript}"`, { position: 'bottom-center' });
          setIsListening(false);
          setShowDropdown(false);
          if (transcript.trim()) {
            navigate(`/search/${transcript.trim()}`);
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        toast.error(`Voice Error: ${event.error}`, { position: 'bottom-center' });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      setKeyword('');
    }
  }, [location]);

  return (
    <div ref={searchContainerRef} className="position-relative w-100" style={{ maxWidth: '580px' }}>
      <form onSubmit={searchHandler} className="ajwa-search-form">
        <i className="fa fa-search ajwa-search-icon" aria-hidden="true"></i>
        <input
          type="text"
          id="search_field"
          className="ajwa-search-input"
          placeholder="Search Saudi Ajwa, Almonds, Chocolates..."
          style={{ paddingLeft: '48px', paddingRight: '48px' }}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowDropdown(true);
          }}
          value={keyword}
          autoComplete="off"
        />

        {/* Voice-to-Text Microphone Button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`ajwa-voice-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? 'Listening... Click to stop' : 'Click to Voice Search'}
          aria-label="Voice Search"
        >
          <i className={`fa ${isListening ? 'fa-microphone-slash text-danger' : 'fa-microphone text-warning'}`}></i>
        </button>

        <button type="submit" className="ajwa-hidden-submit" aria-label="Search"></button>
      </form>

      {/* NETFLIX-STYLE AUTO-SUGGESTION & PREDICTIVE SEARCH DROPDOWN */}
      {showDropdown && (
        <div
          className="position-absolute w-100 shadow-lg rounded-lg p-3 text-white"
          style={{
            top: '105%',
            left: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(18, 10, 8, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.85)',
            maxHeight: '480px',
            overflowY: 'auto'
          }}
        >
          {/* Real-time Product Match Suggestions */}
          {keyword.trim().length >= 2 && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary">
                <span className="small font-weight-bold text-warning text-uppercase">
                  <i className="fa fa-bolt mr-1"></i> Matching Products
                </span>
                {loadingSuggestions && <span className="small text-muted"><i className="fa fa-spinner fa-spin mr-1"></i>Searching...</span>}
              </div>

              {suggestions.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {suggestions.map((p) => {
                    const imgUrl = (p.images && p.images[0] && p.images[0].image) ? p.images[0].image : '/images/default_product.png';
                    return (
                      <Link
                        key={p._id || p.id}
                        to={`/product/${p._id || p.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="d-flex align-items-center p-2 rounded text-decoration-none text-white transition-all"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={p.name}
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                          className="mr-3 border border-secondary"
                        />
                        <div className="flex-grow-1 pr-2">
                          <div className="font-weight-bold small text-truncate" style={{ maxWidth: '280px' }}>{p.name}</div>
                          <div className="small text-muted">
                            <span className="badge badge-secondary mr-2">{p.category}</span>
                            <span>⭐ {p.ratings || '4.8'}</span>
                          </div>
                        </div>
                        <div className="text-warning font-weight-bold small">
                          ₹{p.price}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                !loadingSuggestions && (
                  <div className="text-muted small py-2">
                    No exact product match found for "{keyword}". Hit enter to search all catalog.
                  </div>
                )
              )}
            </div>
          )}

          {/* Trending Searches Section (Netflix Style) */}
          <div className="mb-3">
            <div className="small font-weight-bold text-warning text-uppercase mb-2">
              <i className="fa fa-fire mr-1"></i> Trending Superfoods
            </div>
            <div className="d-flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectQuery(item)}
                  className="btn btn-sm btn-outline-warning text-white rounded-pill px-3 py-1 small"
                  style={{ fontSize: '0.78rem', backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Shop by Health Goal Section */}
          <div>
            <div className="small font-weight-bold text-warning text-uppercase mb-2">
              <i className="fa fa-heartbeat mr-1"></i> Shop by Health Goal
            </div>
            <div className="d-flex flex-wrap gap-2">
              {HEALTH_GOALS.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => handleSelectQuery(g.query)}
                  className="btn btn-sm btn-outline-light text-warning rounded-pill px-3 py-1 small border-secondary"
                  style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
