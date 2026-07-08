import {
  ArrowLeft,
  Menu,
  ShoppingCart,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useContext } from "react";

import { CartContext } from "../context/cart";

export default function CustomerHeader({
  onMenuClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cart = [],
    cartCount,
  } = useContext(CartContext);

  // ==========================================
  // PAGE CONFIGURATION
  // ==========================================
  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/home") {
      return {
        title: "Home",
        subtitle: "Distributor Store",
        showBack: false,
      };
    }

    if (path === "/products") {
      return {
        title: "All Products",
        subtitle: "Browse Catalogue",
        showBack: false,
      };
    }

    if (path === "/categories") {
      return {
        title: "Categories",
        subtitle: "Browse Catalogue",
        showBack: false,
      };
    }

    if (
      path.startsWith("/categories/")
    ) {
      return {
        title: "Category Products",
        subtitle: "Browse Products",
        showBack: true,
      };
    }

    if (
      path.startsWith("/company/")
    ) {
      return {
        title: "Company",
        subtitle: "Browse Brands",
        showBack: true,
      };
    }

    if (path === "/brands") {
      return {
        title: "Brands",
        subtitle: "Browse Catalogue",
        showBack: false,
      };
    }

    if (
      path.startsWith("/brand/") &&
      path.endsWith("/categories")
    ) {
      return {
        title: "Brand Categories",
        subtitle: "Browse Categories",
        showBack: true,
      };
    }

    if (
      path.startsWith("/brands/")
    ) {
      return {
        title: "Brand Products",
        subtitle: "Browse Products",
        showBack: true,
      };
    }

    if (path === "/cart") {
      return {
        title: "Your Cart",
        subtitle: "Review Order",
        showBack: false,
      };
    }

    if (path === "/orders") {
      return {
        title: "My Orders",
        subtitle: "Order History",
        showBack: false,
      };
    }

    if (
      path.startsWith("/orders/")
    ) {
      return {
        title: "Order Details",
        subtitle: "View Order",
        showBack: true,
      };
    }

    if (path === "/profile") {
      return {
        title: "Profile",
        subtitle: "Account",
        showBack: false,
      };
    }

    return {
      title: "MANAK",
      subtitle: "Distributor Store",
      showBack: false,
    };
  };

  const pageInfo = getPageInfo();

  const count =
    cartCount ?? cart.length;

  // ==========================================
  // BACK
  // ==========================================
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-3 sm:px-5 lg:h-[72px] lg:px-8">
        {/* =====================================
            LEFT
        ===================================== */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* BACK BUTTON */}
          {pageInfo.showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-700
                shadow-sm
                transition
                hover:border-primary/30
                hover:bg-slate-50
                hover:text-primary
              "
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            /* MOBILE MENU */
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                text-slate-700
                transition
                hover:bg-slate-100
                lg:hidden
              "
            >
              <Menu size={23} />
            </button>
          )}

          {/* PAGE TITLE */}
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
              {pageInfo.title}
            </h1>

            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* =====================================
            RIGHT
        ===================================== */}
        <div className="flex items-center gap-2">
          {/* CART */}
          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            aria-label="Open cart"
            className="
              group relative
              flex h-10 items-center gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-2.5
              text-slate-700
              shadow-sm
              transition
              hover:border-primary/30
              hover:text-primary
              sm:px-3
            "
          >
            <ShoppingCart
              size={21}
              className="transition group-hover:scale-105"
            />

            <span className="hidden text-sm font-semibold sm:inline">
              Cart
            </span>

            {count > 0 && (
              <span
                className="
                  absolute
                  -right-1.5
                  -top-1.5
                  flex h-5 min-w-5
                  items-center justify-center
                  rounded-full
                  bg-primary
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                {count > 99
                  ? "99+"
                  : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}