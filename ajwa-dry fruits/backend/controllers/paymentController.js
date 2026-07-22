const catchAsyncError = require('../middlewares/catchAsyncError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.processPayment  = catchAsyncError(async(req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        description: "TEST PAYMENT",
        metadata: { integration_check: "accept_payment"},
        shipping: req.body.shipping
    })

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
})

exports.sendStripeApi  = catchAsyncError(async(req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})

exports.getPaymentRedirect = catchAsyncError(async (req, res) => {
    const method = String(req.params.method || '').toLowerCase();
    const urls = {
        upi: process.env.UPI_PAYMENT_URL || 'https://pay.google.com/',
        card: process.env.CARD_PAYMENT_URL || 'https://dashboard.stripe.com/test/payments',
        netbanking: process.env.NETBANKING_PAYMENT_URL || 'https://retail.onlinesbi.sbi/retail/login.htm'
    };
    const url = urls[method] || urls.card;

    res.status(200).json({
        success: true,
        method,
        url
    });
});
