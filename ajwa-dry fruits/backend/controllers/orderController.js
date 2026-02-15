const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const { serializeOrder, serializeUser } = require('../utils/serialize');

//Create New Order - api/v1/order/new
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
        user: req.user.id
    });

    res.status(200).json({
        success: true,
        order: serializeOrder(order)
    });
});

//Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }

    const user = await User.findByPk(order.user);
    const orderData = serializeOrder(order);
    orderData.user = serializeUser(user);

    res.status(200).json({
        success: true,
        order: orderData
    });
});

//Get Loggedin User Orders - /api/v1/myorders
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

//Admin: Get All Orders - api/v1/orders
exports.orders = catchAsyncError(async (req, res) => {
    const orders = await Order.findAll({ order: [['id', 'DESC']] });
    const totalAmount = orders.reduce((acc, order) => acc + Number(order.totalPrice || 0), 0);

    res.status(200).json({
        success: true,
        totalAmount,
        orders: orders.map(serializeOrder)
    });
});

//Admin: Update Order / Order Status - api/v1/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Order has been already delivered!', 400));
    }

    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
    for (const orderItem of items) {
        await updateStock(orderItem.product, orderItem.quantity);
    }

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({
        success: true
    });
});

async function updateStock(productId, quantity) {
    const product = await Product.findByPk(productId);
    if (!product) return;
    product.stock = Number(product.stock) - Number(quantity);
    await product.save();
}

//Admin: Delete Order - api/v1/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404));
    }

    await order.destroy();
    res.status(200).json({
        success: true
    });
});
