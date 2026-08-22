const express = require('express');
const {
    processPayment,
    sendStripeApi,
    sendRazorpayApi,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentRedirect
} = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/payment/process').post(isAuthenticatedUser, processPayment);
router.route('/stripeapi').get(isAuthenticatedUser, sendStripeApi);

// Razorpay Payment Routes
router.route('/razorpayapi').get(isAuthenticatedUser, sendRazorpayApi);
router.route('/payment/razorpay/order').post(isAuthenticatedUser, createRazorpayOrder);
router.route('/payment/razorpay/verify').post(isAuthenticatedUser, verifyRazorpayPayment);

router.route('/payment/redirect/:method').get(getPaymentRedirect);

module.exports = router;
