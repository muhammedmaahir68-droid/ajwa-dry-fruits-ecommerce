import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdBanner() {
    const [bannerActive, setBannerActive] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!bannerActive) return null;

    return (
        <div className="ajwa-ad-banner-wrap my-4 position-relative overflow-hidden p-4 rounded-lg shadow-lg">
            <div className="ajwa-ad-glow-bg"></div>
            
            <button 
                type="button" 
                className="btn-close text-white position-absolute top-0 right-0 m-3 border-0 bg-transparent"
                style={{ cursor: 'pointer', zIndex: 10, fontSize: '1.2rem' }}
                onClick={() => setBannerActive(false)}
                aria-label="Close Announcement"
            >
                <i className="fa fa-times text-warning"></i>
            </button>

            <div className="row align-items-center">
                <div className="col-md-7 z-1">
                    <span className="badge badge-warning px-3 py-2 text-dark font-weight-bold mb-2 text-uppercase letter-spacing-2">
                        🔥 Seasonal Flash Deal • Up to 35% OFF
                    </span>
                    <h2 className="text-white font-weight-bold display-4 mb-2 style-gold-text">
                        Royal Ajwa Dates & Luxury Belgian Chocolates
                    </h2>
                    <p className="text-light lead mb-3">
                        Indulge in handpicked Premium Saudi Ajwa Dates, Royal Pistachios & Artisanal Imported Dark Chocolate Truffles.
                    </p>

                    {/* Countdown Timer */}
                    <div className="d-flex align-items-center mb-4">
                        <span className="text-warning mr-3 font-weight-bold text-uppercase small">Limited Time Offer:</span>
                        <div className="d-flex text-center gap-2">
                            <div className="bg-dark text-warning rounded px-2 py-1 font-weight-bold border border-warning shadow-sm">
                                {String(timeLeft.hours).padStart(2, '0')}<span className="small d-block text-muted">HRS</span>
                            </div>
                            <span className="text-warning font-weight-bold my-auto">:</span>
                            <div className="bg-dark text-warning rounded px-2 py-1 font-weight-bold border border-warning shadow-sm">
                                {String(timeLeft.minutes).padStart(2, '0')}<span className="small d-block text-muted">MIN</span>
                            </div>
                            <span className="text-warning font-weight-bold my-auto">:</span>
                            <div className="bg-dark text-warning rounded px-2 py-1 font-weight-bold border border-warning shadow-sm">
                                {String(timeLeft.seconds).padStart(2, '0')}<span className="small d-block text-muted">SEC</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/search/imported" className="btn btn-warning btn-lg font-weight-bold px-4 shadow-lg text-dark">
                        Shop Exclusive Deals <i className="fa fa-arrow-right ml-2"></i>
                    </Link>
                </div>

                <div className="col-md-5 text-center z-1 mt-4 mt-md-0">
                    <div className="ajwa-ad-media-card p-3 rounded-lg border border-warning shadow-2-strong bg-dark">
                        <div className="embed-responsive embed-responsive-16by9 rounded mb-2">
                            <iframe 
                                className="embed-responsive-item rounded"
                                src="https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&mute=1&loop=1&controls=0"
                                title="Luxury Dry Fruits & Chocolates Media Promo"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <span className="small text-muted font-italic">
                            🎥 Interactive Advert: Premium Gourmet Imports Showcase
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
