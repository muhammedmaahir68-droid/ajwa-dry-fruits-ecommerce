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
          <p className="text-warning font-weight-bold mb-0 small">
            © {new Date().getFullYear()} Ajwa Dry Fruits. All Rights Reserved. Luxury Quality Guaranteed.
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
