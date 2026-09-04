import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Loader from '../layouts/Loader';
import MetaData from '../layouts/MetaData';
import { orderDetail as orderDetailAction, cancelOrder, returnOrder } from '../../actions/orderActions';
import { clearOrderCancelled, clearOrderReturned, clearError, clearMessage } from '../../slices/orderSlice';
import OrderTimelineStepper from './OrderTimelineStepper';
import { toast } from 'react-toastify';

export default function OrderDetail() {
    const { orderDetail = {}, loading, isOrderCancelled, isOrderReturned, error, message } = useSelector(state => state.orderState);
    const { shippingInfo = {}, user = {}, orderStatus = "Processing", orderItems = [], totalPrice = 0, paymentInfo = {}, cancelInfo, returnInfo } = orderDetail;
    const isPaid = paymentInfo && (paymentInfo.status === "succeeded" || paymentInfo.status === "PAID" || paymentInfo.status === "COMPLETED");
    const dispatch = useDispatch();
    const { id } = useParams();

    // Cancellation Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('Found a better price / changed mind');
    const [customCancelReason, setCustomCancelReason] = useState('');

    // Return Modal State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('Damaged or spoiled item');
    const [returnComment, setReturnComment] = useState('');

    useEffect(() => {
        dispatch(orderDetailAction(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (isOrderCancelled) {
            toast.success(message || 'Order cancelled successfully! Refund initiated.', { position: 'bottom-center' });
            dispatch(clearOrderCancelled());
            dispatch(clearMessage());
            setShowCancelModal(false);
            dispatch(orderDetailAction(id));
        }
        if (isOrderReturned) {
            toast.success(message || 'Return request submitted successfully! Ajwa team will contact you.', { position: 'bottom-center' });
            dispatch(clearOrderReturned());
            dispatch(clearMessage());
            setShowReturnModal(false);
            dispatch(orderDetailAction(id));
        }
        if (error) {
            toast.error(error, { position: 'bottom-center' });
            dispatch(clearError());
        }
    }, [isOrderCancelled, isOrderReturned, error, message, dispatch, id]);

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        const finalReason = cancelReason === 'Other' ? (customCancelReason || 'Cancelled by customer') : cancelReason;
        dispatch(cancelOrder(id, finalReason));
    };

    const handleReturnSubmit = (e) => {
        e.preventDefault();
        dispatch(returnOrder(id, { reason: returnReason, comment: returnComment }));
    };

    // Check if eligible for cancel (Processing or Packaged)
    const canCancel = ['Processing', 'Packaged', 'Pending'].includes(orderStatus);
    
    // Check if eligible for return (Delivered & not already return requested)
    const canReturn = orderStatus === 'Delivered' && !returnInfo;

    return (
        <Fragment>
            <MetaData title={`Order #${orderDetail._id || id} - Ajwa Dry Fruits`} />
            {loading ? <Loader /> : (
                <div className="container mt-4 mb-5">
                    {/* Top Breadcrumb & Actions */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <Link to="/orders/me" className="btn btn-sm btn-outline-warning text-warning">
                            <i className="fa fa-arrow-left mr-1"></i> Back to My Orders
                        </Link>
                        <div className="d-flex gap-2">
                            {canCancel && (
                                <button 
                                    className="btn btn-sm btn-danger font-weight-bold shadow-sm"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    <i className="fa fa-ban mr-1"></i> Cancel Order Before Shipping
                                </button>
                            )}
                            {canReturn && (
                                <button 
                                    className="btn btn-sm btn-warning text-dark font-weight-bold shadow-sm"
                                    onClick={() => setShowReturnModal(true)}
                                >
                                    <i className="fa fa-undo mr-1"></i> Request 7-Day Return
                                </button>
                            )}
                            <a 
                                href="tel:+919876543210" 
                                className="btn btn-sm btn-outline-success font-weight-bold"
                                title="24/7 Ajwa Helpline"
                            >
                                <i className="fa fa-phone mr-1"></i> Care: +91 98765 43210
                            </a>
                        </div>
                    </div>

                    {/* Order Header Card */}
                    <div className="p-3 p-md-4 rounded mb-4 shadow-lg" style={{
                        background: 'linear-gradient(135deg, rgba(30, 15, 10, 0.95), rgba(15, 7, 5, 0.98))',
                        border: '1.5px solid rgba(229, 169, 60, 0.4)'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-md-7">
                                <span className="badge badge-warning text-dark font-weight-bold text-uppercase px-2 py-1 mb-2">
                                    Official Order Receipt
                                </span>
                                <h3 className="text-warning font-weight-bold mb-1">
                                    Order #{orderDetail._id || id}
                                </h3>
                                <p className="text-muted small mb-0">
                                    Placed on: {orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleString() : 'Recent'} | Total: <strong className="text-white">Rs. {totalPrice}</strong>
                                </p>
                            </div>
                            <div className="col-12 col-md-5 text-md-right mt-3 mt-md-0">
                                <div className="d-inline-block text-left p-2 rounded bg-dark border border-secondary">
                                    <div className="small text-muted">Payment Method: <strong className="text-warning">{paymentInfo?.paymentMethod || 'UPI / Online'}</strong></div>
                                    <div className="small text-muted">Payment Status: <span className={`font-weight-bold ${isPaid ? 'text-success' : 'text-danger'}`}>{isPaid ? 'PAID' : 'PENDING'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual 5-Stage Stepper Tracker */}
                    <OrderTimelineStepper order={orderDetail} />

                    {/* Order Details & Shipping Cards */}
                    <div className="row">
                        <div className="col-12 col-lg-8">
                            {/* Items Card */}
                            <div className="p-4 rounded mb-4 shadow" style={{
                                background: 'rgba(20, 10, 8, 0.85)',
                                border: '1px solid rgba(229, 169, 60, 0.25)'
                            }}>
                                <h5 className="text-warning font-weight-bold mb-3 border-bottom border-secondary pb-2">
                                    <i className="fa fa-shopping-basket mr-2"></i> Ordered Items ({orderItems.length})
                                </h5>

                                <div className="d-flex flex-column gap-3">
                                    {orderItems && orderItems.map((item, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded mb-2 border border-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={item.image || '/images/products/1.jpg'} 
                                                    alt={item.name} 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(229,169,60,0.3)' }}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <Link to={`/product/${item.product || item.id}`} className="text-white font-weight-bold text-decoration-none">
                                                        {item.name}
                                                    </Link>
                                                    <div className="small text-muted">Fresh Batch Guaranteed</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-warning font-weight-bold">Rs. {item.price}</div>
                                                <small className="text-muted">Qty: {item.quantity}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Customer & Shipping Information */}
                        <div className="col-12 col-lg-4">
                            <div className="p-4 rounded mb-4 shadow" style={{
                                background: 'rgba(20, 10, 8, 0.85)',
                                border: '1px solid rgba(229, 169, 60, 0.25)'
                            }}>
                                <h5 className="text-warning font-weight-bold mb-3 border-bottom border-secondary pb-2">
                                    <i className="fa fa-truck mr-2"></i> Delivery Address
                                </h5>
                                <p className="mb-1 text-white"><strong>Recipient:</strong> {user?.name || shippingInfo?.name || 'Customer'}</p>
                                <p className="mb-1 text-muted small"><strong>Phone:</strong> {shippingInfo?.phoneNo || 'N/A'}</p>
                                <p className="mb-3 text-muted small">
                                    <strong>Address:</strong> {shippingInfo?.address}, {shippingInfo?.city}, {shippingInfo?.state} - {shippingInfo?.postalCode}, {shippingInfo?.country}
                                </p>

                                <h6 className="text-warning font-weight-bold mt-4 mb-2 border-top border-secondary pt-3">
                                    <i className="fa fa-calculator mr-2"></i> Price Breakdown
                                </h6>
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>Items Subtotal:</span>
                                    <span>Rs. {orderDetail.itemsPrice || totalPrice}</span>
                                </div>
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>Shipping & Handling:</span>
                                    <span className="text-success">{orderDetail.shippingPrice === 0 ? 'FREE' : `Rs. ${orderDetail.shippingPrice || 0}`}</span>
                                </div>
                                <div className="d-flex justify-content-between small text-muted mb-2">
                                    <span>GST / Tax:</span>
                                    <span>Rs. {orderDetail.taxPrice || 0}</span>
                                </div>
                                <div className="d-flex justify-content-between font-weight-bold text-white border-top border-secondary pt-2">
                                    <span>Total Amount Paid:</span>
                                    <span className="text-warning">Rs. {totalPrice}</span>
                                </div>
                            </div>

                            {/* Help & Support Card */}
                            <div className="p-3 rounded border border-warning text-center" style={{ backgroundColor: 'rgba(229, 169, 60, 0.08)' }}>
                                <i className="fa fa-headphones text-warning fa-2x mb-2"></i>
                                <h6 className="text-warning font-weight-bold mb-1">Have an issue with this order?</h6>
                                <p className="small text-muted mb-2">Our customer care is available 24/7 to resolve refunds, returns, or queries.</p>
                                <a href="tel:+919876543210" className="btn btn-warning btn-sm font-weight-bold text-dark px-3 shadow-sm">
                                    <i className="fa fa-phone mr-1"></i> Call +91 98765 43210
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCEL ORDER MODAL */}
            {showCancelModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-white" style={{
                            backgroundColor: '#1c0e0b',
                            border: '2px solid rgba(220, 53, 69, 0.6)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.9)'
                        }}>
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title text-danger font-weight-bold">
                                    <i className="fa fa-ban mr-2"></i> Cancel Order #{orderDetail._id || id}
                                </h5>
                                <button type="button" className="close text-white" onClick={() => setShowCancelModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleCancelSubmit}>
                                <div className="modal-body">
                                    <div className="alert alert-warning small text-dark font-weight-bold mb-3">
                                        <i className="fa fa-info-circle mr-1"></i> Orders can be cancelled instantly before dispatch. Your payment of <strong>Rs. {totalPrice}</strong> will be refunded to your original payment method within 3-5 business days.
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold text-warning small">Please select reason for cancellation:</label>
                                        <select 
                                            className="form-control"
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        >
                                            <option value="Found a better price / changed mind">Found a better price / changed mind</option>
                                            <option value="Ordered wrong item or quantity">Ordered wrong item or quantity</option>
                                            <option value="Shipping address mistake">Shipping address mistake</option>
                                            <option value="Ordered by mistake">Ordered by mistake</option>
                                            <option value="Delivery time is too long">Delivery time is too long</option>
                                            <option value="Other">Other reason</option>
                                        </select>
                                    </div>

                                    {cancelReason === 'Other' && (
                                        <div className="form-group mb-3">
                                            <label className="font-weight-bold text-warning small">Explain reason:</label>
                                            <textarea 
                                                className="form-control"
                                                rows="3"
                                                placeholder="Tell us what happened..."
                                                value={customCancelReason}
                                                onChange={(e) => setCustomCancelReason(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                                        Keep Order
                                    </button>
                                    <button type="submit" className="btn btn-danger font-weight-bold">
                                        Confirm & Cancel Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* RETURN ORDER MODAL */}
            {showReturnModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-white" style={{
                            backgroundColor: '#1c0e0b',
                            border: '2px solid rgba(229, 169, 60, 0.6)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.9)'
                        }}>
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title text-warning font-weight-bold">
                                    <i className="fa fa-undo mr-2"></i> Request 7-Day Hassle-Free Return
                                </h5>
                                <button type="button" className="close text-white" onClick={() => setShowReturnModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleReturnSubmit}>
                                <div className="modal-body">
                                    <div className="alert alert-info small text-dark font-weight-bold mb-3">
                                        <i className="fa fa-shield mr-1"></i> Ajwa 100% Quality Guarantee: If you are unsatisfied with the quality or received damaged items, submit this request. Our team will verify and dispatch a replacement or full refund.
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold text-warning small">Select Reason for Return:</label>
                                        <select 
                                            className="form-control"
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            required
                                        >
                                            <option value="Damaged or spoiled item">Damaged or spoiled item</option>
                                            <option value="Incorrect item or size received">Incorrect item or size received</option>
                                            <option value="Quality not as expected">Quality not as expected</option>
                                            <option value="Package seal was broken/tampered">Package seal was broken/tampered</option>
                                            <option value="Missing items in package">Missing items in package</option>
                                            <option value="Other">Other issue</option>
                                        </select>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold text-warning small">Additional Details / Comments:</label>
                                        <textarea 
                                            className="form-control"
                                            rows="3"
                                            placeholder="Provide any details that will help us process your return faster..."
                                            value={returnComment}
                                            onChange={(e) => setReturnComment(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-warning text-dark font-weight-bold">
                                        Submit Return Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
