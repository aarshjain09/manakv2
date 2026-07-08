import {
  LayoutDashboard,
  Building2,
  Tags,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  // ==========================================
  // LOGOUT
  // ==========================================
const handleLogout = () => {
  // Remove stored authentication
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Remove token from Axios instance if it is stored there

  // Full reload to login page at "/"
  window.location.replace("/");
};
 
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-sidebar text-white shadow-xl">

      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">
            MANAK
          </h1>

          <p className="text-xs text-slate-400 text-center">
            Distributor Management System
          </p>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-80px)] px-4 py-6">

        {/* Dashboard */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        {/* Masters */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Masters
        </div>

        <NavLink
          to="/admin/companies"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <Building2 size={20} />
          Companies
        </NavLink>

        <NavLink
          to="/admin/brands"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <Tags size={20} />
          Brands
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <FolderTree size={20} />
          Categories
        </NavLink>

        {/* Inventory */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Inventory
        </div>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <Package size={20} />
          Products
        </NavLink>

        {/* Sales */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Sales
        </div>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <Users size={20} />
          Customers
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <ShoppingCart size={20} />
          Orders
        </NavLink>

        {/* Reports */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Analytics
        </div>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <BarChart3 size={20} />
          Reports
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
            ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-10 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>
    </aside>
  );
}