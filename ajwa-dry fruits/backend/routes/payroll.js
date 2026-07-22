const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const {
    getPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll
} = require('../controllers/payrollController');

router.route('/admin/payrolls').get(isAuthenticatedUser, authorizeRoles('admin'), getPayrolls);
router.route('/admin/payroll/new').post(isAuthenticatedUser, authorizeRoles('admin'), createPayroll);
router.route('/admin/payroll/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updatePayroll)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deletePayroll);

module.exports = router;
