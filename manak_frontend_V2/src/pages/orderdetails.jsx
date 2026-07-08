import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Printer,
  ClipboardList,
  CalendarDays,
  Package,
  IndianRupee,
  Store,
  User,
  Phone,
  MapPin,
  Hash,
  RefreshCw,
  Truck,
  PackageCheck,
  Clock3,
} from "lucide-react";

import API from "../services/api";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD ORDER
  // ==========================================
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(
        `/orders/view/${id}`
      );

      setOrder(
        res.data?.order ||
          res.data?.data ||
          res.data ||
          null
      );
    } catch (err) {
      console.error(
        "Failed to load order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load order details"
      );

      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  // ==========================================
  // ITEMS
  // ==========================================
  const items = useMemo(() => {
    return Array.isArray(order?.items)
      ? order.items
      : [];
  }, [order]);

  // ==========================================
  // PRINT
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-16 text-center">
          <ClipboardList
            size={38}
            className="mx-auto text-red-300"
          />

          <h1 className="mt-4 text-lg font-bold text-red-900">
            Could not load order
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error ||
              "Order not found"}
          </p>

          <button
            type="button"
            onClick={loadOrder}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const customer =
    order.user ||
    order.customer ||
    {};

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* =====================================
          SCREEN ACTION BAR
      ===================================== */}
      <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary"
        >
          <Printer size={17} />
          Print Order
        </button>
      </div>

      {/* =====================================
          SCREEN PAGE HEADER
      ===================================== */}
      <section className="no-print mb-5 sm:mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Order Details
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Order #
            {shortOrderId(order._id)}
          </h1>

          <StatusBadge
            status={order.status}
          />
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Placed on{" "}
          {formatDateTime(
            order.createdAt
          )}
        </p>
      </section>

      {/* =====================================
          SCREEN VIEW
      ===================================== */}
      <div className="no-print space-y-5">
        {/* SUMMARY */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={CalendarDays}
            label="Order Date"
            value={formatDate(
              order.createdAt
            )}
          />

          <SummaryCard
            icon={Package}
            label="Items"
            value={`${items.length} ${
              items.length === 1
                ? "item"
                : "items"
            }`}
          />

          <SummaryCard
            icon={getStatusIcon(
              order.status
            )}
            label="Status"
            value={capitalize(
              order.status
            )}
          />

          <SummaryCard
            icon={IndianRupee}
            label="Order Total"
            value={formatMoney(
              order.totalAmount
            )}
            highlight
          />
        </section>

        {/* CUSTOMER DETAILS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Customer Details
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={Store}
              label="Shop Name"
              value={
                customer.shopName ||
                "N/A"
              }
            />

            <DetailItem
              icon={User}
              label="Owner Name"
              value={
                customer.ownerName ||
                "N/A"
              }
            />

            <DetailItem
              icon={Hash}
              label="Customer Code"
              value={
                customer.customerCode ||
                "N/A"
              }
            />

            <DetailItem
              icon={Phone}
              label="Phone"
              value={
                customer.phone ||
                "N/A"
              }
            />

            <DetailItem
              icon={MapPin}
              label="Address"
              value={
                formatAddress(
                  customer.address
                )
              }
            />
          </div>
        </section>

        {/* ITEMS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-slate-950">
              Order Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Products included in this
              order
            </p>
          </div>

          {/* MOBILE ITEMS */}
          <div className="divide-y divide-slate-100 md:hidden">
            {items.map(
              (item, index) => (
                <MobileItemCard
                  key={
                    item._id ||
                    index
                  }
                  item={item}
                  index={index}
                />
              )
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <OrderItemsTable
              items={items}
            />
          </div>

          {/* TOTAL */}
          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-5 sm:px-6">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-600">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-slate-950 sm:text-2xl">
                  {formatMoney(
                    order.totalAmount
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================
          DEDICATED PRINT DOCUMENT
      ===================================== */}
      <PrintableOrder
        order={order}
        items={items}
        customer={customer}
      />

      <div className="no-print h-10" />
    </div>
  );
}

// ==========================================
// PRINTABLE ORDER
// ==========================================
function PrintableOrder({
  order,
  items,
  customer,
}) {
  return (
    <div className="print-order-sheet">
      {/* PRINT HEADER */}
      <header className="print-header">
        <div>
          <h1>MANAK</h1>
          <p>Distributor Store</p>
        </div>

        <div className="print-title">
          <h2>ORDER DOCUMENT</h2>

          <p>
            Order #
            {shortOrderId(order._id)}
          </p>
        </div>
      </header>

      {/* META */}
      <section className="print-meta-grid print-avoid-break">
        <div>
          <span>Order ID</span>
          <strong>
            {order._id || "N/A"}
          </strong>
        </div>

        <div>
          <span>Order Date</span>
          <strong>
            {formatDateTime(
              order.createdAt
            )}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>
            {capitalize(
              order.status
            )}
          </strong>
        </div>

        <div>
          <span>Order Source</span>
          <strong>
            {formatOrderSource(
              order.orderSource
            )}
          </strong>
        </div>
      </section>

      {/* CUSTOMER */}
      <section className="print-section print-avoid-break">
        <h3>Customer Details</h3>

        <div className="print-customer-grid">
          <div>
            <span>Shop Name</span>
            <strong>
              {customer.shopName ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>Owner Name</span>
            <strong>
              {customer.ownerName ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>Customer Code</span>
            <strong>
              {customer.customerCode ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>
              {customer.phone ||
                "N/A"}
            </strong>
          </div>

          <div className="print-full-width">
            <span>Address</span>
            <strong>
              {formatAddress(
                customer.address
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* ITEMS */}
      <section className="print-section">
        <h3>Order Items</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Code</th>
              <th>Boxes</th>
              <th>Pieces</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {items.map(
              (item, index) => {
                const product =
                  item.product || {};

                return (
                  <tr
                    key={
                      item._id ||
                      index
                    }
                  >
                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {product.name ||
                        item.productName ||
                        "Product"}
                    </td>

                    <td>
                      {product.productCode ||
                        item.productCode ||
                        "-"}
                    </td>

                    <td>
                      {Number(
                        item.boxes || 0
                      )}
                    </td>

                    <td>
                      {Number(
                        item.pieces || 0
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        getItemRate(item)
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        getItemAmount(item)
                      )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </section>

      {/* TOTAL */}
      <section className="print-total print-avoid-break">
        <span>Grand Total</span>

        <strong>
          {formatMoney(
            order.totalAmount
          )}
        </strong>
      </section>

      {/* FOOTER */}
      <footer className="print-footer">
        <p>
          Computer-generated order document.
          No signature required.
        </p>
      </footer>
    </div>
  );
}

// ==========================================
// DESKTOP TABLE
// ==========================================
function OrderItemsTable({ items }) {
  return (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="bg-slate-50 text-left">
          <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            #
          </th>

          <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Product
          </th>

          <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Code
          </th>

          <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
            Boxes
          </th>

          <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
            Pieces
          </th>

          <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
            Rate
          </th>

          <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
            Amount
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {items.map(
          (item, index) => {
            const product =
              item.product || {};

            return (
              <tr
                key={
                  item._id ||
                  index
                }
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 text-sm text-slate-500">
                  {index + 1}
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {product.name ||
                      item.productName ||
                      "Product"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {product.productCode ||
                    item.productCode ||
                    "-"}
                </td>

                <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                  {Number(
                    item.boxes || 0
                  )}
                </td>

                <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                  {Number(
                    item.pieces || 0
                  )}
                </td>

                <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                  {formatMoney(
                    getItemRate(item)
                  )}
                </td>

                <td className="px-5 py-4 text-right font-bold text-slate-900">
                  {formatMoney(
                    getItemAmount(item)
                  )}
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}

// ==========================================
// MOBILE ITEM
// ==========================================
function MobileItemCard({
  item,
  index,
}) {
  const product =
    item.product || {};

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">
            {product.name ||
              item.productName ||
              "Product"}
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            Code:{" "}
            {product.productCode ||
              item.productCode ||
              "-"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <MiniValue
          label="Boxes"
          value={Number(
            item.boxes || 0
          )}
        />

        <MiniValue
          label="Pieces"
          value={Number(
            item.pieces || 0
          )}
        />

        <MiniValue
          label="Rate"
          value={formatMoney(
            getItemRate(item)
          )}
        />

        <MiniValue
          label="Amount"
          value={formatMoney(
            getItemAmount(item)
          )}
          highlight
        />
      </div>
    </div>
  );
}

function MiniValue({
  label,
  value,
  highlight = false,
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${
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
// SUMMARY CARD
// ==========================================
function SummaryCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={16} />

        <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 truncate text-sm font-bold sm:text-base ${
          highlight
            ? "text-primary"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ==========================================
// DETAIL ITEM
// ==========================================
function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// STATUS
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset ${
        styles[normalized] ||
        "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {normalized}
    </span>
  );
}

function getStatusIcon(status) {
  const normalized = String(
    status || ""
  ).toLowerCase();

  if (normalized === "delivered") {
    return Truck;
  }

  if (normalized === "packed") {
    return PackageCheck;
  }

  return Clock3;
}

// ==========================================
// SKELETON
// ==========================================
function OrderDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />

      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />

      <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
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

function capitalize(value) {
  if (!value) return "N/A";

  const text = String(value);

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

function formatOrderSource(value) {
  if (!value) return "N/A";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatAddress(address) {
  if (!address) return "N/A";

  if (typeof address === "string") {
    return address;
  }

  if (typeof address === "object") {
    return Object.values(address)
      .filter(Boolean)
      .join(", ");
  }

  return "N/A";
}

function getItemRate(item) {
  return Number(
    item.pricePerPiece ??
      item.rate ??
      item.price ??
      item.product?.pricePerPiece ??
      0
  );
}

function getItemAmount(item) {
  if (
    item.amount !== undefined &&
    item.amount !== null
  ) {
    return Number(item.amount);
  }

  if (
    item.total !== undefined &&
    item.total !== null
  ) {
    return Number(item.total);
  }

  const boxes = Number(
    item.boxes || 0
  );

  const pieces = Number(
    item.pieces || 0
  );

  const pieceRate = Number(
    item.pricePerPiece ??
      item.rate ??
      item.price ??
      item.product?.pricePerPiece ??
      0
  );

  const boxRate = Number(
    item.boxPrice ??
      item.product?.boxPrice ??
      0
  );

  return (
    boxes * boxRate +
    pieces * pieceRate
  );
}