import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function AdminControl() {
  const { products = [] } = useSelector((state) => state.productsState);
  const { adminOrders = [] } = useSelector((state) => state.orderState);
  const { users = [] } = useSelector((state) => state.userState);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12 col-md-4 col-lg-3 mb-4">
          <Sidebar />
        </div>

        <main className="col-12 col-md-8 col-lg-9">
          <div className="admin-control-head mb-4">
            <h3 className="mb-0 text-warning font-weight-bold">AJWA SYSTEM CONTROL CENTER</h3>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-secondary p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">CUSTOMER MANAGEMENT</h6>
                <p className="lead mb-3">Active Users: {users.length}</p>
                <Link to="/admin/users" className="btn btn-warning btn-sm font-weight-bold">Manage Users</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-secondary p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">ORDERS REPORT</h6>
                <p className="lead mb-3">Total Orders: {adminOrders.length}</p>
                <Link to="/admin/orders" className="btn btn-warning btn-sm font-weight-bold">View Orders</Link>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-dark text-white border border-secondary p-4 shadow-lg h-100">
                <h6 className="text-warning font-weight-bold">PRODUCT INVENTORY</h6>
                <p className="lead mb-3">Total Products: {products.length}</p>
                <Link to="/admin/products" className="btn btn-warning btn-sm font-weight-bold">Manage Products</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
