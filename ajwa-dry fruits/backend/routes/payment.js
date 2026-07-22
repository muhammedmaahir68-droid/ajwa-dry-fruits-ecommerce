const express = require('express');
const { processPayment, sendStripeApi, getPaymentRedirect } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/payment/process').post( isAuthenticatedUser, processPayment);
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);
router.route('/payment/redirect/:method').get(getPaymentRedirect);


module.exports = router;
