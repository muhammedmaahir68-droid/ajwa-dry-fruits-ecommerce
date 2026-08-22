import React, { Fragment, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MetaData from '../layouts/MetaData';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PayrollList() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPayout, setTotalPayout] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('Inventory Specialist');
    const [department, setDepartment] = useState('Logistics & Stock');
    const [baseSalary, setBaseSalary] = useState('');
    const [allowances, setAllowances] = useState('0');
    const [deductions, setDeductions] = useState('0');
    const [paymentStatus, setPaymentStatus] = useState('Paid');
    const [monthYear, setMonthYear] = useState('July 2026');
    const [notes, setNotes] = useState('');

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/v1/admin/payrolls');
            setPayrolls(data.payrolls || []);
            setTotalPayout(data.totalPayout || 0);
            setTotalPending(data.totalPending || 0);
            setLoading(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load payroll records');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const handleCreatePayroll = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/v1/admin/payroll/new', {
                employeeName,
                email,
                designation,
                department,
                baseSalary: Number(baseSalary || 0),
                allowances: Number(allowances || 0),
                deductions: Number(deductions || 0),
                paymentStatus,
                monthYear,
                notes
            });
            if (data.success) {
                toast.success('Payroll record created successfully!');
                setShowModal(false);
                setEmployeeName('');
                setBaseSalary('');
                fetchPayrolls();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error creating payroll');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
        try {
            await axios.put(`/api/v1/admin/payroll/${id}`, { paymentStatus: nextStatus });
            toast.success(`Payroll status updated to ${nextStatus}`);
            fetchPayrolls();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
        try {
            await axios.delete(`/api/v1/admin/payroll/${id}`);
            toast.success('Payroll record deleted');
            fetchPayrolls();
        } catch (err) {
            toast.error('Failed to delete record');
        }
    };

    const computedNet = Math.max(0, (Number(baseSalary || 0) + Number(allowances || 0) - Number(deductions || 0)));

    return (
        <Fragment>
            <MetaData title={'Admin Payroll Management'} />
            <div className="ajwa-admin-page"><Sidebar /><div className="ajwa-admin-content">
                    
                    {/* Header Banner */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 p-3 bg-dark rounded-lg border border-warning shadow-lg">
                        <div>
                            <h2 className="my-0 font-weight-bold text-warning">
                                <i className="fa fa-money text-warning mr-2"></i> Staff Payroll Management
                            </h2>
                            <p className="text-light small m-0 opacity-75">
                                Manage employee disbursals, track monthly payouts, and issue salary records in Indian Rupees (₹).
                            </p>
                        </div>
                        <button className="btn btn-warning text-dark font-weight-bold px-4 py-2 shadow-lg" onClick={() => setShowModal(true)}>
                            + Add New Payroll
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-dark border border-warning rounded-lg p-3 shadow-lg h-100">
                                <div className="card-body p-2 text-center">
                                    <span className="small text-muted font-weight-bold text-uppercase d-block mb-1">Total Paid Out</span>
                                    <h3 className="text-success font-weight-bold m-0">
                                        ₹{totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-dark border border-warning rounded-lg p-3 shadow-lg h-100">
                                <div className="card-body p-2 text-center">
                                    <span className="small text-muted font-weight-bold text-uppercase d-block mb-1">Total Pending Salaries</span>
                                    <h3 className="text-warning font-weight-bold m-0">
                                        ₹{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-dark border border-warning rounded-lg p-3 shadow-lg h-100">
                                <div className="card-body p-2 text-center">
                                    <span className="small text-muted font-weight-bold text-uppercase d-block mb-1">Payroll Records</span>
                                    <h3 className="text-info font-weight-bold m-0">
                                        {payrolls.length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payroll Table */}
                    <div className="card bg-dark text-white border border-warning shadow-lg mb-4">
                        <div className="card-header bg-dark text-warning border-bottom border-warning font-weight-bold text-uppercase py-3">
                            <i className="fa fa-list-alt text-warning mr-2"></i> Employee Salary Disbursals (₹ INR)
                        </div>
                        <div className="card-body table-responsive bg-dark p-3">
                            {loading ? (
                                <p className="text-center text-warning">Loading payrolls...</p>
                            ) : (
                                <table className="table table-dark table-hover table-bordered align-middle">
                                    <thead className="thead-dark text-warning border-bottom border-warning">
                                        <tr>
                                            <th>Employee</th>
                                            <th>Designation</th>
                                            <th>Month/Year</th>
                                            <th>Base (₹)</th>
                                            <th>Allowances (₹)</th>
                                            <th>Deductions (₹)</th>
                                            <th>Net Salary (₹)</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrolls.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center py-4 text-light opacity-75">
                                                    No payroll records found. Click "+ Add New Payroll" to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            payrolls.map(p => (
                                                <tr key={p.id}>
                                                    <td className="font-weight-bold text-white">{p.employeeName}</td>
                                                    <td>
                                                        <span className="text-white font-weight-bold">{p.designation}</span><br />
                                                        <small className="text-warning opacity-75">{p.department}</small>
                                                    </td>
                                                    <td className="text-light">{p.monthYear}</td>
                                                    <td className="text-light">₹{Number(p.baseSalary).toFixed(2)}</td>
                                                    <td className="text-success font-weight-bold">+₹{Number(p.allowances).toFixed(2)}</td>
                                                    <td className="text-danger font-weight-bold">-₹{Number(p.deductions).toFixed(2)}</td>
                                                    <td className="font-weight-bold text-warning">₹{Number(p.netSalary).toFixed(2)}</td>
                                                    <td>
                                                        <span
                                                            className={`badge badge-${p.paymentStatus === 'Paid' ? 'success' : 'warning text-dark'} px-3 py-2 font-weight-bold style-pointer`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleStatusToggle(p.id, p.paymentStatus)}
                                                            title="Click to toggle status"
                                                        >
                                                            {p.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeletePayroll(p.id)}
                                                        >
                                                            <i className="fa fa-trash"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal - Styled for Cyber Gold Theme */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-warning shadow-2-strong">
                            <form onSubmit={handleCreatePayroll}>
                                <div className="modal-header bg-dark text-warning border-bottom border-warning">
                                    <h5 className="modal-title font-weight-bold text-warning">
                                        <i className="fa fa-plus-circle mr-2"></i> Issue New Employee Payroll (₹ INR)
                                    </h5>
                                    <button type="button" className="close text-warning opacity-100" onClick={() => setShowModal(false)}>
                                        &times;
                                    </button>
                                </div>
                                <div className="modal-body bg-dark text-white p-4">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-warning">Employee Name *</label>
                                            <input
                                                type="text"
                                                className="form-control text-white border-warning bg-secondary"
                                                value={employeeName}
                                                onChange={e => setEmployeeName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-warning">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control text-white border-warning bg-secondary"
                                                value={designation}
                                                onChange={e => setDesignation(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold text-warning">Base Salary (₹) *</label>
                                            <input
                                                type="number"
                                                className="form-control text-white font-weight-bold border-warning bg-secondary"
                                                value={baseSalary}
                                                onChange={e => setBaseSalary(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold text-success">Allowances (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control text-success font-weight-bold border-warning bg-secondary"
                                                value={allowances}
                                                onChange={e => setAllowances(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold text-danger">Deductions (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control text-danger font-weight-bold border-warning bg-secondary"
                                                value={deductions}
                                                onChange={e => setDeductions(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-warning">Month & Year</label>
                                            <input
                                                type="text"
                                                className="form-control text-white border-warning bg-secondary"
                                                value={monthYear}
                                                onChange={e => setMonthYear(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-warning">Payment Status</label>
                                            <select
                                                className="form-control text-white border-warning bg-secondary"
                                                value={paymentStatus}
                                                onChange={e => setPaymentStatus(e.target.value)}
                                            >
                                                <option value="Paid">Paid</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="p-3 bg-secondary rounded border border-warning text-center">
                                                <span className="text-light small text-uppercase font-weight-bold d-block">Computed Net Salary Payout</span>
                                                <h4 className="text-warning font-weight-bold m-0">₹{computedNet.toFixed(2)}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-dark border-top border-warning">
                                    <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-warning font-weight-bold text-dark px-4 shadow">Save Payroll</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
