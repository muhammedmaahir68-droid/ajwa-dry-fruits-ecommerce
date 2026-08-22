import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SALE_KEY = 'ajwa_flash_sale_config';

export const getFlashSaleConfig = () => {
    try {
        const data = localStorage.getItem(SALE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch {
        return null;
    }
};

export const saveFlashSaleConfig = (config) => {
    localStorage.setItem(SALE_KEY, JSON.stringify(config));
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ajwa_sale_update'));
    }
};

export const clearFlashSaleConfig = () => {
    localStorage.removeItem(SALE_KEY);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ajwa_sale_update'));
    }
};

export default function AdBanner() {
    const [dealConfig, setDealConfig] = useState(null);
    const [bannerActive, setBannerActive] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    const loadConfig = () => {
        const config = getFlashSaleConfig();
        setDealConfig(config);
    };

    useEffect(() => {
        loadConfig();
        const handleUpdate = () => loadConfig();
        window.addEventListener('ajwa_sale_update', handleUpdate);
        return () => window.removeEventListener('ajwa_sale_update', handleUpdate);
    }, []);

    useEffect(() => {
        if (!dealConfig || !dealConfig.endTime || !dealConfig.active) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(dealConfig.endTime).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [dealConfig]);

    if (!dealConfig || !dealConfig.active || !bannerActive) {
        return null;
    }

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('watch?v=')) {
            const id = url.split('watch?v=')[1]?.split('&')[0];
            return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0`;
        }
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0`;
        }
        return url;
    };

    const videoEmbedUrl = getEmbedUrl(dealConfig.videoUrl);

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
                <div className={videoEmbedUrl ? "col-md-7 z-1" : "col-12 z-1"}>
                    {dealConfig.badge && (
                        <span className="badge badge-warning px-3 py-2 text-dark font-weight-bold mb-2 text-uppercase letter-spacing-2">
                            ?? {dealConfig.badge}
                        </span>
                    )}

                    {dealConfig.title && (
                        <h2 className="text-white font-weight-bold display-4 mb-2 style-gold-text">
                            {dealConfig.title}
                        </h2>
                    )}

                    {dealConfig.description && (
                        <p className="text-light lead mb-3">
                            {dealConfig.description}
                        </p>
                    )}

                    {dealConfig.endTime && (
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
                    )}

                    <Link to={dealConfig.link || '/'} className="btn btn-warning btn-lg font-weight-bold px-4 shadow-lg text-dark">
                        {dealConfig.buttonText || 'Shop Exclusive Deals'} <i className="fa fa-arrow-right ml-2"></i>
                    </Link>
                </div>

                {videoEmbedUrl && (
                    <div className="col-md-5 text-center z-1 mt-4 mt-md-0">
                        <div className="ajwa-ad-media-card p-3 rounded-lg border border-warning shadow-2-strong bg-dark">
                            <div className="embed-responsive embed-responsive-16by9 rounded mb-2">
                                {videoEmbedUrl.match(/\.(mp4|webm)$/i) ? (
                                    <video src={videoEmbedUrl} autoPlay loop muted className="embed-responsive-item rounded" />
                                ) : (
                                    <iframe 
                                        className="embed-responsive-item rounded"
                                        src={videoEmbedUrl}
                                        title={dealConfig.title || "Flash Sale Video"}
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                            {dealConfig.videoTitle && (
                                <span className="small text-muted font-italic">
                                    ?? {dealConfig.videoTitle}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
