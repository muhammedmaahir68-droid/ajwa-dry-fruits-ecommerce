import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="ajwa-admin-sidebar-wrap p-3 rounded-lg text-white bg-dark border border-secondary shadow-lg">
            <ul className="nav flex-column gap-2 list-unstyled m-0">
                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/dashboard" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/dashboard') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-home mr-2 text-warning"></i> <span className="text-truncate">DASHBOARD</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/dashboard" 
                        className="nav-link text-uppercase font-weight-bold text-light d-flex align-items-center py-2 px-3 rounded-pill border border-secondary transition-all small"
                    >
                        <i className="fa fa-line-chart mr-2 text-warning"></i> <span className="text-truncate">SALES OVERVIEW</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/products" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/products') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-archive mr-2 text-warning"></i> <span className="text-truncate">PRODUCT INVENTORY</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/orders" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/orders') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-shopping-cart mr-2 text-warning"></i> <span className="text-truncate">ORDER MANAGEMENT</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/products/create" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/products/create') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-plus-circle mr-2 text-warning"></i> <span className="text-truncate">ADD NEW PRODUCT</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/ads" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/ads') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-bullhorn mr-2 text-warning"></i> <span className="text-truncate">AD MANAGER</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/users" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/users') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-users mr-2 text-warning"></i> <span className="text-truncate">CUSTOMER ANALYTICS</span>
                    </Link>
                </li>

                <li className="nav-item mb-1">
                    <Link 
                        to="/admin/payrolls" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/payrolls') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-money mr-2 text-warning"></i> <span className="text-truncate">PAYROLL MANAGEMENT</span>
                    </Link>
                </li>

                <li className="nav-item">
                    <Link 
                        to="/admin/control" 
                        className={`nav-link text-uppercase font-weight-bold d-flex align-items-center py-2 px-3 rounded-pill transition-all small ${isActive('/admin/control') ? 'bg-warning text-dark shadow-sm' : 'text-light border border-secondary'}`}
                    >
                        <i className="fa fa-cog mr-2 text-warning"></i> <span className="text-truncate">SYSTEM SETTINGS</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
