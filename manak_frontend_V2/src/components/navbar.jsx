import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { CartContext } from "../context/cart";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "underline font-semibold"
      : "hover:underline";

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      {/* App Title */}
      <h1
        className="font-bold cursor-pointer"
        onClick={() => navigate(user?.role === "admin" ? "/admin" : "/products")}
      >
        MANAK ENTERPRISES
      </h1>

      {/* Right Side */}
      {user && (
        <div className="flex items-center gap-4 text-sm md:text-base">
          {/* CUSTOMER NAV */}
          {user.role === "shopkeeper" && (
            <>
              <NavLink to="/home" className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={linkClass}>
                All Products
              </NavLink>

              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>

              <NavLink to="/cart" className={linkClass}>
                Cart
                {cart.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </NavLink>
            </>
          )}

          {/* ADMIN NAV */}
          {user.role === "admin" && (
            <>
              <NavLink to="/admin" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/admin/products" className={linkClass}>
                Products
              </NavLink>

              <NavLink to="/admin/orders" className={linkClass}>
                Orders
              </NavLink>
            </>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
