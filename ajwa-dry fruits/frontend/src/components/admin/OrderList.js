import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteOrder, adminOrders as adminOrdersAction } from '../../actions/orderActions';
import { clearError, clearOrderDeleted } from '../../slices/orderSlice';
import Loader from '../layouts/Loader';
import { MDBDataTable } from 'mdbreact';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

export default function OrderList() {
    const { adminOrders = [], loading = true, error, isOrderDeleted } = useSelector(state => state.orderState);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const dispatch = useDispatch();

    const getStatusBadge = (order) => {
        const status = order.orderStatus;
        if (status === 'Cancelled') {
            return (
                <div>
                    <span className="badge badge-danger px-2 py-1"><i className="fa fa-times mr-1"></i> Cancelled</span>
                    {order.cancelInfo?.reason && (
                        <div className="small text-danger text-truncate" style={{ maxWidth: '140px', fontSize: '0.7rem' }}>
                            {order.cancelInfo.reason}
                        </div>
                    )}
                </div>
            );
        }
        if (status === 'Return Requested') {
            return (
                <div>
                    <span className="badge badge-warning text-dark px-2 py-1 font-weight-bold"><i className="fa fa-undo mr-1"></i> Return Requested</span>
                    {order.returnInfo?.reason && (
                        <div className="small text-warning text-truncate font-weight-bold" style={{ maxWidth: '140px', fontSize: '0.7rem' }}>
                            {order.returnInfo.reason}
                        </div>
                    )}
                </div>
            );
        }
        if (status === 'Return Approved' || status === 'Returned') {
            return <span className="badge badge-info px-2 py-1"><i className="fa fa-check-circle-o mr-1"></i> Return Approved</span>;
        }
        if (status === 'Return Rejected') {
            return <span className="badge badge-secondary px-2 py-1"><i className="fa fa-ban mr-1"></i> Return Rejected</span>;
        }
        if (status === 'Delivered') {
            return <span className="badge badge-success px-2 py-1"><i className="fa fa-check mr-1"></i> Delivered</span>;
        }
        if (status === 'Shipped') {
            return <span className="badge badge-primary px-2 py-1"><i className="fa fa-truck mr-1"></i> Shipped</span>;
        }
        if (status === 'Out for Delivery') {
            return <span className="badge px-2 py-1" style={{ backgroundColor: '#9c27b0', color: '#fff' }}><i className="fa fa-motorcycle mr-1"></i> Out for Delivery</span>;
        }
        if (status === 'Packaged') {
            return <span className="badge badge-info px-2 py-1"><i className="fa fa-cube mr-1"></i> Packaged</span>;
        }
        return <span className="badge badge-warning text-dark px-2 py-1"><i className="fa fa-clock-o mr-1"></i> {status || 'Processing'}</span>;
    };

    const filteredOrders = adminOrders.filter(order => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'RETURNS') return ['Return Requested', 'Return Approved', 'Return Rejected', 'Returned'].includes(order.orderStatus);
        if (statusFilter === 'CANCELLED') return order.orderStatus === 'Cancelled';
        return order.orderStatus === statusFilter;
    });

    const setOrders = () => {
        const data = {
            columns: [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Customer / Date',
                    field: 'customer',
                    sort: 'asc'
                },
                {
                    label: 'Items',
                    field: 'noOfItems',
                    sort: 'asc'
                },
                {
                    label: 'Amount',
                    field: 'amount',
                    sort: 'asc'
                },
                {
                    label: 'Payment',
                    field: 'payment',
                    sort: 'asc'
                },
                {
                    label: 'Status & Requests',
                    field: 'status',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                    sort: 'asc'
                }
            ],
            rows: []
        };

        filteredOrders.forEach(order => {
            const isPaid = order.paymentInfo && (order.paymentInfo.status === 'succeeded' || order.paymentInfo.status === 'PAID' || order.paymentInfo.status === 'COMPLETED');
            
            data.rows.push({
                id: (
                    <span className="font-weight-bold text-warning">
                        #{order._id || order.id}
                    </span>
                ),
                customer: (
                    <div>
                        <div className="text-white font-weight-bold small">{order.shippingInfo?.name || `User #${order.user}`}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                    </div>
                ),
                noOfItems: `${order.orderItems ? order.orderItems.length : 0} item(s)`,
                amount: (
                    <span className="font-weight-bold text-white">
                        Rs. {order.totalPrice}
                    </span>
                ),
                payment: (
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-danger'}`}>
                        {isPaid ? 'PAID' : 'PENDING'}
                    </span>
                ),
                status: getStatusBadge(order),
                actions: (
                    <div className="d-flex align-items-center gap-1">
                        <Link 
                            to={`/admin/order/${order._id || order.id}`} 
                            className="btn btn-warning btn-sm text-dark font-weight-bold"
                            title="Manage Status, Returns, & Tracking"
                        >
                            <i className="fa fa-pencil mr-1"></i> Manage
                        </Link>
                        <Button 
                            onClick={e => deleteHandler(e, order._id || order.id)} 
                            className="btn btn-danger btn-sm ml-1"
                            title="Delete Order"
                        >
                            <i className="fa fa-trash"></i>
                        </Button>
                    </div>
                )
            });
        });

        return data;
    };

    const deleteHandler = (e, id) => {
        if (window.confirm(`Are you sure you want to delete order #${id}?`)) {
            e.target.disabled = true;
            dispatch(deleteOrder(id));
        }
    };

    useEffect(() => {
        if (error) {
            toast(error, {
                position: 'bottom-center',
                type: 'error',
                onOpen: () => { dispatch(clearError()); }
            });
            return;
        }
        if (isOrderDeleted) {
            toast('Order Deleted Successfully!', {
                type: 'success',
                position: 'bottom-center',
                onOpen: () => dispatch(clearOrderDeleted())
            });
            return;
        }

        dispatch(adminOrdersAction);
    }, [dispatch, error, isOrderDeleted]);

    // Count return requests
    const returnRequestsCount = adminOrders.filter(o => o.orderStatus === 'Return Requested').length;

    return (
        <div className="ajwa-admin-page">
            <Sidebar />
            <div className="ajwa-admin-content">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2 className="ajwa-admin-title mb-1">
                            <i className="fa fa-shopping-bag mr-2"></i> Order Management & Live Logistics
                        </h2>
                        <span className="text-muted small">Manage lifecycle status, review cancellation & return requests, and assign courier tracking</span>
                    </div>
                    {returnRequestsCount > 0 && (
                        <div className="alert alert-warning m-0 py-2 px-3 d-flex align-items-center font-weight-bold text-dark">
                            <i className="fa fa-bell mr-2"></i> {returnRequestsCount} Pending Return Request(s) Needing Review
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {[
                        { label: 'All Orders', value: 'ALL' },
                        { label: 'Processing', value: 'Processing' },
                        { label: 'Packaged', value: 'Packaged' },
                        { label: 'Shipped', value: 'Shipped' },
                        { label: 'Out for Delivery', value: 'Out for Delivery' },
                        { label: 'Delivered', value: 'Delivered' },
                        { label: `Return Requests (${returnRequestsCount})`, value: 'RETURNS', highlight: returnRequestsCount > 0 },
                        { label: 'Cancelled', value: 'CANCELLED' }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            className={`btn btn-sm ${statusFilter === tab.value ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary text-white'}`}
                            onClick={() => setStatusFilter(tab.value)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Fragment>
                    {loading ? <Loader /> :
                        <MDBDataTable
                            data={setOrders()}
                            bordered
                            striped
                            hover
                            responsive
                            className="ajwa-admin-table"
                        />
                    }
                </Fragment>
            </div>
        </div>
    );
}
