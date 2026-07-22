import React, { useEffect, useState } from 'react';
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProducts } from "../../actions/productActions";
import { getUsers } from '../../actions/userActions';
import { adminOrders as adminOrdersAction } from '../../actions/orderActions';
import { Link } from "react-router-dom";
import axios from 'axios';

export default function Dashboard() {
    const { products = [] } = useSelector(state => state.productsState);
    const { adminOrders = [] } = useSelector(state => state.orderState);
    const { users = [] } = useSelector(state => state.userState);
    const dispatch = useDispatch();

    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    let outOfStock = 0;
    if (products.length > 0) {
        products.forEach(product => {
            if (product.stock === 0) {
                outOfStock += 1;
            }
        });
    }

    let totalAmount = 0;
    if (adminOrders.length > 0) {
        adminOrders.forEach(order => {
            totalAmount += Number(order.totalPrice || 0);
        });
    }

    useEffect(() => {
        dispatch(getAdminProducts);
        dispatch(getUsers);
        dispatch(adminOrdersAction);

        const fetchAnalytics = async () => {
            try {
                const { data } = await axios.get('/api/v1/admin/analytics');
                setAnalytics(data);
            } catch (e) {
                console.log('Analytics load error:', e);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        fetchAnalytics();
    }, [dispatch]);

    // Pie chart colors
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

    return (
        <div className="row">
            <div className="col-12 col-md-2">
                <Sidebar />
            </div>
            <div className="col-12 col-md-10 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="my-2 font-weight-bold text-dark">Executive Admin Dashboard</h1>
                    <Link to="/admin/payrolls" className="btn btn-outline-primary font-weight-bold">
                        <i className="fa fa-money"></i> Manage Payrolls
                    </Link>
                </div>

                {/* Top Metrics Row */}
                <div className="row pr-4 mb-4">
                    <div className="col-xl-3 col-sm-6 mb-3">
                        <div className="card text-white bg-primary o-hidden h-100 shadow">
                            <div className="card-body">
                                <div className="text-center card-font-size">
                                    Total Sales Revenue<br />
                                    <b>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-sm-6 mb-3">
                        <div className="card text-white bg-success o-hidden h-100 shadow">
                            <div className="card-body">
                                <div className="text-center card-font-size">Total Products<br /> <b>{products.length}</b></div>
                            </div>
                            <Link className="card-footer text-white clearfix small z-1" to="/admin/products">
                                <span className="float-left">View Products</span>
                                <span className="float-right"><i className="fa fa-angle-right"></i></span>
                            </Link>
                        </div>
                    </div>

                    <div className="col-xl-3 col-sm-6 mb-3">
                        <div className="card text-white bg-danger o-hidden h-100 shadow">
                            <div className="card-body">
                                <div className="text-center card-font-size">Total Orders<br /> <b>{adminOrders.length}</b></div>
                            </div>
                            <Link className="card-footer text-white clearfix small z-1" to="/admin/orders">
                                <span className="float-left">View Orders</span>
                                <span className="float-right"><i className="fa fa-angle-right"></i></span>
                            </Link>
                        </div>
                    </div>

                    <div className="col-xl-3 col-sm-6 mb-3">
                        <div className="card text-white bg-warning o-hidden h-100 shadow">
                            <div className="card-body">
                                <div className="text-center card-font-size">Out of Stock Items<br /> <b>{outOfStock}</b></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Sales Pie Chart & Monthly Sales Section */}
                <div className="row pr-4 mb-4">
                    <div className="col-md-6 mb-4">
                        <div className="card shadow h-100">
                            <div className="card-header bg-white font-weight-bold text-uppercase d-flex justify-content-between">
                                <span><i className="fa fa-pie-chart text-primary"></i> Category Sales Percentage (Pie Chart)</span>
                            </div>
                            <div className="card-body">
                                {loadingAnalytics ? (
                                    <p className="text-center">Calculating chart analytics...</p>
                                ) : (
                                    analytics && analytics.pieChartCategory && analytics.pieChartCategory.length > 0 ? (
                                        <div className="row align-items-center">
                                            <div className="col-md-6 text-center">
                                                <svg width="200" height="200" viewBox="0 0 42 42" className="donut">
                                                    <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                                                    <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="5"></circle>
                                                    {(() => {
                                                        let accumulated = 0;
                                                        return analytics.pieChartCategory.map((cat, idx) => {
                                                            const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
                                                            const strokeDashoffset = 100 - accumulated + 25;
                                                            accumulated += cat.percentage;
                                                            return (
                                                                <circle
                                                                    key={idx}
                                                                    className="donut-segment"
                                                                    cx="21" cy="21" r="15.91549430918954"
                                                                    fill="transparent"
                                                                    stroke={colors[idx % colors.length]}
                                                                    strokeWidth="5"
                                                                    strokeDasharray={strokeDasharray}
                                                                    strokeDashoffset={strokeDashoffset}
                                                                >
                                                                    <title>{cat.label}: {cat.percentage}% (${cat.value})</title>
                                                                </circle>
                                                            );
                                                        });
                                                    })()}
                                                </svg>
                                            </div>
                                            <div className="col-md-6">
                                                <ul className="list-group list-group-flush small">
                                                    {analytics.pieChartCategory.map((cat, idx) => (
                                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
                                                            <span>
                                                                <span className="d-inline-block rounded-circle mr-2" style={{ width: 12, height: 12, backgroundColor: colors[idx % colors.length] }}></span>
                                                                {cat.label}
                                                            </span>
                                                            <span className="font-weight-bold">{cat.percentage}% (${cat.value})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-4">No order sales data available yet for pie chart visualization.</div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend & Top Sellers */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow h-100">
                            <div className="card-header bg-white font-weight-bold text-uppercase">
                                <i className="fa fa-line-chart text-success"></i> Monthly Sales & Revenue Trend
                            </div>
                            <div className="card-body">
                                {analytics && analytics.monthlySales && analytics.monthlySales.length > 0 ? (
                                    <table className="table table-bordered table-sm text-center">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Month</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.monthlySales.map((m, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-weight-bold">{m.month}</td>
                                                    <td>{m.ordersCount}</td>
                                                    <td className="text-success font-weight-bold">${m.revenue.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="alert alert-info text-center">
                                        Sales figures tracked per month. Place orders to view live monthly trend graphs.
                                    </div>
                                )}

                                <h6 className="font-weight-bold mt-4 mb-2"><i className="fa fa-trophy text-warning"></i> Top Performing Products</h6>
                                {analytics && analytics.topProducts && analytics.topProducts.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {analytics.topProducts.map((tp, idx) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-1">
                                                <span>#{idx + 1} {tp.name}</span>
                                                <span className="badge badge-primary px-2 py-1">${tp.revenue.toFixed(2)} ({tp.unitsSold} sold)</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="small text-muted mb-0">Top products will rank automatically based on sales volume.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Improvement Predictions Widget */}
                <div className="card shadow mb-4">
                    <div className="card-header bg-dark text-white font-weight-bold text-uppercase d-flex justify-content-between align-items-center">
                        <span><i className="fa fa-magic text-warning"></i> Product Improvement & Restock Forecast Engine</span>
                        <span className="badge badge-warning">Predictive AI Insights</span>
                    </div>
                    <div className="card-body table-responsive">
                        {analytics && analytics.predictions && analytics.predictions.length > 0 ? (
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Stock Left</th>
                                        <th>Rating</th>
                                        <th>Priority</th>
                                        <th>AI Prediction & Recommended Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.predictions.map((p, idx) => (
                                        <tr key={idx}>
                                            <td className="font-weight-bold">{p.productName}</td>
                                            <td>{p.category}</td>
                                            <td>
                                                <span className={`badge badge-${p.currentStock <= 3 ? 'danger' : 'success'}`}>
                                                    {p.currentStock} units
                                                </span>
                                            </td>
                                            <td>{p.rating} / 5 ⭐</td>
                                            <td>
                                                <span className={`badge badge-${p.priority === 'High' ? 'danger' : (p.priority === 'Medium' ? 'warning' : 'secondary')}`}>
                                                    {p.priority} Priority
                                                </span>
                                            </td>
                                            <td className="font-weight-bold">{p.recommendation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-muted">No prediction insights available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
