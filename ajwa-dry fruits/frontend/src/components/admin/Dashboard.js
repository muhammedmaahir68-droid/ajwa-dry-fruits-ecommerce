import React, { useEffect, useState } from 'react';
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProducts, createNewProduct } from "../../actions/productActions";
import { adminOrders as adminOrdersAction } from '../../actions/orderActions';
import { getUsers } from '../../actions/userActions';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Dashboard() {
    const { adminOrders = [] } = useSelector(state => state.orderState);
    const { products = [] } = useSelector(state => state.productsState);
    const { users = [] } = useSelector(state => state.userState);
    const dispatch = useDispatch();

    const [analytics, setAnalytics] = useState(null);

    // Quick Add Product State
    const [quickName, setQuickName] = useState('');
    const [quickCategory, setQuickCategory] = useState('Dates');
    const [quickPrice, setQuickPrice] = useState('');
    const [quickStock, setQuickStock] = useState('');

    // Real live stats from actual data
    const totalRevenue = adminOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const pendingOrders = adminOrders.filter(o => (o.orderStatus || '').includes('Processing')).length;
    const pendingAmount = adminOrders
        .filter(o => (o.orderStatus || '').includes('Processing'))
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    useEffect(() => {
        dispatch(getAdminProducts);
        dispatch(getUsers);
        dispatch(adminOrdersAction);

        // Fetch real analytics
        axios.get('/api/v1/admin/analytics').then(res => {
            if (res.data.success) setAnalytics(res.data);
        }).catch(() => {});
    }, [dispatch]);

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickName || !quickPrice || !quickStock) {
            return toast.error('Please fill in Product Name, Price and Stock Quantity', { position: 'bottom-center' });
        }

        const formData = new FormData();
        formData.append('name', quickName);
        formData.append('price', quickPrice);
        formData.append('description', `Fresh premium ${quickName} sourced directly.`);
        formData.append('category', quickCategory);
        formData.append('stock', quickStock);
        formData.append('seller', 'Ajwa Direct');

        dispatch(createNewProduct(formData));
        toast.success(`Product "${quickName}" added to Inventory!`, { position: 'bottom-center' });

        setQuickName('');
        setQuickPrice('');
        setQuickStock('');
    };

    const topProducts = analytics?.topProducts || [];
    const pieData = analytics?.pieChartCategory || [];

    return (
        <div className="ajwa-admin-page">
            <Sidebar />
            <div className="ajwa-admin-content">

                {/* 1. Top Metrics Cards Row — LIVE REAL DATA ONLY */}
                <div className="row mb-4">
                    {/* Total Revenue */}
                    <div className="col-md-4 mb-3">
                        <div className="card bg-dark text-white border border-warning rounded-lg p-3 shadow-lg h-100">
                            <div className="small text-muted font-weight-bold text-uppercase mb-1">TOTAL REVENUE</div>
                            <h2 className="font-weight-bold text-warning mb-1">
                                ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <span className="text-muted small">From {adminOrders.length} orders</span>
                        </div>
                    </div>

                    {/* Orders Received */}
                    <div className="col-md-4 mb-3">
                        <div className="card bg-dark text-white border border-secondary rounded-lg p-3 shadow-lg h-100">
                            <div className="small text-muted font-weight-bold text-uppercase mb-1">ORDERS RECEIVED</div>
                            <h2 className="font-weight-bold text-white mb-1">
                                {adminOrders.length}
                            </h2>
                            <span className="text-muted small">{pendingOrders} pending</span>
                        </div>
                    </div>

                    {/* Payments Pending */}
                    <div className="col-md-4 mb-3">
                        <div className="card bg-dark text-white border border-secondary rounded-lg p-3 shadow-lg h-100">
                            <div className="small text-muted font-weight-bold text-uppercase mb-1">PAYMENTS PENDING</div>
                            <h2 className="font-weight-bold text-white mb-1">
                                ₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                            <span className="text-muted small">COD/Unprocessed orders</span>
                        </div>
                    </div>
                </div>

                {/* 2. Second Row: Live Stats + Top Products */}
                <div className="row mb-4">

                    {/* Live Store Overview */}
                    <div className="col-md-6 mb-4">
                        <div className="card bg-dark text-white border border-secondary rounded-lg p-4 shadow-lg h-100">
                            <h6 className="text-warning font-weight-bold text-uppercase mb-4">LIVE STORE OVERVIEW</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2">
                                    <span className="text-muted">Total Products</span>
                                    <span className="font-weight-bold text-warning h5 m-0">{products.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2">
                                    <span className="text-muted">Total Customers</span>
                                    <span className="font-weight-bold text-white h5 m-0">{users.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2">
                                    <span className="text-muted">Total Orders</span>
                                    <span className="font-weight-bold text-white h5 m-0">{adminOrders.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Revenue (Live)</span>
                                    <span className="font-weight-bold text-success h5 m-0">₹{totalRevenue.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-4 d-flex flex-wrap gap-2">
                                <Link to="/admin/products" className="btn btn-warning btn-sm font-weight-bold text-dark">Manage Products</Link>
                                <Link to="/admin/orders" className="btn btn-outline-warning btn-sm font-weight-bold">View Orders</Link>
                            </div>
                        </div>
                    </div>

                    {/* Top Performing Products — LIVE */}
                    <div className="col-md-6 mb-4">
                        <div className="card bg-dark text-white border border-secondary rounded-lg p-4 shadow-lg h-100">
                            <h6 className="text-warning font-weight-bold text-uppercase mb-3">TOP PERFORMING PRODUCTS</h6>
                            {topProducts.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fa fa-bar-chart text-warning" style={{ fontSize: '2rem' }}></i>
                                    <p className="text-muted mt-3 small">No sales data yet.<br />Add products and receive orders to see live rankings here.</p>
                                    <Link to="/admin/add-product" className="btn btn-warning btn-sm font-weight-bold text-dark">+ Add First Product</Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover table-borderless align-middle m-0 small">
                                        <thead className="text-muted border-bottom border-secondary">
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Units Sold</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((p, idx) => (
                                                <tr key={p.id || idx}>
                                                    <td className="font-weight-bold text-warning">{idx + 1}</td>
                                                    <td className="font-weight-bold">{p.name}</td>
                                                    <td>{p.unitsSold}</td>
                                                    <td className="text-warning font-weight-bold">₹{Number(p.revenue || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Sales Distribution — Live or Empty State */}
                <div className="card bg-dark text-white border border-secondary rounded-lg p-4 shadow-lg mb-4">
                    <h6 className="text-warning font-weight-bold text-uppercase mb-3">SALES DISTRIBUTION BY CATEGORY</h6>
                    {pieData.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fa fa-pie-chart text-warning" style={{ fontSize: '2rem' }}></i>
                            <p className="text-muted mt-3 small">No category sales yet. When customers start placing orders, the live chart will appear here.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-wrap gap-3">
                            {pieData.map((cat, i) => (
                                <div key={i} className="d-flex align-items-center mr-4">
                                    <span className="d-inline-block rounded-circle mr-2" style={{ width: 14, height: 14, backgroundColor: ['#D4AF37', '#FF9900', '#A0A0A0', '#28a745', '#dc3545'][i % 5] }}></span>
                                    <span className="font-weight-bold small">{cat.label} ({cat.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Quick Add Product Bar */}
                <div className="card bg-dark text-white border border-secondary rounded-lg p-4 shadow-lg mb-4">
                    <h6 className="text-warning font-weight-bold text-uppercase mb-3">QUICK ADD PRODUCT</h6>
                    <form onSubmit={handleQuickAdd}>
                        <div className="form-row align-items-center">
                            <div className="col-md-3 mb-2">
                                <input
                                    type="text"
                                    className="form-control bg-secondary text-white border-secondary rounded-pill px-3"
                                    placeholder="Product Name"
                                    value={quickName}
                                    onChange={(e) => setQuickName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 mb-2">
                                <select
                                    className="form-control bg-secondary text-white border-secondary rounded-pill px-3"
                                    value={quickCategory}
                                    onChange={(e) => setQuickCategory(e.target.value)}
                                >
                                    <option value="Dates">Dates</option>
                                    <option value="Almonds">Almonds</option>
                                    <option value="Pistachios">Pistachios</option>
                                    <option value="Cashews">Cashews</option>
                                    <option value="Imported Chocolates">Imported Chocolates</option>
                                    <option value="Gift Hampers">Gift Hampers</option>
                                    <option value="Dried Figs">Dried Figs</option>
                                </select>
                            </div>
                            <div className="col-md-2 mb-2">
                                <input
                                    type="number"
                                    className="form-control bg-secondary text-white border-secondary rounded-pill px-3"
                                    placeholder="Price (₹)"
                                    value={quickPrice}
                                    onChange={(e) => setQuickPrice(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <input
                                    type="number"
                                    className="form-control bg-secondary text-white border-secondary rounded-pill px-3"
                                    placeholder="Stock Qty"
                                    value={quickStock}
                                    onChange={(e) => setQuickStock(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <button type="submit" className="btn btn-warning btn-block font-weight-bold text-dark rounded-pill shadow">
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* 5. Getting Started CTA if empty */}
                {products.length === 0 && adminOrders.length === 0 && (
                    <div className="card bg-dark text-white border border-warning rounded-lg p-4 shadow-lg">
                        <h6 className="text-warning font-weight-bold text-uppercase mb-2">
                            <i className="fa fa-rocket mr-2"></i> GETTING STARTED — FRESH STORE
                        </h6>
                        <p className="text-light small mb-3">
                            Your store is freshly reset and ready for live usage. Start by adding your actual products, then share your store link with customers.
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            <Link to="/admin/products/create" className="btn btn-warning font-weight-bold text-dark px-4 rounded-pill shadow">
                                <i className="fa fa-plus mr-2"></i> Add New Product
                            </Link>
                            <Link to="/admin/ads" className="btn btn-outline-warning font-weight-bold px-4 rounded-pill">
                                <i className="fa fa-image mr-2"></i> Setup Hero Slides
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
