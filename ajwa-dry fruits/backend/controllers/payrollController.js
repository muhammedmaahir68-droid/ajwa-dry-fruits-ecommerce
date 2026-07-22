const catchAsyncError = require('../middlewares/catchAsyncError');
const Payroll = require('../models/payrollModel');
const ErrorHandler = require('../utils/errorHandler');

// Get all payrolls - /api/v1/admin/payrolls
exports.getPayrolls = catchAsyncError(async (req, res, next) => {
    const payrolls = await Payroll.findAll({
        order: [['createdAt', 'DESC']]
    });

    let totalPayout = 0;
    let totalPending = 0;

    payrolls.forEach(p => {
        if (p.paymentStatus === 'Paid') {
            totalPayout += Number(p.netSalary || 0);
        } else {
            totalPending += Number(p.netSalary || 0);
        }
    });

    res.status(200).json({
        success: true,
        count: payrolls.length,
        totalPayout,
        totalPending,
        payrolls
    });
});

// Create new payroll - /api/v1/admin/payroll/new
exports.createPayroll = catchAsyncError(async (req, res, next) => {
    const { employeeName, email, designation, department, baseSalary, allowances, deductions, paymentStatus, payDate, monthYear, notes } = req.body;

    if (!employeeName) {
        return next(new ErrorHandler('Employee name is required', 400));
    }

    const base = Number(baseSalary || 0);
    const allow = Number(allowances || 0);
    const ded = Number(deductions || 0);
    const netSalary = Math.max(0, base + allow - ded);

    const payroll = await Payroll.create({
        employeeName,
        email,
        designation: designation || 'Staff',
        department: department || 'General',
        baseSalary: base,
        allowances: allow,
        deductions: ded,
        netSalary,
        paymentStatus: paymentStatus || 'Pending',
        payDate: payDate || new Date().toISOString().split('T')[0],
        monthYear: monthYear || 'July 2026',
        notes
    });

    res.status(201).json({
        success: true,
        payroll
    });
});

// Update payroll - /api/v1/admin/payroll/:id
exports.updatePayroll = catchAsyncError(async (req, res, next) => {
    let payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
        return next(new ErrorHandler('Payroll record not found', 404));
    }

    const base = req.body.baseSalary !== undefined ? Number(req.body.baseSalary) : payroll.baseSalary;
    const allow = req.body.allowances !== undefined ? Number(req.body.allowances) : payroll.allowances;
    const ded = req.body.deductions !== undefined ? Number(req.body.deductions) : payroll.deductions;
    const netSalary = Math.max(0, base + allow - ded);

    await payroll.update({
        ...req.body,
        baseSalary: base,
        allowances: allow,
        deductions: ded,
        netSalary
    });

    res.status(200).json({
        success: true,
        payroll
    });
});

// Delete payroll - /api/v1/admin/payroll/:id
exports.deletePayroll = catchAsyncError(async (req, res, next) => {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
        return next(new ErrorHandler('Payroll record not found', 404));
    }

    await payroll.destroy();

    res.status(200).json({
        success: true,
        message: 'Payroll record deleted successfully'
    });
});
