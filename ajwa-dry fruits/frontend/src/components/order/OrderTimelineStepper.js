import React from 'react';

export default function OrderTimelineStepper({ order }) {
    if (!order) return null;

    const { orderStatus = 'Processing', createdAt, paidAt, deliveredAt, trackingInfo, cancelInfo, returnInfo } = order;

    const isCancelled = orderStatus === 'Cancelled';
    const isReturnRequested = orderStatus === 'Return Requested';
    const isReturnApproved = orderStatus === 'Return Approved' || orderStatus === 'Returned';
    const isReturnRejected = orderStatus === 'Return Rejected';

    const steps = [
        {
            key: 'placed',
            title: 'Order Placed',
            desc: paidAt ? 'Payment Verified' : 'Order Received',
            icon: 'fa-check-circle',
            time: paidAt || createdAt
        },
        {
            key: 'packaged',
            title: 'Packaged',
            desc: 'Freshness Packed & Quality Inspected',
            icon: 'fa-cube',
            time: null
        },
        {
            key: 'shipped',
            title: 'Shipped',
            desc: trackingInfo?.courier ? `${trackingInfo.courier} (AWB: ${trackingInfo.trackingNumber || 'Assigned'})` : 'Dispatched from Hub',
            icon: 'fa-truck',
            time: trackingInfo?.shippedAt
        },
        {
            key: 'out_for_delivery',
            title: 'Out for Delivery',
            desc: 'Courier Executive On Route',
            icon: 'fa-motorcycle',
            time: trackingInfo?.outForDeliveryAt
        },
        {
            key: 'delivered',
            title: 'Delivered',
            desc: 'Delivered to Doorstep',
            icon: 'fa-home',
            time: deliveredAt
        }
    ];

    let activeIndex = 0;
    if (orderStatus === 'Processing') activeIndex = 0;
    else if (orderStatus === 'Packaged') activeIndex = 1;
    else if (orderStatus === 'Shipped') activeIndex = 2;
    else if (orderStatus === 'Out for Delivery') activeIndex = 3;
    else if (orderStatus === 'Delivered' || isReturnRequested || isReturnApproved || isReturnRejected) activeIndex = 4;

    return (
        <div className="ajwa-order-stepper-card p-4 rounded mb-4" style={{
            background: 'linear-gradient(145deg, rgba(28, 14, 11, 0.95), rgba(13, 6, 5, 0.98))',
            border: '1.5px solid rgba(229, 169, 60, 0.35)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.7)'
        }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h5 className="text-warning font-weight-bold m-0 d-flex align-items-center">
                        <i className="fa fa-map-marker text-warning mr-2"></i> Live Order Lifecycle Tracking
                    </h5>
                    <small className="text-muted">Real-time status synced with Ajwa Logistics Engine</small>
                </div>
                <div>
                    <span className={`badge px-3 py-2 font-weight-bold text-uppercase ${
                        isCancelled ? 'badge-danger' :
                        isReturnRequested ? 'badge-warning text-dark' :
                        isReturnApproved ? 'badge-info' :
                        isReturnRejected ? 'badge-secondary' :
                        orderStatus === 'Delivered' ? 'badge-success' : 'badge-warning text-dark'
                    }`} style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
                        ● {orderStatus}
                    </span>
                </div>
            </div>

            {isCancelled ? (
                <div className="p-3 rounded mb-3 border border-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.12)' }}>
                    <div className="d-flex align-items-center text-danger font-weight-bold mb-1">
                        <i className="fa fa-times-circle mr-2 fa-lg"></i> Order Cancelled
                    </div>
                    <p className="small text-light mb-1">
                        <strong>Reason:</strong> {cancelInfo?.reason || 'Cancelled before dispatch'}
                    </p>
                    {cancelInfo?.cancelledAt && (
                        <p className="small text-muted mb-1">
                            <strong>Date:</strong> {new Date(cancelInfo.cancelledAt).toLocaleString()}
                        </p>
                    )}
                    <div className="small text-warning mt-2 d-flex align-items-center">
                        <i className="fa fa-shield mr-1"></i> Refund Status: <strong>{cancelInfo?.refundStatus || 'Initiated to original payment method'}</strong> (3-5 business days)
                    </div>
                </div>
            ) : (
                <div className="position-relative py-3">
                    <div className="d-none d-md-flex justify-content-between align-items-start position-relative">
                        <div className="position-absolute" style={{
                            top: '20px',
                            left: '5%',
                            right: '5%',
                            height: '4px',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #e5a93c, #00e676)',
                                transition: 'width 600ms ease'
                            }}></div>
                        </div>

                        {steps.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            return (
                                <div key={step.key} className="text-center position-relative" style={{ zIndex: 2, flex: 1 }}>
                                    <div 
                                        className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm ${
                                            isCurrent ? 'bg-warning text-dark border border-white' : 
                                            isCompleted ? 'bg-success text-white' : 'bg-dark text-muted border border-secondary'
                                        }`}
                                        style={{
                                            width: isCurrent ? '44px' : '38px',
                                            height: isCurrent ? '44px' : '38px',
                                            fontSize: '1rem',
                                            transition: 'all 300ms ease',
                                            transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                                            boxShadow: isCurrent ? '0 0 15px rgba(229,169,60,0.6)' : 'none'
                                        }}
                                    >
                                        <i className={`fa ${step.icon}`}></i>
                                    </div>
                                    <div className={`font-weight-bold small ${isCurrent ? 'text-warning' : isCompleted ? 'text-white' : 'text-muted'}`}>
                                        {step.title}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.72rem', maxWidth: '120px', margin: '0 auto', lineHeight: '1.2' }}>
                                        {step.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="d-flex d-md-none flex-column gap-3 pl-2">
                        {steps.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            return (
                                <div key={step.key} className="d-flex align-items-start mb-2">
                                    <div 
                                        className={`rounded-circle d-flex align-items-center justify-content-center mr-3 mt-1 ${
                                            isCurrent ? 'bg-warning text-dark' : 
                                            isCompleted ? 'bg-success text-white' : 'bg-dark text-muted border border-secondary'
                                        }`}
                                        style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.85rem' }}
                                    >
                                        <i className={`fa ${step.icon}`}></i>
                                    </div>
                                    <div>
                                        <div className={`font-weight-bold small ${isCurrent ? 'text-warning' : isCompleted ? 'text-white' : 'text-muted'}`}>
                                            {step.title} {isCurrent && <span className="badge badge-warning text-dark ml-1">Active</span>}
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                            {step.desc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {(isReturnRequested || isReturnApproved || isReturnRejected) && (
                <div className={`p-3 rounded mt-3 border ${
                    isReturnApproved ? 'border-success' : isReturnRejected ? 'border-danger' : 'border-warning'
                }`} style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="font-weight-bold d-flex align-items-center text-warning">
                            <i className="fa fa-undo mr-2"></i> Return & Refund Status: 
                            <span className={`badge ml-2 ${
                                isReturnApproved ? 'badge-success' : isReturnRejected ? 'badge-danger' : 'badge-warning text-dark'
                            }`}>
                                {returnInfo?.status || orderStatus}
                            </span>
                        </div>
                        {returnInfo?.requestedAt && (
                            <small className="text-muted">{new Date(returnInfo.requestedAt).toLocaleDateString()}</small>
                        )}
                    </div>
                    <p className="small text-light mb-1">
                        <strong>Return Reason:</strong> {returnInfo?.reason || 'Customer Return'}
                    </p>
                    {returnInfo?.comment && (
                        <p className="small text-muted mb-1">
                            <strong>Customer Note:</strong> "{returnInfo.comment}"
                        </p>
                    )}
                    {returnInfo?.adminComment && (
                        <div className="small p-2 rounded bg-dark border border-secondary mt-2 text-info">
                            <strong><i className="fa fa-commenting-o mr-1"></i> Ajwa Care Resolution:</strong> {returnInfo.adminComment}
                        </div>
                    )}
                </div>
            )}

            {trackingInfo?.trackingNumber && (
                <div className="mt-3 pt-3 border-top border-secondary d-flex justify-content-between align-items-center flex-wrap gap-2 small">
                    <div className="text-muted">
                        <i className="fa fa-barcode mr-1 text-warning"></i> Tracking / AWB: <strong className="text-white">{trackingInfo.trackingNumber}</strong> ({trackingInfo.courier || 'Express Courier'})
                    </div>
                    {trackingInfo?.estimatedDelivery && (
                        <div className="text-warning font-weight-bold">
                            <i className="fa fa-calendar-check-o mr-1"></i> Est. Delivery: {trackingInfo.estimatedDelivery}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
