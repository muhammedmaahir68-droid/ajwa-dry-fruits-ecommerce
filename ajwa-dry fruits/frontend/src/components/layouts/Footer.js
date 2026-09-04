import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Desktop & Main Footer */}
      <footer className="py-4 mt-5 border-top border-secondary ajwa-footer-desktop" style={{ background: 'rgba(13, 6, 5, 0.95)' }}>
        <div className="container text-center">
          <div className="mb-2">
            <span className="ajwa-logo-main h4 font-weight-bold text-warning mr-2">AJWA</span>
            <span className="ajwa-logo-sub text-muted">DRY FRUITS & GOURMET IMPORTS</span>
          </div>

          <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap my-2 small">
            <a href="tel:+919843571235" className="text-warning text-decoration-none font-weight-bold">
              <i className="fa fa-phone mr-1"></i> Helpline: +91 98435 71235
            </a>
            <span className="text-secondary d-none d-sm-inline">|</span>
            <a href="mailto:ajwadryfruits.nuts@gmail.com" className="text-light text-decoration-none">
              <i className="fa fa-envelope mr-1 text-warning"></i> ajwadryfruits.nuts@gmail.com
            </a>
            <span className="text-secondary d-none d-sm-inline">|</span>
            <span className="text-success font-weight-bold">
              <i className="fa fa-shield mr-1"></i> 100% Royal Quality Certified
            </span>
          </div>

          <p className="text-muted font-weight-bold mb-0 small">
            &copy; {new Date().getFullYear()} Ajwa Dry Fruits. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Only Navigation Bar */}
      <nav className="ajwa-mobile-nav d-md-none position-fixed bottom-0 start-0 w-100 bg-dark border-top border-warning d-flex justify-content-around py-2 shadow-lg" style={{ zIndex: 999 }}>
        <Link to="/" className={`text-decoration-none d-flex flex-column align-items-center small ${pathname === '/' ? 'text-warning font-weight-bold' : 'text-light'}`}>
          <i className="fa fa-home" aria-hidden="true"></i>
          <span>Home</span>
        </Link>

        <Link to="/search/ajwa" className={`text-decoration-none d-flex flex-column align-items-center small ${pathname.includes('/search') ? 'text-warning font-weight-bold' : 'text-light'}`}>
          <i className="fa fa-search" aria-hidden="true"></i>
          <span>Search</span>
        </Link>

        <Link to="/cart" className={`text-decoration-none d-flex flex-column align-items-center small ${pathname === '/cart' ? 'text-warning font-weight-bold' : 'text-light'}`}>
          <i className="fa fa-shopping-basket" aria-hidden="true"></i>
          <span>Cart</span>
        </Link>

        <Link to="/myprofile" className={`text-decoration-none d-flex flex-column align-items-center small ${pathname.includes('/myprofile') ? 'text-warning font-weight-bold' : 'text-light'}`}>
          <i className="fa fa-user" aria-hidden="true"></i>
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
