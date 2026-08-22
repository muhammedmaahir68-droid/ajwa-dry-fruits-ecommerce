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

  return (
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
  );
}
