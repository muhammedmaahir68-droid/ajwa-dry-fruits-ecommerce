const express = require('express');
const { 
    newOrder, 
    getSingleOrder, 
    myOrders, 
    cancelOrder,
    returnOrder,
    orders, 
    updateOrder, 
    deleteOrder,
    adminReturnAction
} = require('../controllers/orderController');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

// Customer & Shared Order Routes
router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/order/:id/cancel').put(isAuthenticatedUser, cancelOrder);
router.route('/order/:id/return').put(isAuthenticatedUser, returnOrder);
router.route('/myorders').get(isAuthenticatedUser, myOrders);

// Admin Order Management Routes
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), orders);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
router.route('/admin/order/:id/return-action').put(isAuthenticatedUser, authorizeRoles('admin'), adminReturnAction);

module.exports = router;
