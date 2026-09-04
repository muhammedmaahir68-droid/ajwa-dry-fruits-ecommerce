import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Search from './Search';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions/userActions';
import { toast } from 'react-toastify';

export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.authState);
  const { items: cartItems } = useSelector((state) => state.cartState);
  const uploadRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout);
    toast.success('Logged out successfully!', { position: 'bottom-center' });
    navigate('/login');
  };

  const handleOpenAiConcierge = () => {
    window.dispatchEvent(new CustomEvent('open-ajwa-ai-concierge'));
  };

  return (
    <>
      {/* Top Support & Helpline Announcement Bar */}
      <div className="ajwa-helpline-bar py-1 px-3 d-flex justify-content-between align-items-center flex-wrap" style={{
        backgroundColor: '#140a08',
        borderBottom: '1px solid rgba(229, 169, 60, 0.25)',
        fontSize: '0.8rem'
      }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <a href="tel:+919876543210" className="text-warning text-decoration-none font-weight-bold d-flex align-items-center">
            <i className="fa fa-phone mr-1"></i> Ajwa Care 24/7: <strong className="text-white ml-1">+91 98765 43210</strong>
          </a>
          <span className="text-secondary d-none d-md-inline">|</span>
          <span className="text-light d-none d-md-inline">
            <i className="fa fa-envelope mr-1 text-warning"></i> care@ajwadryfruits.com
          </span>
          <span className="text-secondary d-none d-lg-inline">|</span>
          <span className="text-success font-weight-bold d-none d-lg-inline">
            <i className="fa fa-shield mr-1"></i> 7-Day Hassle-Free Returns & Instant Cancellations
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            type="button" 
            onClick={handleOpenAiConcierge}
            className="btn btn-xs py-0 px-2 rounded-pill font-weight-bold text-dark"
            style={{ backgroundColor: '#e5a93c', fontSize: '0.75rem' }}
          >
            <i className="fa fa-robot mr-1"></i> AI Help & Queries
          </button>
          <Link to="/orders/me" className="text-warning text-decoration-none small ml-2 d-none d-sm-inline">
            <i className="fa fa-map-marker mr-1"></i> Track Order
          </Link>
        </div>
      </div>

      {/* Main Topbar */}
      <header className="ajwa-topbar">
        <div className="ajwa-logo">
          <Link to="/" className="ajwa-logo-link">
            <span className="ajwa-logo-main">AJWA</span>
            <span className="ajwa-logo-sub">DRY FRUITS</span>
          </Link>
        </div>

        <div className="ajwa-search-wrap">
          <Search />
        </div>

        <div className="ajwa-top-actions">
          <input
            ref={uploadRef}
            type="file"
            className="d-none"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                toast.success(`Uploaded: ${file.name}`, { position: 'bottom-center' });
              }
            }}
          />
          <button type="button" className="ajwa-upload-btn" onClick={() => uploadRef.current?.click()}>
            Upload Files
          </button>

          {isAuthenticated && user && user.role === 'admin' && (
            <Link to="/admin/dashboard" className="ajwa-top-action" style={{ color: '#e5a93c' }}>
              <i className="fa fa-tachometer" aria-hidden="true"></i>
              <span>Admin</span>
            </Link>
          )}

          <Link to={isAuthenticated ? '/myprofile' : '/login'} className="ajwa-top-action">
            <i className="fa fa-user-circle-o" aria-hidden="true"></i>
            <span>{isAuthenticated ? (user?.name ? user.name.split(' ')[0] : 'Profile') : 'Login'}</span>
          </Link>

          {isAuthenticated && (
            <Link to="/orders/me" className="ajwa-top-action text-warning">
              <i className="fa fa-shopping-bag" aria-hidden="true"></i>
              <span>My Orders</span>
            </Link>
          )}

          {isAuthenticated && (
            <button 
              type="button" 
              onClick={logoutHandler} 
              className="ajwa-top-action border-0 bg-transparent text-danger cursor-pointer"
              title="Logout"
            >
              <i className="fa fa-sign-out" aria-hidden="true"></i>
              <span>Logout</span>
            </button>
          )}

          <Link to="/cart" className="ajwa-top-action ajwa-cart-action">
            <div className="ajwa-cart-icon-wrap">
              <i className="fa fa-shopping-cart" aria-hidden="true"></i>
              {cartItems.length > 0 ? <span className="ajwa-cart-badge">{cartItems.length}</span> : null}
            </div>
            <span>Cart</span>
          </Link>
        </div>
      </header>
    </>
  );
}
