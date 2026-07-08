import { NavLink } from "react-router-dom";

export default function AdminNav() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "underline font-semibold"
      : "hover:underline";

  return (
    <div className="bg-gray-800 text-white p-3 flex gap-6">
      <NavLink to="/admin" className={linkClass}>
        Dashboard
      </NavLink>

      <NavLink to="/admin/companies" className={linkClass}>
        Companies
      </NavLink>

      <NavLink to="/admin/products" className={linkClass}>
        Products
      </NavLink>

      <NavLink to="/admin/orders" className={linkClass}>
        Orders
      </NavLink>

      <NavLink to="/admin/users" className={linkClass}>
        Users
      </NavLink>
    </div>
  );
}
