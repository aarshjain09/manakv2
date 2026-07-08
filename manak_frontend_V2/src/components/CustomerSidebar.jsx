import {
  Home,
  Package,
  Grid3X3,
  Tags,
  ShoppingCart,
  ClipboardList,
  User,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import API from "../services/api";

export default function CustomerSidebar({
  mobile = false,
  onClose,
}) {
  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete API.defaults.headers.common
      .Authorization;

    window.location.replace("/");
  };

  // ==========================================
  // CLOSE MOBILE DRAWER AFTER CLICK
  // ==========================================
  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
      isActive
        ? "bg-primary text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="h-screen w-72 max-w-full bg-sidebar text-white shadow-xl flex flex-col">
      {/* LOGO */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">
            MANAK
          </h1>

          <p className="text-xs text-slate-400">
            Distributor Store
          </p>
        </div>

        {/* MOBILE CLOSE */}
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* SHOPPING */}
        <div className="mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Shop
        </div>

        <NavLink
          to="/home"
          onClick={handleNavClick}
          className={navClass}
        >
          <Home size={20} />
          Home
        </NavLink>

        <NavLink
          to="/products"
          onClick={handleNavClick}
          className={navClass}
        >
          <Package size={20} />
          All Products
        </NavLink>

        <NavLink
          to="/categories"
          onClick={handleNavClick}
          className={navClass}
        >
          <Grid3X3 size={20} />
          Categories
        </NavLink>

        <NavLink
          to="/brands"
          onClick={handleNavClick}
          className={navClass}
        >
          <Tags size={20} />
          Brands
        </NavLink>

        {/* ORDERS */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Orders
        </div>

        <NavLink
          to="/cart"
          onClick={handleNavClick}
          className={navClass}
        >
          <ShoppingCart size={20} />
          Cart
        </NavLink>

        <NavLink
          to="/orders"
          onClick={handleNavClick}
          className={navClass}
        >
          <ClipboardList size={20} />
          My Orders
        </NavLink>

        {/* ACCOUNT */}
        <div className="mt-8 mb-3 px-4 text-xs uppercase tracking-widest text-slate-500">
          Account
        </div>

        <NavLink
          to="/profile"
          onClick={handleNavClick}
          className={navClass}
        >
          <User size={20} />
          Profile
        </NavLink>
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}