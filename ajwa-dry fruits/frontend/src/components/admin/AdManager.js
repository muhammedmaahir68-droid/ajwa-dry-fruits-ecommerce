import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';

export default function AdManager() {
    const [ads, setAds] = useState([
        {
            id: 1,
            title: 'Royal Ajwa Dates & Belgian Chocolates Flash Sale',
            discount: '35% OFF',
            type: 'Video Advert',
            status: 'Active',
            expiry: '2026-08-01',
            mediaUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A'
        },
        {
            id: 2,
            title: 'Premium Raw Pistachios & Cashews Festive Box',
            discount: '20% OFF',
            type: 'Image Banner',
            status: 'Active',
            expiry: '2026-08-15',
            mediaUrl: '/images/products/pistachios-banner.jpg'
        }
    ]);

    const [newTitle, setNewTitle] = useState('');
    const [newDiscount, setNewDiscount] = useState('');
    const [newType, setNewType] = useState('Video Advert');
    const [newMediaUrl, setNewMediaUrl] = useState('');

    const handleAddAd = (e) => {
        e.preventDefault();
        if (!newTitle || !newDiscount) {
            return toast.error('Please enter ad title and discount amount');
        }

        const newAdObj = {
            id: Date.now(),
            title: newTitle,
            discount: newDiscount,
            type: newType,
            status: 'Active',
            expiry: '2026-09-01',
            mediaUrl: newMediaUrl || 'https://via.placeholder.com/600x300'
        };

        setAds([newAdObj, ...ads]);
        setNewTitle('');
        setNewDiscount('');
        setNewMediaUrl('');
        toast.success('Promotional Campaign created successfully!');
    };

    const toggleAdStatus = (id) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, status: ad.status === 'Active' ? 'Paused' : 'Active' } : ad));
        toast.info('Ad campaign status updated');
    };

    const deleteAd = (id) => {
        setAds(ads.filter(ad => ad.id !== id));
        toast.warning('Ad campaign removed');
    };

    return (
        <div className="row">
            <div className="col-12 col-md-3">
                <Sidebar />
            </div>
            <div className="col-12 col-md-9 p-4">
                <h1 className="my-2 font-weight-bold text-dark">
                    <i className="fa fa-bullhorn text-warning mr-2"></i> Ad & Promotional Campaign Control Center
                </h1>
                <p className="text-muted mb-4">Manage homepage video ad banners, countdown sale timers, and promotional popups.</p>

                {/* Create New Ad Campaign Card */}
                <div className="card shadow mb-4">
                    <div className="card-header bg-dark text-warning font-weight-bold">
                        <i className="fa fa-plus-circle mr-2"></i> Launch New Promo Campaign
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAddAd}>
                            <div className="form-row">
                                <div className="form-group col-md-4">
                                    <label className="font-weight-bold">Campaign Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="e.g. Eid Special Imported Chocolates Sale" 
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-md-2">
                                    <label className="font-weight-bold">Discount Rate</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="e.g. 30% OFF" 
                                        value={newDiscount}
                                        onChange={(e) => setNewDiscount(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-md-3">
                                    <label className="font-weight-bold">Format Type</label>
                                    <select 
                                        className="form-control"
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                    >
                                        <option value="Video Advert">Interactive Video Advert</option>
                                        <option value="Image Banner">Glassmorphic Image Banner</option>
                                        <option value="Popup Timer">Countdown Sale Popup</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-3">
                                    <label className="font-weight-bold">Media / Video URL</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Embed video or image link" 
                                        value={newMediaUrl}
                                        onChange={(e) => setNewMediaUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-warning font-weight-bold px-4">
                                <i className="fa fa-paper-plane mr-2"></i> Publish Campaign
                            </button>
                        </form>
                    </div>
                </div>

                {/* Active Campaigns Table */}
                <div className="card shadow">
                    <div className="card-header bg-white font-weight-bold text-uppercase d-flex justify-content-between align-items-center">
                        <span><i className="fa fa-list-alt text-primary"></i> Active & Scheduled Campaigns ({ads.length})</span>
                    </div>
                    <div className="card-body table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="thead-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Campaign Title</th>
                                    <th>Discount</th>
                                    <th>Format</th>
                                    <th>Expiry Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.map(ad => (
                                    <tr key={ad.id}>
                                        <td className="font-weight-bold">#{ad.id}</td>
                                        <td>{ad.title}</td>
                                        <td><span className="badge badge-warning text-dark font-weight-bold">{ad.discount}</span></td>
                                        <td><span className="badge badge-info">{ad.type}</span></td>
                                        <td>{ad.expiry}</td>
                                        <td>
                                            <span className={`badge badge-${ad.status === 'Active' ? 'success' : 'secondary'}`}>
                                                {ad.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className={`btn btn-sm btn-outline-${ad.status === 'Active' ? 'warning' : 'success'} mr-2`}
                                                onClick={() => toggleAdStatus(ad.id)}
                                            >
                                                <i className={`fa fa-${ad.status === 'Active' ? 'pause' : 'play'}`}></i> {ad.status === 'Active' ? 'Pause' : 'Activate'}
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => deleteAd(ad.id)}
                                            >
                                                <i className="fa fa-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
