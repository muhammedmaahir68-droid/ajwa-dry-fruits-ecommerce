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
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="my-2 font-weight-bold text-dark">Staff Payroll Management</h1>
                        <button className="btn btn-primary font-weight-bold" onClick={() => setShowModal(true)}>
                            + Add New Payroll
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="row pr-4 mb-4">
                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-success o-hidden h-100 shadow">
                                <div className="card-body">
                                    <div className="text-center card-font-size">
                                        Total Paid Out<br />
                                        <b>${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-warning o-hidden h-100 shadow">
                                <div className="card-body">
                                    <div className="text-center card-font-size">
                                        Total Pending Salaries<br />
                                        <b>${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-sm-6 mb-3">
                            <div className="card text-white bg-info o-hidden h-100 shadow">
                                <div className="card-body">
                                    <div className="text-center card-font-size">
                                        Payroll Records<br />
                                        <b>{payrolls.length}</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payroll Table */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-light font-weight-bold text-uppercase">
                            Employee Salary Disbursals
                        </div>
                        <div className="card-body table-responsive">
                            {loading ? (
                                <p className="text-center">Loading payrolls...</p>
                            ) : (
                                <table className="table table-bordered table-striped align-middle">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Employee</th>
                                            <th>Designation</th>
                                            <th>Month/Year</th>
                                            <th>Base ($)</th>
                                            <th>Allowances ($)</th>
                                            <th>Deductions ($)</th>
                                            <th>Net Salary ($)</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrolls.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center py-3">No payroll records found. Click "+ Add New Payroll" to create one.</td>
                                            </tr>
                                        ) : (
                                            payrolls.map(p => (
                                                <tr key={p.id}>
                                                    <td className="font-weight-bold">{p.employeeName}</td>
                                                    <td>{p.designation} <br /><small className="text-muted">{p.department}</small></td>
                                                    <td>{p.monthYear}</td>
                                                    <td>${Number(p.baseSalary).toFixed(2)}</td>
                                                    <td className="text-success">+${Number(p.allowances).toFixed(2)}</td>
                                                    <td className="text-danger">-${Number(p.deductions).toFixed(2)}</td>
                                                    <td className="font-weight-bold text-primary">${Number(p.netSalary).toFixed(2)}</td>
                                                    <td>
                                                        <span
                                                            className={`badge badge-${p.paymentStatus === 'Paid' ? 'success' : 'warning'} px-2 py-1 style-pointer`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleStatusToggle(p.id, p.paymentStatus)}
                                                            title="Click to toggle status"
                                                        >
                                                            {p.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-danger ml-2"
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

            {/* Create Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleCreatePayroll}>
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title font-weight-bold">Issue New Employee Payroll</h5>
                                    <button type="button" className="close text-white" onClick={() => setShowModal(false)}>
                                        &times;
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold">Employee Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={employeeName}
                                                onChange={e => setEmployeeName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={designation}
                                                onChange={e => setDesignation(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold">Base Salary ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={baseSalary}
                                                onChange={e => setBaseSalary(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold">Allowances ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={allowances}
                                                onChange={e => setAllowances(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="font-weight-bold">Deductions ($)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={deductions}
                                                onChange={e => setDeductions(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold">Month & Year</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={monthYear}
                                                onChange={e => setMonthYear(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold">Payment Status</label>
                                            <select
                                                className="form-control"
                                                value={paymentStatus}
                                                onChange={e => setPaymentStatus(e.target.value)}
                                            >
                                                <option value="Paid">Paid</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="alert alert-info">
                                                Computed Net Salary Payout: <strong>${computedNet.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success font-weight-bold">Save Payroll</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
