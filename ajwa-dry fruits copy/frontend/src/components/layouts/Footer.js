import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();

  return (
    <>
      <footer className="py-2 ajwa-footer-desktop"></footer>

      <nav className="ajwa-mobile-nav">
        <Link to="/" className={`ajwa-mobile-link ${pathname === '/' ? 'active' : ''}`}>
          <i className="fa fa-home" aria-hidden="true"></i>
          <span>Home</span>
        </Link>

        <Link to="/search/ajwa" className={`ajwa-mobile-link ${pathname.includes('/search') ? 'active' : ''}`}>
          <i className="fa fa-search" aria-hidden="true"></i>
          <span>Search</span>
        </Link>

        <Link to="/cart" className={`ajwa-mobile-link ${pathname === '/cart' ? 'active' : ''}`}>
          <i className="fa fa-heart-o" aria-hidden="true"></i>
          <span>Wishlist</span>
        </Link>

        <Link to="/myprofile" className={`ajwa-mobile-link ${pathname.includes('/myprofile') ? 'active' : ''}`}>
          <i className="fa fa-user" aria-hidden="true"></i>
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
