const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const { getSalesAnalytics, resetDatabase } = require('../controllers/analyticsController');

router.route('/admin/analytics').get(isAuthenticatedUser, authorizeRoles('admin'), getSalesAnalytics);
router.route('/admin/reset-database').post(isAuthenticatedUser, authorizeRoles('admin'), resetDatabase);

module.exports = router;
