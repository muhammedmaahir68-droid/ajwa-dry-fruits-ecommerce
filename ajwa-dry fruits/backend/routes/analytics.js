const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const { getSalesAnalytics } = require('../controllers/analyticsController');

router.route('/admin/analytics').get(isAuthenticatedUser, authorizeRoles('admin'), getSalesAnalytics);

module.exports = router;
