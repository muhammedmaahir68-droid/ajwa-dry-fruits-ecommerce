import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminControl() {
  const { products = [] } = useSelector((state) => state.productsState || {});
  const { adminOrders = [] } = useSelector((state) => state.orderState || {});
  const { users = [] } = useSelector((state) => state.userState || {});
  const [resetting, setResetting] = useState(false);

  const handleFreshReset = async () => {
    if (window.confirm('⚠️ ARE YOU SURE? This will clear test orders, backlogs, and test payroll records to start 100% fresh for live usage.')) {
      try {
        setResetting(true);
        const { data } = await axios.post('/api/v1/admin/reset-database');
        toast.success(data.message || 'Database backlogs wiped for a fresh live start!', { position: 'bottom-center' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error('Error clearing database backlogs', { position: 'bottom-center' });
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12 col-md-4 col-lg-3 mb-4">
          <Sidebar />
        </div>

        <main className="col-12 col-md-8 col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 p-3 bg-dark rounded-lg border border-warning shadow-lg">
            <div>
              <h3 className="mb-0 text-warning font-weight-bold">
                <i className="fa fa-cogs mr-2"></i> AJWA SYSTEM CONTROL CENTER
              </h3>
              <p className="text-light small m-0 opacity-75">
                Manage live payment gateways, clean backlogs, and oversee store operations.
              </p>
            </div>
            <button
              onClick={handleFreshReset}
              disabled={resetting}
              className="btn btn-outline-danger font-weight-bold"
            >
              <i className="fa fa-trash mr-1"></i> {resetting ? 'RESETTING...' : 'WIPE BACKLOGS (FRESH START)'}
            </button>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-warning p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">CUSTOMER MANAGEMENT</h6>
                <p className="lead mb-3">Active Users: {users.length}</p>
                <Link to="/admin/users" className="btn btn-warning btn-sm font-weight-bold text-dark">Manage Users</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-warning p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">ORDERS REPORT</h6>
                <p className="lead mb-3">Total Orders: {adminOrders.length}</p>
                <Link to="/admin/orders" className="btn btn-warning btn-sm font-weight-bold text-dark">View Orders</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-warning p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">PRODUCT INVENTORY</h6>
                <p className="lead mb-3">Total Products: {products.length}</p>
                <Link to="/admin/products" className="btn btn-warning btn-sm font-weight-bold text-dark">Manage Products</Link>
              </div>
            </div>
          </div>

          {/* Razorpay Gateway Status Panel */}
          <div className="card bg-dark text-white border border-warning p-4 shadow-lg mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-warning font-weight-bold m-0">
                <i className="fa fa-bolt text-warning mr-2"></i> Razorpay Payment Gateway Live Status
              </h5>
              <span className="badge badge-success px-3 py-2 font-weight-bold">ACTIVE & READY</span>
            </div>
            <p className="text-light small mb-3">
              Razorpay Payment Gateway is configured to receive live customer payments via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
            </p>
            <div className="row">
              <div className="col-md-6 mb-2">
                <small className="text-warning font-weight-bold d-block">Razorpay Key ID Status:</small>
                <code className="text-light bg-secondary p-1 rounded small d-block">Configured in backend/config/config.env</code>
              </div>
              <div className="col-md-6 mb-2">
                <small className="text-warning font-weight-bold d-block">Supported Payment Options:</small>
                <span className="badge badge-warning text-dark font-weight-bold mr-1">UPI</span>
                <span className="badge badge-warning text-dark font-weight-bold mr-1">Cards</span>
                <span className="badge badge-warning text-dark font-weight-bold mr-1">NetBanking</span>
                <span className="badge badge-warning text-dark font-weight-bold">Wallets</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
