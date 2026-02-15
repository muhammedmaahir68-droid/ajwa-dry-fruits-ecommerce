import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import { useSelector } from 'react-redux';

export default function Header() {
  const { isAuthenticated } = useSelector((state) => state.authState);
  const { items: cartItems } = useSelector((state) => state.cartState);

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
        <Link to={isAuthenticated ? '/myprofile' : '/login'} className="ajwa-top-action">
          <i className="fa fa-user-circle-o" aria-hidden="true"></i>
          <span>Profile</span>
        </Link>

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
