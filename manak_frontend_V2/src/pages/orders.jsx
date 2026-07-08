import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ClipboardList,
  Search,
  Eye,
  CalendarDays,
  IndianRupee,
  PackageCheck,
  Clock3,
  Truck,
  Package,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";

import API from "../services/api";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ==========================================
  // LOAD ORDERS
  // ==========================================
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/orders");

      const data =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

      setOrders(data);
    } catch (err) {
      console.error(
        "Failed to load orders:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load orders"
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ==========================================
  // FILTER ORDERS
  // ==========================================
  const visibleOrders =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      let result = [...orders];

      // STATUS FILTER
      if (statusFilter !== "all") {
        result = result.filter(
          (order) =>
            String(
              order.status || ""
            ).toLowerCase() ===
            statusFilter
        );
      }

      // SEARCH
      if (keyword) {
        result = result.filter(
          (order) => {
            const searchableText = [
              order._id,
              order.status,
              order.orderSource,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              keyword
            );
          }
        );
      }

      // NEWEST FIRST
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

      return result;
    }, [
      orders,
      search,
      statusFilter,
    ]);

  // ==========================================
  // ORDER STATS
  // ==========================================
  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          String(
            order.status || ""
          ).toLowerCase() === "pending"
      ).length,

      packed: orders.filter(
        (order) =>
          String(
            order.status || ""
          ).toLowerCase() === "packed"
      ).length,

      delivered: orders.filter(
        (order) =>
          String(
            order.status || ""
          ).toLowerCase() ===
          "delivered"
      ).length,
    };
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          PAGE HEADER
      ===================================== */}
      <section className="mb-5 sm:mb-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Order History
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track and review your previous
              orders
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </section>

      {/* =====================================
          STATS
      ===================================== */}
      {!loading && !error && (
        <section className="mb-5 grid grid-cols-2 gap-3 sm:mb-7 lg:grid-cols-4">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={ClipboardList}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock3}
          />

          <StatCard
            label="Packed"
            value={stats.packed}
            icon={PackageCheck}
          />

          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={Truck}
          />
        </section>
      )}

      {/* =====================================
          SEARCH + FILTER
      ===================================== */}
      {!loading &&
        !error &&
        orders.length > 0 && (
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search by order ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary sm:w-48"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="packed">
                  Packed
                </option>

                <option value="delivered">
                  Delivered
                </option>
              </select>
            </div>
          </section>
        )}

      {/* =====================================
          LOADING
      ===================================== */}
      {loading && (
        <OrderSkeletonList />
      )}

      {/* =====================================
          ERROR
      ===================================== */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-14 text-center">
          <ClipboardList
            size={36}
            className="mx-auto text-red-300"
          />

          <h2 className="mt-4 text-lg font-bold text-red-900">
            Could not load orders
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadOrders}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================
          NO ORDERS
      ===================================== */}
      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardList
                size={30}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Your placed orders will appear
              here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Products
            </button>
          </div>
        )}

      {/* =====================================
          NO FILTER RESULTS
      ===================================== */}
      {!loading &&
        !error &&
        orders.length > 0 &&
        visibleOrders.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <Search
              size={30}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              No matching orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* =====================================
          ORDER LIST
      ===================================== */}
      {!loading &&
        !error &&
        visibleOrders.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {visibleOrders.map(
              (order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onView={() =>
                    navigate(
                      `/orders/${order._id}`
                    )
                  }
                />
              )
            )}
          </div>
        )}

      <div className="h-8 sm:h-12" />
    </div>
  );
}

// ==========================================
// ORDER CARD
// ==========================================
function OrderCard({
  order,
  onView,
}) {
  const itemCount =
    Array.isArray(order.items)
      ? order.items.length
      : 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-primary/20 hover:shadow-md">
      {/* TOP */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Order
            </p>

            <StatusBadge
              status={order.status}
            />
          </div>

          <h2 className="mt-1 truncate font-bold text-slate-950 sm:text-lg">
            #{shortOrderId(order._id)}
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {formatDateTime(
              order.createdAt
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onView}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition group-hover:border-primary group-hover:bg-primary group-hover:text-white sm:hidden"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <OrderInfo
          icon={CalendarDays}
          label="Order Date"
          value={formatDate(
            order.createdAt
          )}
        />

        <OrderInfo
          icon={Package}
          label="Items"
          value={`${itemCount} ${
            itemCount === 1
              ? "item"
              : "items"
          }`}
        />

        <OrderInfo
          icon={IndianRupee}
          label="Order Total"
          value={formatMoney(
            order.totalAmount
          )}
          highlight
        />
      </div>

      {/* ACTION */}
      <div className="hidden border-t border-slate-100 px-5 py-3 sm:flex sm:justify-end">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
        >
          <Eye size={16} />
          View Order
        </button>
      </div>
    </article>
  );
}

// ==========================================
// STAT CARD
// ==========================================
function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ORDER INFO
// ==========================================
function OrderInfo({
  icon: Icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={14} />

        <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 truncate text-sm font-semibold sm:text-base ${
          highlight
            ? "text-primary"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================
function StatusBadge({ status }) {
  const normalized = String(
    status || "pending"
  ).toLowerCase();

  const styles = {
    pending:
      "bg-amber-50 text-amber-700 ring-amber-200",

    packed:
      "bg-blue-50 text-blue-700 ring-blue-200",

    delivered:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",

    cancelled:
      "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ring-inset sm:text-xs ${
        styles[normalized] ||
        "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {normalized}
    </span>
  );
}

// ==========================================
// SKELETON
// ==========================================
function OrderSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="space-y-3 border-b border-slate-100 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((__, i) => (
              <div
                key={i}
                className="space-y-2"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================
function shortOrderId(id) {
  if (!id) return "N/A";

  return String(id)
    .slice(-8)
    .toUpperCase();
}

function formatMoney(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(
    value
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Date(
    value
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}