import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminControl() {
  const navigate = useNavigate();
  const { products = [] } = useSelector((state) => state.productsState);
  const { adminOrders = [] } = useSelector((state) => state.orderState);
  const { users = [] } = useSelector((state) => state.userState);

  const clearAdminAccess = () => {
    localStorage.removeItem("ajwa_admin_access");
    navigate("/");
  };

  return (
    <div className="admin-control-page container-fluid py-4">
      <div className="row">
        <aside className="col-12 col-md-3 col-lg-2 mb-3">
          <div className="admin-control-sidebar">
            <h5 className="mb-3">Dashimag</h5>
            <Link to="/admin/dashboard" className="admin-control-link">Dashboard</Link>
            <Link to="/admin/products" className="admin-control-link">Product Report</Link>
            <Link to="/admin/orders" className="admin-control-link">Sales Status</Link>
            <Link to="/admin/products/create" className="admin-control-link">Add Product</Link>
            <Link to="/admin/products" className="admin-control-link">Apply Discount</Link>
            <Link to="/admin/users" className="admin-control-link">Customer Management</Link>
            <Link to="/admin/reviews" className="admin-control-link">Settings</Link>
            <button type="button" className="btn btn-sm btn-outline-light mt-3" onClick={clearAdminAccess}>
              Exit Admin
            </button>
          </div>
        </aside>

        <main className="col-12 col-md-9 col-lg-10">
          <div className="admin-control-head mb-3">
            <h3 className="mb-0">AJWA ADMIN DASHBOARD</h3>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="admin-card">
                <h6>LOGIN REPORTS</h6>
                <p>Active Users: {users.length}</p>
                <Link to="/admin/users">Manage Users</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="admin-card">
                <h6>ORDERS REPORT</h6>
                <p>Total Orders: {adminOrders.length}</p>
                <Link to="/admin/orders">View Orders</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="admin-card">
                <h6>PRODUCT MANAGEMENT</h6>
                <p>Total Products: {products.length}</p>
                <Link to="/admin/products">Manage Products</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
