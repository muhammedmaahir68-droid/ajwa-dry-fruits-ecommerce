import React, { Fragment, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from "react-router-dom";
import { orderDetail as orderDetailAction, updateOrder, adminReturnAction } from "../../actions/orderActions";
import { toast } from "react-toastify";
import { clearOrderUpdated, clearError } from "../../slices/orderSlice";

export default function UpdateOrder() {
    const { loading, isOrderUpdated, error, orderDetail = {} } = useSelector(state => state.orderState);
    const { user = {}, orderItems = [], shippingInfo = {}, totalPrice = 0, paymentInfo = {}, cancelInfo, returnInfo, trackingInfo = {} } = orderDetail;
    const isPaid = paymentInfo && (paymentInfo.status === 'succeeded' || paymentInfo.status === 'PAID' || paymentInfo.status === 'COMPLETED');
    
    const [orderStatus, setOrderStatus] = useState("Processing");
    const [courier, setCourier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [adminReturnNote, setAdminReturnNote] = useState("");

    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(orderDetailAction(orderId));
    }, [orderId, dispatch]);

    useEffect(() => {
        if (orderDetail._id || orderDetail.id) {
            setOrderStatus(orderDetail.orderStatus || "Processing");
            if (orderDetail.trackingInfo) {
                setCourier(orderDetail.trackingInfo.courier || "");
                setTrackingNumber(orderDetail.trackingInfo.trackingNumber || "");
                setEstimatedDelivery(orderDetail.trackingInfo.estimatedDelivery || "");
            }
        }
    }, [orderDetail]);

    useEffect(() => {
        if (isOrderUpdated) {
            toast.success('Order & Logistics Status Updated Successfully!', {
                position: 'bottom-center',
                onOpen: () => dispatch(clearOrderUpdated())
            });
            dispatch(orderDetailAction(orderId));
        }

        if (error) {
            toast.error(error, {
                position: 'bottom-center',
                onOpen: () => dispatch(clearError())
            });
        }
    }, [isOrderUpdated, error, dispatch, orderId]);

    const submitHandler = (e) => {
        e.preventDefault();
        const orderData = {
            orderStatus,
            trackingInfo: {
                courier,
                trackingNumber,
                estimatedDelivery,
                shippedAt: orderStatus === 'Shipped' ? new Date() : trackingInfo?.shippedAt,
                outForDeliveryAt: orderStatus === 'Out for Delivery' ? new Date() : trackingInfo?.outForDeliveryAt
            }
        };
        dispatch(updateOrder(orderId, orderData));
    };

    const handleReturnDecision = (action) => {
        dispatch(adminReturnAction(orderId, {
            action,
            adminComment: adminReturnNote || (action === 'approve' ? 'Return request approved. Refund initiated to customer.' : 'Return request rejected after inspection.')
        }));
    };

    const isReturnRequested = orderStatus === 'Return Requested';
    const isCancelled = orderStatus === 'Cancelled';

    return (
        <div className="ajwa-admin-page">
            <Sidebar />
            <div className="ajwa-admin-content">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                        <Link to="/admin/orders" className="btn btn-sm btn-outline-warning text-warning mb-2">
                            <i className="fa fa-arrow-left mr-1"></i> Back to Orders List
                        </Link>
                        <h2 className="ajwa-admin-title m-0">
                            <i className="fa fa-truck mr-2"></i> Update Order & Logistics Console
                        </h2>
                    </div>
                    <div>
                        <span className="badge badge-warning text-dark font-weight-bold px-3 py-2" style={{ fontSize: '0.9rem' }}>
                            Status: {orderStatus}
                        </span>
                    </div>
                </div>

                <div className="row">
                    {/* Left Column: Order Summary & Review */}
                    <div className="col-12 col-lg-7">
                        {/* CANCELLATION NOTICE IF APPLICABLE */}
                        {isCancelled && (
                            <div className="p-3 rounded mb-4 border border-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)' }}>
                                <h5 className="text-danger font-weight-bold mb-2">
                                    <i className="fa fa-times-circle mr-2"></i> Customer Cancellation Recorded
                                </h5>
                                <p className="mb-1 text-light small">
                                    <strong>Cancellation Reason:</strong> {cancelInfo?.reason || 'Cancelled before dispatch'}
                                </p>
                                <p className="mb-1 text-muted small">
                                    <strong>Cancelled By:</strong> {cancelInfo?.by || 'Customer'} | <strong>Time:</strong> {cancelInfo?.cancelledAt ? new Date(cancelInfo.cancelledAt).toLocaleString() : 'N/A'}
                                </p>
                                <span className="badge badge-success">Inventory Restocked Automatically</span>
                            </div>
                        )}

                        {/* RETURN REQUEST ACTION BOX IF APPLICABLE */}
                        {isReturnRequested && (
                            <div className="p-4 rounded mb-4 border border-warning shadow" style={{ backgroundColor: 'rgba(229, 169, 60, 0.12)' }}>
                                <h5 className="text-warning font-weight-bold mb-2">
                                    <i className="fa fa-exclamation-triangle mr-2"></i> Action Required: Customer Return Request
                                </h5>
                                <p className="mb-1 text-light">
                                    <strong>Customer Reason:</strong> {returnInfo?.reason || 'N/A'}
                                </p>
                                {returnInfo?.comment && (
                                    <p className="mb-2 text-muted small">
                                        <strong>Customer Notes:</strong> "{returnInfo.comment}"
                                    </p>
                                )}
                                <div className="form-group my-3">
                                    <label className="font-weight-bold text-warning small">Admin Resolution Note to Customer:</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Return approved. Courier will pick up items in 2 days."
                                        value={adminReturnNote}
                                        onChange={(e) => setAdminReturnNote(e.target.value)}
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button 
                                        type="button" 
                                        className="btn btn-success font-weight-bold"
                                        onClick={() => handleReturnDecision('approve')}
                                        disabled={loading}
                                    >
                                        <i className="fa fa-check mr-1"></i> Approve Return & Refund
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-danger font-weight-bold"
                                        onClick={() => handleReturnDecision('reject')}
                                        disabled={loading}
                                    >
                                        <i className="fa fa-times mr-1"></i> Reject Return
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="p-4 rounded mb-4 shadow" style={{ background: 'rgba(20, 10, 8, 0.85)', border: '1px solid rgba(229, 169, 60, 0.25)' }}>
                            <h5 className="text-warning font-weight-bold mb-3 border-bottom border-secondary pb-2">
                                <i className="fa fa-box mr-2"></i> Order Items
                            </h5>
                            {orderItems && orderItems.map((item, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded border border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                    <div className="d-flex align-items-center">
                                        <img src={item.image || '/images/products/1.jpg'} alt={item.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} className="mr-2" />
                                        <div>
                                            <div className="text-white font-weight-bold small">{item.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="text-warning font-weight-bold">
                                        Rs. {item.price}
                                    </div>
                                </div>
                            ))}
                            <div className="text-right mt-3 text-white font-weight-bold">
                                Total: <span className="text-warning">Rs. {totalPrice}</span>
                            </div>
                        </div>

                        {/* Shipping & Customer Details */}
                        <div className="p-4 rounded mb-4 shadow" style={{ background: 'rgba(20, 10, 8, 0.85)', border: '1px solid rgba(229, 169, 60, 0.25)' }}>
                            <h5 className="text-warning font-weight-bold mb-3 border-bottom border-secondary pb-2">
                                <i className="fa fa-user mr-2"></i> Customer & Shipping Information
                            </h5>
                            <p className="mb-1 text-white"><strong>Customer:</strong> {user?.name || shippingInfo?.name || 'Customer'}</p>
                            <p className="mb-1 text-muted small"><strong>Email:</strong> {user?.email || 'N/A'}</p>
                            <p className="mb-1 text-muted small"><strong>Phone:</strong> {shippingInfo?.phoneNo || 'N/A'}</p>
                            <p className="mb-1 text-muted small"><strong>Address:</strong> {shippingInfo?.address}, {shippingInfo?.city}, {shippingInfo?.state} - {shippingInfo?.postalCode}</p>
                            <p className="mb-0 text-muted small"><strong>Payment Status:</strong> <span className={isPaid ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'}>{isPaid ? 'PAID' : 'NOT PAID'}</span></p>
                        </div>
                    </div>

                    {/* Right Column: Status & Logistics Update Controls */}
                    <div className="col-12 col-lg-5">
                        <div className="p-4 rounded mb-4 shadow" style={{ background: 'rgba(20, 10, 8, 0.95)', border: '1.5px solid rgba(229, 169, 60, 0.4)' }}>
                            <h5 className="text-warning font-weight-bold mb-3 border-bottom border-secondary pb-2">
                                <i className="fa fa-sliders mr-2"></i> Update Order Status
                            </h5>

                            <form onSubmit={submitHandler}>
                                <div className="form-group mb-3">
                                    <label className="font-weight-bold text-warning small">Order Lifecycle Status:</label>
                                    <select 
                                        className="form-control"
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    >
                                        <option value="Processing">Processing (Order Placed)</option>
                                        <option value="Packaged">Packaged (Inspected & Sealed)</option>
                                        <option value="Shipped">Shipped (Dispatched)</option>
                                        <option value="Out for Delivery">Out for Delivery (On Route)</option>
                                        <option value="Delivered">Delivered (Completed)</option>
                                        <option value="Cancelled">Cancelled (Order Voided)</option>
                                        <option value="Return Approved">Return Approved (Refund Done)</option>
                                        <option value="Return Rejected">Return Rejected</option>
                                    </select>
                                </div>

                                <h6 className="text-warning font-weight-bold mt-4 mb-2">
                                    <i className="fa fa-map-marker mr-1"></i> Courier & Tracking Details:
                                </h6>

                                <div className="form-group mb-3">
                                    <label className="text-muted small">Courier Partner:</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="e.g. BlueDart, Delhivery, DTDC, India Post"
                                        value={courier}
                                        onChange={(e) => setCourier(e.target.value)}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="text-muted small">Tracking Number / AWB:</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="e.g. BLD987654321IN"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label className="text-muted small">Estimated Delivery Date:</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="e.g. 2-3 Business Days / Sept 08, 2026"
                                        value={estimatedDelivery}
                                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-warning btn-block font-weight-bold text-dark py-2 shadow-lg"
                                >
                                    {loading ? 'SAVING...' : 'SAVE ORDER & LOGISTICS STATUS'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
