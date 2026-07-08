import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import Adminnav from "../../components/adminnav";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ==========================================
  // FETCH ORDER
  // ==========================================
  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/orders/admin/${id}`
      );

      setOrder(res.data);
    } catch (error) {
      console.error(
        "Failed to fetch order:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to fetch order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const updateStatus = async (status) => {
    try {
      setUpdatingStatus(true);

      const res = await API.put(
        `/orders/${id}/status`,
        { status }
      );

      setOrder((prev) => ({
        ...prev,
        status: res.data?.status || status
      }));
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // PRINT
  // ==========================================
  const printOrder = () => {
    window.print();
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    );
  };

  const getSourceLabel = (source) => {
    if (source === "customer_direct") {
      return "Customer Direct";
    }

    if (source === "salesman_notebook") {
      return "Salesman Notebook";
    }

    return "-";
  };

  const getStatusClass = (status) => {
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (status === "packed") {
      return "bg-blue-100 text-blue-800";
    }

    if (status === "delivered") {
      return "bg-green-100 text-green-800";
    }

    return "bg-gray-100 text-gray-700";
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Adminnav />

        <div className="py-20 text-center text-gray-500">
          Loading order...
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Adminnav />

        <div className="py-20 text-center">
          <p className="text-gray-500 mb-4">
            Order not found
          </p>

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ======================================
          PRINT CSS
      ====================================== */}
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .print-container {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .print-card {
              border: none !important;
              box-shadow: none !important;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            thead {
              display: table-header-group;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 py-6 print-container">
        {/* ======================================
            ADMIN NAV
        ====================================== */}
        <div className="no-print">
          <Adminnav />
        </div>

        {/* ======================================
            PAGE ACTIONS
        ====================================== */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-5">
          <div>
            <button
              onClick={() =>
                navigate("/admin/orders")
              }
              className="text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Back to Orders
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Order Details
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={(e) =>
                updateStatus(e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white disabled:opacity-50"
            >
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

            <button
              onClick={printOrder}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black"
            >
              Print Bill
            </button>
          </div>
        </div>

        {/* ======================================
            PRINTABLE BILL
        ====================================== */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden print-card">
          {/* ====================================
              BILL HEADER
          ==================================== */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  MANAK
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Order Details
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Order ID
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  #{order._id}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================
              ORDER INFORMATION
          ==================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200">
            {/* CUSTOMER DETAILS */}
            <div className="px-6 py-5 md:border-r border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Customer Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Shop Name
                  </span>

                  <span className="font-medium text-gray-900">
                    {order.user?.shopName || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Owner Name
                  </span>

                  <span className="font-medium text-gray-900">
                    {order.user?.ownerName || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Customer ID
                  </span>

                  <span className="font-semibold text-gray-900">
                    {order.user?.customerCode || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Phone
                  </span>

                  <span className="font-medium text-gray-900">
                    {order.user?.phone || "-"}
                  </span>
                </div>

                {order.user?.address && (
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <span className="text-gray-500">
                      Address
                    </span>

                    <span className="font-medium text-gray-900">
                      {order.user.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ORDER DETAILS */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Order Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Date Placed
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Source
                  </span>

                  <span className="font-medium text-gray-900">
                    {getSourceLabel(
                      order.orderSource
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <span
                    className={`w-fit text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Created By
                  </span>

                  <span className="font-medium text-gray-900">
                    {order.createdBy?.ownerName ||
                      order.createdBy?.shopName ||
                      "-"}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">
                    Creator Role
                  </span>

                  <span className="font-medium text-gray-900 capitalize">
                    {order.createdBy?.role || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================
              ITEMS TABLE
          ==================================== */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b border-r border-gray-300 px-3 py-3 text-center w-14">
                    S.No.
                  </th>

                  <th className="border-b border-r border-gray-300 px-3 py-3 text-left">
                    Product
                  </th>

                  <th className="border-b border-r border-gray-300 px-3 py-3 text-center">
                    Boxes
                  </th>

                  <th className="border-b border-r border-gray-300 px-3 py-3 text-center">
                    Pieces
                  </th>

                  <th className="border-b border-r border-gray-300 px-3 py-3 text-right">
                    Rate
                  </th>

                  <th className="border-b border-gray-300 px-3 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {(order.items || []).map(
                  (item, index) => {
                    /*
                      IMPORTANT:
                      Your current Order schema stores:
                      product, boxes, pieces

                      It does NOT currently snapshot:
                      rate or item amount.

                      These fallbacks try common product fields.
                      We can align them once we inspect Product model.
                    */

                    const rate =
  Number(item.rate || 0);

const itemAmount =
  Number(item.amount || 0);

                    return (
                      <tr key={item._id || index}>
                        <td className="border-b border-r border-gray-200 px-3 py-3 text-center">
                          {index + 1}
                        </td>

                        <td className="border-b border-r border-gray-200 px-3 py-3">
                          <div className="font-medium text-gray-900">
                            {item.product?.name ||
                              "Unknown Product"}
                          </div>

                          {item.product?._id && (
                            <div className="text-xs text-gray-400 mt-1">
                              {item.product._id}
                            </div>
                          )}
                        </td>

                        <td className="border-b border-r border-gray-200 px-3 py-3 text-center font-medium">
                          {Number(item.boxes || 0)}
                        </td>

                        <td className="border-b border-r border-gray-200 px-3 py-3 text-center font-medium">
                          {Number(item.pieces || 0)}
                        </td>

                        <td className="border-b border-r border-gray-200 px-3 py-3 text-right whitespace-nowrap">
                          {formatCurrency(rate)}
                        </td>

                        <td className="border-b border-gray-200 px-3 py-3 text-right font-medium whitespace-nowrap">
                          {formatCurrency(itemAmount)}
                        </td>
                      </tr>
                    );
                  }
                )}

                {(order.items || []).length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No items found in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================
              TOTAL SECTION
          ==================================== */}
          <div className="flex justify-end px-6 py-5 border-t border-gray-200">
            <div className="w-full sm:w-80">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-gray-700">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    order.totalAmount
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ====================================
              PRINT FOOTER
          ==================================== */}
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Generated from MANAK
            </p>
          </div>
        </div>
      </div>
    </>
  );
}