import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import { getHeroSlides, saveHeroSlide, updateHeroSlide, deleteHeroSlide, clearAllHeroSlides } from '../../utils/heroService';
import { getFlashSaleConfig, saveFlashSaleConfig, clearFlashSaleConfig } from '../layouts/AdBanner';

export default function AdManager() {
    const [activeTab, setActiveTab] = useState('hero');
    const [slides, setSlides] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [title, setTitle] = useState('');
    const [tagline, setTagline] = useState('');
    const [price, setPrice] = useState('');
    const [offerHighlight, setOfferHighlight] = useState('');
    const [badge, setBadge] = useState('HOT DEAL');
    const [description, setDescription] = useState('');
    const [mediaType, setMediaType] = useState('image');
    const [mediaUrl, setMediaUrl] = useState('');
    const [link, setLink] = useState('/');
    const [mediaPreview, setMediaPreview] = useState('');
    const fileInputRef = useRef(null);

    const [saleActive, setSaleActive] = useState(false);
    const [saleTitle, setSaleTitle] = useState('');
    const [saleDescription, setSaleDescription] = useState('');
    const [saleBadge, setSaleBadge] = useState('');
    const [saleButtonText, setSaleButtonText] = useState('Shop Exclusive Deals');
    const [saleLink, setSaleLink] = useState('/');
    const [saleDurationHours, setSaleDurationHours] = useState('24');
    const [saleVideoUrl, setSaleVideoUrl] = useState('');
    const [saleVideoTitle, setSaleVideoTitle] = useState('');

    useEffect(() => {
        loadSlidesData();
        loadFlashSaleData();
    }, []);

    const loadSlidesData = () => {
        setSlides(getHeroSlides());
    };

    const loadFlashSaleData = () => {
        const config = getFlashSaleConfig();
        if (config) {
            setSaleActive(!!config.active);
            setSaleTitle(config.title || '');
            setSaleDescription(config.description || '');
            setSaleBadge(config.badge || '');
            setSaleButtonText(config.buttonText || 'Shop Exclusive Deals');
            setSaleLink(config.link || '/');
            setSaleVideoUrl(config.videoUrl || '');
            setSaleVideoTitle(config.videoTitle || '');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isVideo = file.type.startsWith('video/');
        setMediaType(isVideo ? 'video' : 'image');
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setMediaUrl(reader.result);
                setMediaPreview(reader.result);
                toast.info(`${isVideo ? 'Video' : 'Photo'} selected!`, { position: 'bottom-center' });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || (!mediaUrl.trim() && !mediaPreview.trim())) {
            return toast.error('Please enter a title and upload a photo or video!', { position: 'bottom-center' });
        }

        const slideData = {
            title: title.trim(),
            tagline: tagline.trim() || '',
            price: price.trim() || '',
            offerHighlight: offerHighlight.trim() || '',
            badge: badge.trim() || '',
            description: description.trim() || '',
            mediaType,
            mediaUrl: mediaPreview || mediaUrl.trim(),
            link: link.trim() || '/',
            status: 'Active'
        };

        if (editingId) {
            updateHeroSlide(editingId, slideData);
            toast.success('Hero slide updated!', { position: 'bottom-center' });
            setEditingId(null);
        } else {
            saveHeroSlide(slideData);
            toast.success('New hero slide published to homepage!', { position: 'bottom-center' });
        }

        resetForm();
        loadSlidesData();
    };

    const handleSaveFlashSale = (e) => {
        e.preventDefault();
        if (!saleTitle.trim() && saleActive) {
            return toast.error('Please enter a Title for the Flash Sale Banner', { position: 'bottom-center' });
        }

        const endTime = new Date(Date.now() + (parseFloat(saleDurationHours || 24) * 60 * 60 * 1000)).toISOString();

        const config = {
            active: saleActive,
            title: saleTitle.trim(),
            description: saleDescription.trim(),
            badge: saleBadge.trim(),
            buttonText: saleButtonText.trim() || 'Shop Exclusive Deals',
            link: saleLink.trim() || '/',
            endTime,
            videoUrl: saleVideoUrl.trim(),
            videoTitle: saleVideoTitle.trim()
        };

        saveFlashSaleConfig(config);
        toast.success(saleActive ? '? Flash Sale Banner published to homepage!' : 'Flash Sale Banner saved!', { position: 'bottom-center' });
    };

    const handleClearFlashSale = () => {
        clearFlashSaleConfig();
        setSaleActive(false);
        setSaleTitle('');
        setSaleDescription('');
        setSaleBadge('');
        setSaleVideoUrl('');
        toast.info('Flash Sale Banner removed from homepage!', { position: 'bottom-center' });
    };

    const handleEditClick = (slide) => {
        setEditingId(slide.id);
        setTitle(slide.title || '');
        setTagline(slide.tagline || '');
        setPrice(slide.price || '');
        setOfferHighlight(slide.offerHighlight || '');
        setBadge(slide.badge || 'HOT DEAL');
        setDescription(slide.description || '');
        setMediaType(slide.mediaType || 'image');
        setMediaUrl(slide.mediaUrl || '');
        setMediaPreview(slide.mediaUrl || '');
        setLink(slide.link || '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this hero slide?')) {
            deleteHeroSlide(id);
            toast.warning('Hero slide removed!', { position: 'bottom-center' });
            loadSlidesData();
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Clear ALL hero slides?')) {
            clearAllHeroSlides();
            toast.success('All hero slides cleared!', { position: 'bottom-center' });
            loadSlidesData();
        }
    };

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        updateHeroSlide(id, { status: newStatus });
        toast.info(`Slide ${newStatus}`, { position: 'bottom-center' });
        loadSlidesData();
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setTagline('');
        setPrice('');
        setOfferHighlight('');
        setBadge('');
        setDescription('');
        setMediaType('image');
        setMediaUrl('');
        setMediaPreview('');
        setLink('/');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="ajwa-admin-page">
            <Sidebar />
            <div className="ajwa-admin-content">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap p-3 bg-dark rounded border border-warning shadow-lg">
                    <div>
                        <h2 className="font-weight-bold text-warning m-0">
                            <i className="fa fa-sliders text-warning mr-2"></i> Hero & Flash Sale Manager
                        </h2>
                        <p className="text-light small m-0 mt-1 opacity-75">
                            Manage live homepage hero showcase slides and seasonal promo deal banners with 100% real-time data.
                        </p>
                    </div>
                </div>

                <div className="d-flex mb-4 gap-3">
                    <button
                        className={`btn font-weight-bold px-4 py-2 rounded-pill ${activeTab === 'hero' ? 'btn-warning text-dark' : 'btn-outline-warning text-white'}`}
                        onClick={() => setActiveTab('hero')}
                    >
                        <i className="fa fa-picture-o mr-2"></i> 3D Hero Carousel ({slides.length})
                    </button>
                    <button
                        className={`btn font-weight-bold px-4 py-2 rounded-pill ${activeTab === 'flash_sale' ? 'btn-warning text-dark' : 'btn-outline-warning text-white'}`}
                        onClick={() => setActiveTab('flash_sale')}
                    >
                        <i className="fa fa-bolt mr-2"></i> Seasonal Flash Sale Banner {saleActive ? '(ACTIVE)' : '(OFF)'}
                    </button>
                </div>

                {activeTab === 'hero' && (
                    <>
                        <div className="card shadow-lg mb-5 bg-dark border border-warning text-white">
                            <div className="card-header bg-dark text-warning border-bottom border-warning font-weight-bold d-flex justify-content-between align-items-center py-3">
                                <span style={{ fontSize: '1.1rem' }}>
                                    <i className={`fa ${editingId ? 'fa-pencil-square-o' : 'fa-cloud-upload'} mr-2 text-warning`}></i>
                                    {editingId ? 'Edit Hero Slide' : 'Upload New Hero Slide'}
                                </span>
                                {editingId && (
                                    <button onClick={resetForm} className="btn btn-sm btn-outline-secondary">
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <div className="card-body bg-dark text-white p-4">
                                <form onSubmit={handleFormSubmit}>
                                    <div className="row">
                                        <div className="col-12 col-md-7">
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold text-warning">Product / Campaign Title *</label>
                                                <input
                                                    type="text"
                                                    className="form-control text-white border-warning bg-secondary"
                                                    placeholder="e.g. Royal Madinah Ajwa Dates"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-3">
                                                    <label className="font-weight-bold text-warning">Price (?)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control text-white font-weight-bold border-warning bg-secondary"
                                                        placeholder="e.g. 899"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-6 form-group mb-3">
                                                    <label className="font-weight-bold text-warning">Offer Highlight ??</label>
                                                    <input
                                                        type="text"
                                                        className="form-control text-white border-warning bg-secondary"
                                                        placeholder="e.g. 35% OFF"
                                                        value={offerHighlight}
                                                        onChange={(e) => setOfferHighlight(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-3">
                                                    <label className="font-weight-bold text-warning">Tagline / Subtitle</label>
                                                    <input
                                                        type="text"
                                                        className="form-control text-white border-warning bg-secondary"
                                                        placeholder="e.g. DIRECT FROM MADINAH"
                                                        value={tagline}
                                                        onChange={(e) => setTagline(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-6 form-group mb-3">
                                                    <label className="font-weight-bold text-warning">Badge Tag</label>
                                                    <input
                                                        type="text"
                                                        className="form-control text-white border-warning bg-secondary"
                                                        placeholder="e.g. BESTSELLER, HOT DEAL"
                                                        value={badge}
                                                        onChange={(e) => setBadge(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold text-warning">Description</label>
                                                <textarea
                                                    className="form-control text-white border-warning bg-secondary"
                                                    rows="3"
                                                    placeholder="Brief description..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-5">
                                            <div className="p-3 bg-dark rounded border border-warning shadow-sm h-100 d-flex flex-column">
                                                <label className="font-weight-bold text-warning mb-2">
                                                    <i className="fa fa-camera text-warning mr-1"></i> Upload Photo or Video
                                                </label>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept="image/*,video/*"
                                                    onChange={handleFileChange}
                                                    className="d-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                    className="btn btn-outline-warning btn-block mb-2 font-weight-bold"
                                                >
                                                    <i className="fa fa-upload mr-2"></i> Choose Photo / Video File
                                                </button>

                                                <div className="form-group mb-3">
                                                    <label className="small font-weight-bold text-warning">Or paste Image/Video URL:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm text-white border-warning bg-secondary"
                                                        placeholder="https://..."
                                                        value={mediaUrl}
                                                        onChange={(e) => {
                                                            setMediaUrl(e.target.value);
                                                            setMediaPreview(e.target.value);
                                                        }}
                                                    />
                                                </div>

                                                {mediaPreview ? (
                                                    <div className="position-relative rounded overflow-hidden border border-warning" style={{ height: '170px' }}>
                                                        {mediaType === 'video' || mediaPreview.match(/\.(mp4|webm)$/i) ? (
                                                            <video src={mediaPreview} autoPlay loop muted className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                        ) : (
                                                            <img src={mediaPreview} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center border border-warning rounded bg-dark text-light" style={{ minHeight: '150px' }}>
                                                        <i className="fa fa-film fa-2x mb-2 text-warning"></i>
                                                        <p className="small m-0 text-muted text-center">No media selected.<br />Choose a file above.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4 border-secondary" />
                                    <div className="d-flex justify-content-end">
                                        <button type="submit" className="btn btn-warning font-weight-bold px-5 py-2 text-dark shadow-lg">
                                            <i className={`fa ${editingId ? 'fa-check-circle' : 'fa-paper-plane'} mr-2`}></i>
                                            {editingId ? 'SAVE CHANGES' : 'PUBLISH TO HERO'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="font-weight-bold text-warning m-0">
                                Hero Slides ({slides.length})
                            </h4>
                            {slides.length > 0 && (
                                <button onClick={handleClearAll} className="btn btn-sm btn-outline-danger font-weight-bold">
                                    <i className="fa fa-trash mr-1"></i> Clear All Slides
                                </button>
                            )}
                        </div>

                        {slides.length === 0 ? (
                            <div className="card bg-dark border border-warning text-center p-5 shadow-lg">
                                <i className="fa fa-image fa-3x text-warning mb-3"></i>
                                <h5 className="text-warning font-weight-bold">No Hero Slides Active</h5>
                                <p className="text-muted small">Upload your first product photo or video above to display on homepage.</p>
                            </div>
                        ) : (
                            <div className="row">
                                {slides.map((slide) => (
                                    <div className="col-12 col-md-6 col-lg-4 mb-4" key={slide.id}>
                                        <div className={`card h-100 shadow-lg bg-dark text-white border-${slide.status === 'Active' ? 'warning' : 'secondary'} overflow-hidden`}>
                                            <div className="position-relative bg-dark" style={{ height: '180px' }}>
                                                {slide.mediaType === 'video' || (slide.mediaUrl && slide.mediaUrl.match(/\.(mp4|webm)$/i)) ? (
                                                    <video src={slide.mediaUrl} autoPlay loop muted className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <img src={slide.mediaUrl || '/images/placeholder.jpg'} alt={slide.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            <div className="card-body bg-dark text-white d-flex flex-column p-3">
                                                <h6 className="font-weight-bold text-white mb-1">{slide.title}</h6>
                                                <div className="d-flex justify-content-between align-items-center pt-2 mt-auto border-top border-secondary">
                                                    <button className="btn btn-sm btn-outline-warning font-weight-bold" onClick={() => handleEditClick(slide)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(slide.id)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'flash_sale' && (
                    <div className="card shadow-lg bg-dark border border-warning text-white p-4">
                        <h4 className="text-warning font-weight-bold mb-3">
                            ? Flash Sale & Promo Banner Control
                        </h4>
                        <p className="text-muted small mb-4">
                            Configure the flash sale announcement deal banner displayed on the customer home page.
                            <br /><strong className="text-warning">No fake or simulated data will appear unless you enable and publish it below.</strong>
                        </p>

                        <form onSubmit={handleSaveFlashSale}>
                            <div className="custom-control custom-switch mb-4 p-3 bg-secondary rounded border border-warning">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="saleActiveToggle"
                                    checked={saleActive}
                                    onChange={(e) => setSaleActive(e.target.checked)}
                                />
                                <label className="custom-control-label font-weight-bold text-warning cursor-pointer ml-2" htmlFor="saleActiveToggle" style={{ fontSize: '1.1rem' }}>
                                    {saleActive ? '?? FLASH SALE BANNER IS ACTIVE ON HOMEPAGE' : '?? FLASH SALE BANNER IS DISABLED / OFF'}
                                </label>
                            </div>

                            <div className="row">
                                <div className="col-12 col-md-6 form-group mb-3">
                                    <label className="font-weight-bold text-warning">Flash Sale Banner Title *</label>
                                    <input
                                        type="text"
                                        className="form-control text-white border-warning bg-secondary"
                                        placeholder="e.g. Royal Saudi Ajwa Dates Deal"
                                        value={saleTitle}
                                        onChange={(e) => setSaleTitle(e.target.value)}
                                    />
                                </div>

                                <div className="col-12 col-md-6 form-group mb-3">
                                    <label className="font-weight-bold text-warning">Offer Badge Highlight</label>
                                    <input
                                        type="text"
                                        className="form-control text-white border-warning bg-secondary"
                                        placeholder="e.g. SEASONAL FLASH DEAL • UP TO 35% OFF"
                                        value={saleBadge}
                                        onChange={(e) => setSaleBadge(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="font-weight-bold text-warning">Description / Subtitle</label>
                                <textarea
                                    className="form-control text-white border-warning bg-secondary"
                                    rows="2"
                                    placeholder="Indulge in handpicked Premium Saudi Ajwa Dates, Royal Pistachios & Gourmet Truffles."
                                    value={saleDescription}
                                    onChange={(e) => setSaleDescription(e.target.value)}
                                />
                            </div>

                            <div className="row">
                                <div className="col-12 col-md-6 form-group mb-3">
                                    <label className="font-weight-bold text-warning">Timer Duration (Hours)</label>
                                    <input
                                        type="number"
                                        className="form-control text-white border-warning bg-secondary"
                                        placeholder="24"
                                        value={saleDurationHours}
                                        onChange={(e) => setSaleDurationHours(e.target.value)}
                                    />
                                    <small className="text-muted">Countdown timer will run for this many hours on the customer page.</small>
                                </div>

                                <div className="col-12 col-md-6 form-group mb-3">
                                    <label className="font-weight-bold text-warning">Shop Button Text</label>
                                    <input
                                        type="text"
                                        className="form-control text-white border-warning bg-secondary"
                                        placeholder="Shop Exclusive Deals"
                                        value={saleButtonText}
                                        onChange={(e) => setSaleButtonText(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="font-weight-bold text-warning">
                                    ?? Promo Video Link (Optional YouTube or MP4)
                                </label>
                                <input
                                    type="text"
                                    className="form-control text-white border-warning bg-secondary"
                                    placeholder="Paste YouTube Video Link (Leave blank if you do not want a video)"
                                    value={saleVideoUrl}
                                    onChange={(e) => setSaleVideoUrl(e.target.value)}
                                />
                                <small className="text-muted d-block mt-1">
                                    If left blank, NO video window will appear on the homepage. Video ONLY shows if you paste a link here.
                                </small>
                            </div>

                            {saleVideoUrl && (
                                <div className="form-group mb-4">
                                    <label className="font-weight-bold text-warning">Video Caption / Title</label>
                                    <input
                                        type="text"
                                        className="form-control text-white border-warning bg-secondary"
                                        placeholder="e.g. Interactive Advert: Gourmet Showcase"
                                        value={saleVideoTitle}
                                        onChange={(e) => setSaleVideoTitle(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                                <button type="button" onClick={handleClearFlashSale} className="btn btn-outline-danger font-weight-bold">
                                    <i className="fa fa-power-off mr-2"></i> Turn Off & Clear Banner
                                </button>
                                <button type="submit" className="btn btn-warning font-weight-bold px-5 py-2 text-dark shadow-lg">
                                    <i className="fa fa-save mr-2"></i> SAVE & PUBLISH SALE BANNER
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
