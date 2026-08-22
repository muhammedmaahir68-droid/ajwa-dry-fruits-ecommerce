import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../actions/userActions';
import { toast } from 'react-toastify';

export default function Sidebar() {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        dispatch(logout);
        toast.success('Logged out successfully!', { position: 'bottom-center' });
        navigate('/login');
    };

    useEffect(() => { setOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const navItems = [
        { to: '/admin/dashboard',        icon: 'fa-tachometer',    label: 'DASHBOARD' },
        { to: '/admin/products',         icon: 'fa-archive',       label: 'PRODUCT INVENTORY' },
        { to: '/admin/orders',           icon: 'fa-shopping-cart', label: 'ORDER MANAGEMENT' },
        { to: '/admin/products/create',  icon: 'fa-plus-circle',   label: 'ADD NEW PRODUCT' },
        { to: '/admin/ads',              icon: 'fa-bullhorn',      label: 'HERO & AD MANAGER' },
        { to: '/admin/users',            icon: 'fa-users',         label: 'CUSTOMER ANALYTICS' },
        { to: '/admin/payrolls',         icon: 'fa-money',         label: 'PAYROLL MANAGEMENT' },
        { to: '/admin/control',          icon: 'fa-cog',           label: 'SYSTEM SETTINGS' },
    ];

    return (
        <>
            <button
                className={`ajwa-sidebar-toggle ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Close Sidebar' : 'Open Sidebar'}
            >
                <i className={`fa ${open ? 'fa-times' : 'fa-bars'}`}></i>
                <span>{open ? 'Close' : 'Menu'}</span>
            </button>

            {open && (
                <div
                    className="ajwa-sidebar-overlay"
                    onClick={() => setOpen(false)}
                />
            )}

            <nav className={`ajwa-sidebar-drawer ${open ? 'open' : ''}`}>
                <div className="ajwa-sidebar-header">
                    <span className="ajwa-sidebar-brand">
                        <i className="fa fa-cog" style={{marginRight: '8px', color: '#E5A93C'}}></i>
                        ADMIN PANEL
                    </span>
                    <button
                        className="ajwa-sidebar-close"
                        onClick={() => setOpen(false)}
                    >
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <ul className="ajwa-sidebar-nav">
                    {navItems.map(({ to, icon, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`ajwa-sidebar-link ${isActive(to) ? 'active' : ''}`}
                                onClick={() => setOpen(false)}
                            >
                                <i className={`fa ${icon} ajwa-sidebar-icon`}></i>
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="ajwa-sidebar-footer">
                    <button onClick={handleLogout} className="ajwa-sidebar-logout">
                        <i className="fa fa-sign-out ajwa-sidebar-icon"></i>
                        <span>LOGOUT</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
