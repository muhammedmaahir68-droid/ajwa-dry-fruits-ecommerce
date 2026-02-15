import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ADMIN_PASSWORD = "Maahir@2006";

export default function AdminAccess() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      toast.error("Invalid admin password", { position: toast.POSITION.BOTTOM_CENTER });
      return;
    }
    localStorage.setItem("ajwa_admin_access", "true");
    toast.success("Admin access granted", { position: toast.POSITION.BOTTOM_CENTER });
    navigate("/admin/control");
  };

  return (
    <div className="row wrapper my-5">
      <div className="col-10 col-lg-4">
        <form onSubmit={submitHandler} className="shadow-lg">
          <h1 className="mb-3">Admin Access</h1>
          <div className="form-group">
            <label htmlFor="admin_password_field">Password</label>
            <input
              id="admin_password_field"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button id="login_button" type="submit" className="btn btn-block py-3">
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}
