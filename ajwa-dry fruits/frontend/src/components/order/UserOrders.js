import React, { Fragment, useEffect, useState } from 'react';
import MetaData from '../layouts/MetaData';
import { MDBDataTable } from 'mdbreact';
import { useDispatch, useSelector } from 'react-redux';
import { userOrders as userOrdersAction, cancelOrder } from '../../actions/orderActions';
import { clearOrderCancelled, clearError, clearMessage } from '../../slices/orderSlice';
import { Link } from 'react-router-dom';
import Loader from '../layouts/Loader';
import { toast } from 'react-toastify';

export default function UserOrders() {
    const { userOrders = [], loading, isOrderCancelled, error, message } = useSelector(state => state.orderState);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userOrdersAction);
    }, [dispatch]);

    useEffect(() => {
        if (isOrderCancelled) {
            toast.success(message || 'Order cancelled successfully!', { position: 'bottom-center' });
            dispatch(clearOrderCancelled());
            dispatch(clearMessage());
            dispatch(userOrdersAction);
        }
        if (error) {
            toast.error(error, { position: 'bottom-center' });
            dispatch(clearError());
        }
    }, [isOrderCancelled, error, message, dispatch]);

    const handleQuickCancel = (orderId) => {
        if (window.confirm(`Are you sure you want to cancel Order #${orderId}? Your refund will be processed automatically.`)) {
            dispatch(cancelOrder(orderId, 'Cancelled from My Orders table'));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Processing':
                return <span className="badge badge-warning text-dark px-2 py-1"><i className="fa fa-clock-o mr-1"></i> Processing</span>;
            case 'Packaged':
                return <span className="badge badge-info px-2 py-1"><i className="fa fa-cube mr-1"></i> Packaged</span>;
            case 'Shipped':
                return <span className="badge badge-primary px-2 py-1"><i className="fa fa-truck mr-1"></i> Shipped</span>;
            case 'Out for Delivery':
                return <span className="badge px-2 py-1" style={{ backgroundColor: '#9c27b0', color: '#fff' }}><i className="fa fa-motorcycle mr-1"></i> Out for Delivery</span>;
            case 'Delivered':
                return <span className="badge badge-success px-2 py-1"><i className="fa fa-check-circle mr-1"></i> Delivered</span>;
            case 'Cancelled':
                return <span className="badge badge-danger px-2 py-1"><i className="fa fa-times-circle mr-1"></i> Cancelled</span>;
            case 'Return Requested':
                return <span className="badge badge-warning text-dark px-2 py-1"><i className="fa fa-undo mr-1"></i> Return Requested</span>;
            case 'Return Approved':
            case 'Returned':
                return <span className="badge badge-info px-2 py-1"><i className="fa fa-check-circle-o mr-1"></i> Return Approved</span>;
            case 'Return Rejected':
                return <span className="badge badge-secondary px-2 py-1"><i className="fa fa-ban mr-1"></i> Return Rejected</span>;
            default:
                return <span className="badge badge-secondary px-2 py-1">{status || 'Processing'}</span>;
        }
    };

    const setOrders = () => {
        const data = {
            columns: [
                {
                    label: "Order ID",
                    field: 'id',
                    sort: "asc"
                },
                {
                    label: "Date",
                    field: 'date',
                    sort: "asc"
                },
                {
                    label: "Items",
                    field: 'numOfItems',
                    sort: "asc"
                },
                {
                    label: "Amount",
                    field: 'amount',
                    sort: "asc"
                },
                {
                    label: "Status / Stage",
                    field: 'status',
                    sort: "asc"
                },
                {
                    label: "Actions & Tracking",
                    field: 'actions',
                    sort: "asc"
                }
            ],
            rows: []
        };

        userOrders.forEach(order => {
            const canCancel = ['Processing', 'Packaged', 'Pending'].includes(order.orderStatus);
            const canReturn = order.orderStatus === 'Delivered' && !order.returnInfo;

            data.rows.push({
                id: <span className="text-warning font-weight-bold">#{order._id || order.id}</span>,
                date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent',
                numOfItems: `${order.orderItems ? order.orderItems.length : 0} Item(s)`,
                amount: <strong className="text-white">Rs. {order.totalPrice}</strong>,
                status: getStatusBadge(order.orderStatus),
                actions: (
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Link 
                            to={`/order/${order._id || order.id}`} 
                            className="btn btn-warning btn-sm font-weight-bold text-dark"
                            title="View Lifecycle Tracking & Receipt"
                        >
                            <i className="fa fa-eye mr-1"></i> Track & Details
                        </Link>
                        {canCancel && (
                            <button
                                type="button"
                                onClick={() => handleQuickCancel(order._id || order.id)}
                                className="btn btn-outline-danger btn-sm"
                                title="Cancel before shipment"
                            >
                                <i className="fa fa-ban mr-1"></i> Cancel
                            </button>
                        )}
                        {canReturn && (
                            <Link
                                to={`/order/${order._id || order.id}`}
                                className="btn btn-outline-warning btn-sm"
                                title="Request Return"
                            >
                                <i className="fa fa-undo mr-1"></i> Return
                            </Link>
                        )}
                    </div>
                )
            });
        });

        return data;
    };

    return (
        <Fragment>
            <MetaData title="My Orders & Tracking - Ajwa Dry Fruits" />
            <div className="container mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2 className="text-warning font-weight-bold m-0">
                            <i className="fa fa-shopping-bag mr-2"></i> My Orders & Live Tracking
                        </h2>
                        <small className="text-muted">Track package status, cancel before shipping, or initiate 7-day hassle-free returns</small>
                    </div>
                    <div className="d-flex gap-2">
                        <a href="tel:+919843571235" className="btn btn-outline-warning btn-sm font-weight-bold">
                            <i className="fa fa-phone mr-1"></i> Support: +91 98435 71235
                        </a>
                    </div>
                </div>

                {loading ? <Loader /> : (
                    userOrders.length === 0 ? (
                        <div className="text-center p-5 rounded shadow" style={{ background: 'rgba(20, 10, 8, 0.85)', border: '1px solid rgba(229,169,60,0.3)' }}>
                            <i className="fa fa-shopping-basket text-warning fa-3x mb-3"></i>
                            <h4 className="text-white font-weight-bold">No Orders Found</h4>
                            <p className="text-muted mb-4">You haven't placed any orders yet. Discover our premium royal collection of dry fruits & dates!</p>
                            <Link to="/" className="btn btn-warning font-weight-bold text-dark px-4 py-2">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="p-3 rounded shadow" style={{ background: 'rgba(20, 10, 8, 0.85)', border: '1px solid rgba(229,169,60,0.3)' }}>
                            <MDBDataTable
                                className="ajwa-admin-table text-white"
                                bordered
                                striped
                                hover
                                responsive
                                data={setOrders()}
                            />
                        </div>
                    )
                )}
            </div>
        </Fragment>
    );
}
