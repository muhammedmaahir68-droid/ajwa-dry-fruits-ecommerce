import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const searchHandler = (e) => {
    if (e) e.preventDefault();
    const value = keyword.trim();
    navigate(value ? `/search/${value}` : '/');
  };

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
        toast.info('🎙️ Listening... Speak your search (e.g., "Ajwa Dates" or "Almonds")', { position: 'bottom-center' });
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
          if (transcript.trim()) {
            navigate(`/search/${transcript.trim()}`);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        toast.error(`Voice Error: ${event.error}`, { position: 'bottom-center' });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech init error:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      setKeyword('');
    }
  }, [location]);

  return (
    <form onSubmit={searchHandler} className="ajwa-search-form">
      <i className="fa fa-search ajwa-search-icon" aria-hidden="true"></i>
      <input
        type="text"
        id="search_field"
        className="ajwa-search-input"
        placeholder="Search Ajwa.in..."
        style={{ paddingLeft: '48px', paddingRight: '48px' }}
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
      />

      {/* Voice-to-Text Microphone Button */}
      <button
        type="button"
        onClick={startVoiceSearch}
        className={`ajwa-voice-btn ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Listening... Click to stop' : 'Click to Voice Search (Voice to Text)'}
        aria-label="Voice Search"
      >
        <i className={`fa ${isListening ? 'fa-microphone-slash text-danger' : 'fa-microphone text-warning'}`}></i>
      </button>

      <button type="submit" className="ajwa-hidden-submit" aria-label="Search"></button>
    </form>
  );
}
