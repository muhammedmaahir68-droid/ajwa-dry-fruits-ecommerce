const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const { serializeOrder, serializeUser } = require('../utils/serialize');

async function reduceStock(productId, quantity) {
    const product = await Product.findByPk(productId);
    if (!product) return;
    const currentStock = Number(product.stock) || 0;
    product.stock = Math.max(0, currentStock - Number(quantity || 1));
    await product.save();
}

async function restoreStock(productId, quantity) {
    const product = await Product.findByPk(productId);
    if (!product) return;
    const currentStock = Number(product.stock) || 0;
    product.stock = currentStock + Number(quantity || 1);
    await product.save();
}

exports.newOrder = catchAsyncError(async (req, res) => {
    const { orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentInfo } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: new Date(),
        orderStatus: 'Processing',
        user: req.user.id
    });

    if (Array.isArray(orderItems)) {
        for (const item of orderItems) {
            const pId = item.product || item.id || item._id;
            if (pId) {
                await reduceStock(pId, item.quantity || 1);
            }
        }
    }

    res.status(200).json({
        success: true,
        order: serializeOrder(order)
    });
});

// Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with this id: ' + req.params.id, 404));
    }

    const user = await User.findByPk(order.user);
    const orderData = serializeOrder(order);
    orderData.user = serializeUser(user);

    res.status(200).json({
        success: true,
        order: orderData
    });
});

// Get Loggedin User Orders - /api/v1/myorders
exports.myOrders = catchAsyncError(async (req, res) => {
    const orders = await Order.findAll({
        where: { user: req.user.id },
        order: [['id', 'DESC']]
    });

    res.status(200).json({
        success: true,
        orders: orders.map(serializeOrder)
    });
});

// Cancel Order (Customer/Admin) - api/v1/order/:id/cancel
exports.cancelOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with id: ' + req.params.id, 404));
    }

    // Verify ownership or admin
    if (order.user !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorized to cancel this order', 403));
    }

    // Cancellation is allowed only before shipping (Processing or Packaged)
    const allowedStatuses = ['Processing', 'Packaged', 'Pending'];
    if (!allowedStatuses.includes(order.orderStatus)) {
        return next(new ErrorHandler('Order cannot be cancelled because it is already ' + order.orderStatus + '. Please contact Ajwa Customer Care.', 400));
    }

    const reason = req.body.reason || 'Cancelled by customer';
    order.orderStatus = 'Cancelled';
    order.cancelInfo = {
        reason,
        cancelledAt: new Date(),
        by: req.user.role === 'admin' ? ('Admin (' + req.user.name + ')') : req.user.name,
        refundStatus: 'Initiated'
    };

    // Restore inventory stock
    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
    for (const item of items) {
        const pId = item.product || item.id || item._id;
        if (pId) {
            await restoreStock(pId, item.quantity || 1);
        }
    }

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully and refund initiated.',
        order: serializeOrder(order)
    });
});

// Request Return (Customer) - api/v1/order/:id/return
exports.returnOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with id: ' + req.params.id, 404));
    }

    if (order.user !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorized to request return for this order', 403));
    }

    if (order.orderStatus !== 'Delivered') {
        return next(new ErrorHandler('Return can only be requested for Delivered orders.', 400));
    }

    const { reason, comment } = req.body;
    if (!reason) {
        return next(new ErrorHandler('Please select a reason for return.', 400));
    }

    order.orderStatus = 'Return Requested';
    order.returnInfo = {
        reason,
        comment: comment || '',
        requestedAt: new Date(),
        status: 'Requested'
    };

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Return request submitted successfully. Our Ajwa Care team will process it within 24 hours.',
        order: serializeOrder(order)
    });
});

// Admin: Approve / Reject Return Action - api/v1/admin/order/:id/return-action
exports.adminReturnAction = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with id: ' + req.params.id, 404));
    }

    const { action, adminComment } = req.body; // action: 'approve' | 'reject'
    const prevReturnInfo = order.returnInfo || {};

    if (action === 'approve') {
        order.orderStatus = 'Return Approved';
        order.returnInfo = {
            ...prevReturnInfo,
            status: 'Approved',
            adminComment: adminComment || 'Return approved. Refund processed.',
            resolvedAt: new Date()
        };

        // Restock inventory
        const items = Array.isArray(order.orderItems) ? order.orderItems : [];
        for (const item of items) {
            const pId = item.product || item.id || item._id;
            if (pId) {
                await restoreStock(pId, item.quantity || 1);
            }
        }
    } else if (action === 'reject') {
        order.orderStatus = 'Return Rejected';
        order.returnInfo = {
            ...prevReturnInfo,
            status: 'Rejected',
            adminComment: adminComment || 'Return request could not be approved.',
            resolvedAt: new Date()
        };
    } else {
        return next(new ErrorHandler('Invalid return action. Must be approve or reject.', 400));
    }

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Return request ' + (action === 'approve' ? 'approved' : 'rejected') + ' successfully.',
        order: serializeOrder(order)
    });
});

// Admin: Get All Orders - api/v1/admin/orders
exports.orders = catchAsyncError(async (req, res) => {
    const orders = await Order.findAll({ order: [['id', 'DESC']] });
    const totalAmount = orders.reduce((acc, order) => acc + Number(order.totalPrice || 0), 0);

    res.status(200).json({
        success: true,
        totalAmount,
        orders: orders.map(serializeOrder)
    });
});

// Admin: Update Order / Order Status - api/v1/admin/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with this id: ' + req.params.id, 404));
    }

    const prevStatus = order.orderStatus;
    const newStatus = req.body.orderStatus || prevStatus;

    // Handle stock restoration if admin cancels or approves return directly
    const isNowCancelledOrReturned = ['Cancelled', 'Return Approved'].includes(newStatus);
    const wasAlreadyCancelledOrReturned = ['Cancelled', 'Return Approved'].includes(prevStatus);

    if (isNowCancelledOrReturned && !wasAlreadyCancelledOrReturned) {
        const items = Array.isArray(order.orderItems) ? order.orderItems : [];
        for (const item of items) {
            const pId = item.product || item.id || item._id;
            if (pId) {
                await restoreStock(pId, item.quantity || 1);
            }
        }
    }

    order.orderStatus = newStatus;

    if (newStatus === 'Delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
    }

    if (req.body.trackingInfo) {
        order.trackingInfo = {
            ...(order.trackingInfo || {}),
            ...req.body.trackingInfo,
            updatedAt: new Date()
        };
    }

    if (req.body.cancelInfo) {
        order.cancelInfo = {
            ...(order.cancelInfo || {}),
            ...req.body.cancelInfo
        };
    }

    if (req.body.returnInfo) {
        order.returnInfo = {
            ...(order.returnInfo || {}),
            ...req.body.returnInfo
        };
    }

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order: serializeOrder(order)
    });
});

// Admin: Delete Order - api/v1/admin/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found with this id: ' + req.params.id, 404));
    }

    await order.destroy();
    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});
