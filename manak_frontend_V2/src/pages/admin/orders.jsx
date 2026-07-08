import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

export default function AdminOrders() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    sourceFilter,
    setSourceFilter,
  ] = useState("all");

  const [
    fromDate,
    setFromDate,
  ] = useState("");

  const [
    toDate,
    setToDate,
  ] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = {};

      if (
        statusFilter !== "all"
      ) {
        params.status =
          statusFilter;
      }

      if (
        sourceFilter !== "all"
      ) {
        params.source =
          sourceFilter;
      }

      if (fromDate) {
        params.fromDate =
          fromDate;
      }

      if (toDate) {
        params.toDate =
          toDate;
      }

      const res =
        await API.get(
          "/orders/admin",
          {
            params,
          }
        );

      setOrders(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH WHEN FILTERS CHANGE
  // ==========================================

  useEffect(() => {
    fetchOrders();
  }, [
    statusFilter,
    sourceFilter,
    fromDate,
    toDate,
  ]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);

      const res =
        await API.put(
          `/orders/${id}/status`,
          {
            status,
          }
        );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? {
                ...order,

                status:
                  res.data?.status ||
                  status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // DOWNLOAD EXCEL
  // ==========================================

  const downloadExcel = async () => {
    if (
      !fromDate ||
      !toDate
    ) {
      alert(
        "Please select both From Date and To Date"
      );

      return;
    }

    if (
      fromDate > toDate
    ) {
      alert(
        "From Date cannot be after To Date"
      );

      return;
    }

    try {
      setDownloading(true);

      const res =
        await API.get(
          "/orders/admin/export/excel",
          {
            params: {
              fromDate,
              toDate,
            },

            responseType:
              "blob",
          }
        );

      const blob =
        new Blob(
          [res.data],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `orders_${fromDate}_to_${toDate}.xlsx`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        "Excel download failed:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to download Excel file"
      );
    } finally {
      setDownloading(false);
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearch("");

    setStatusFilter(
      "all"
    );

    setSourceFilter(
      "all"
    );

    setFromDate("");

    setToDate("");
  };

  // ==========================================
  // LOCAL SEARCH
  //
  // Searches:
  // - Order ID
  // - Shop Name
  // - Owner Name
  // - Phone
  // - Customer Code
  // - Address / Village / Location
  // ==========================================

  const filteredOrders =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const searchableValues =
            [
              order._id,

              order.user
                ?.shopName,

              order.user
                ?.ownerName,

              order.user
                ?.phone,

              order.user
                ?.customerCode,

              order.user
                ?.address,
            ];

          return searchableValues.some(
            (field) =>
              String(
                field || ""
              )
                .toLowerCase()
                .includes(value)
          );
        }
      );
    }, [
      orders,
      search,
    ]);

  // ==========================================
  // COUNTS
  // ==========================================

  const counts =
    useMemo(() => {
      return {
        all:
          orders.length,

        pending:
          orders.filter(
            (order) =>
              order.status ===
              "pending"
          ).length,

        packed:
          orders.filter(
            (order) =>
              order.status ===
              "packed"
          ).length,

        delivered:
          orders.filter(
            (order) =>
              order.status ===
              "delivered"
          ).length,
      };
    }, [orders]);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );
  };

  const formatCurrency = (
    amount
  ) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        style:
          "currency",

        currency:
          "INR",

        maximumFractionDigits:
          2,
      }
    );
  };

  const getSourceLabel = (
    source
  ) => {
    if (
      source ===
      "customer_direct"
    ) {
      return "Customer Direct";
    }

    if (
      source ===
      "salesman_notebook"
    ) {
      return "Salesman Notebook";
    }

    return "-";
  };

  const getStatusClass = (
    status
  ) => {
    if (
      status === "pending"
    ) {
      return "bg-yellow-100 text-yellow-800";
    }

    if (
      status === "packed"
    ) {
      return "bg-blue-100 text-blue-800";
    }

    if (
      status === "delivered"
    ) {
      return "bg-green-100 text-green-800";
    }

    return "bg-gray-100 text-gray-700";
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mt-6 mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage customer and
          salesman notebook orders
        </p>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* ALL */}

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "all"
            )
          }
          className={`text-left bg-white border rounded-lg p-4 transition ${
            statusFilter ===
            "all"
              ? "border-gray-900 ring-1 ring-gray-900"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <p className="text-sm text-gray-500">
            All Orders
          </p>

          <p className="text-2xl font-bold mt-1">
            {counts.all}
          </p>
        </button>

        {/* PENDING */}

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "pending"
            )
          }
          className={`text-left bg-white border rounded-lg p-4 transition ${
            statusFilter ===
            "pending"
              ? "border-yellow-500 ring-1 ring-yellow-500"
              : "border-gray-200 hover:border-yellow-400"
          }`}
        >
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {counts.pending}
          </p>
        </button>

        {/* PACKED */}

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "packed"
            )
          }
          className={`text-left bg-white border rounded-lg p-4 transition ${
            statusFilter ===
            "packed"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200 hover:border-blue-400"
          }`}
        >
          <p className="text-sm text-gray-500">
            Packed
          </p>

          <p className="text-2xl font-bold text-blue-700 mt-1">
            {counts.packed}
          </p>
        </button>

        {/* DELIVERED */}

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "delivered"
            )
          }
          className={`text-left bg-white border rounded-lg p-4 transition ${
            statusFilter ===
            "delivered"
              ? "border-green-500 ring-1 ring-green-500"
              : "border-gray-200 hover:border-green-400"
          }`}
        >
          <p className="text-sm text-gray-500">
            Delivered
          </p>

          <p className="text-2xl font-bold text-green-700 mt-1">
            {counts.delivered}
          </p>
        </button>
      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* SEARCH */}

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Shop, owner, code, phone, location..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
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

          {/* SOURCE */}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Source
            </label>

            <select
              value={
                sourceFilter
              }
              onChange={(e) =>
                setSourceFilter(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">
                All Sources
              </option>

              <option value="customer_direct">
                Customer Direct
              </option>

              <option value="salesman_notebook">
                Salesman Notebook
              </option>
            </select>
          </div>

          {/* FROM DATE */}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* TO DATE */}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* FILTER ACTIONS */}

        <div className="flex flex-wrap justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={
              resetFilters
            }
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset Filters
          </button>

          <button
            type="button"
            onClick={
              downloadExcel
            }
            disabled={
              downloading
            }
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {downloading
              ? "Downloading..."
              : "Download Excel"}
          </button>
        </div>
      </div>

      {/* ======================================
          ORDERS TABLE
      ====================================== */}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* TABLE HEADER */}

        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <p className="font-semibold text-gray-800">
            Order List
          </p>

          <p className="text-sm text-gray-500">
            {
              filteredOrders.length
            }{" "}
            orders
          </p>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length ===
          0 ? (
          /* EMPTY */

          <div className="py-16 text-center">
            <p className="text-gray-500">
              No orders found
            </p>
          </div>
        ) : (
          /* TABLE */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="border-b px-3 py-3 text-left">
                    Order
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Date
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Customer
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Customer ID
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Phone
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Location
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Source
                  </th>

                  <th className="border-b px-3 py-3 text-center">
                    Items
                  </th>

                  <th className="border-b px-3 py-3 text-right">
                    Total
                  </th>

                  <th className="border-b px-3 py-3 text-left">
                    Status
                  </th>

                  <th className="border-b px-3 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={
                        order._id
                      }
                      className="hover:bg-gray-50"
                    >
                      {/* ORDER ID */}

                      <td className="border-b px-3 py-3">
                        <span className="font-medium text-gray-900">
                          #
                          {order._id
                            ?.slice(-8)
                            .toUpperCase()}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="border-b px-3 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* CUSTOMER */}

                      <td className="border-b px-3 py-3">
                        <div className="font-medium text-gray-900">
                          {order.user
                            ?.shopName ||
                            "No Shop Name"}
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5">
                          {order.user
                            ?.ownerName ||
                            "-"}
                        </div>
                      </td>

                      {/* CUSTOMER CODE */}

                      <td className="border-b px-3 py-3">
                        <span className="font-medium">
                          {order.user
                            ?.customerCode ||
                            order.customerCode ||
                            "-"}
                        </span>
                      </td>

                      {/* PHONE */}

                      <td className="border-b px-3 py-3 text-gray-600 whitespace-nowrap">
                        {order.user
                          ?.phone ||
                          "-"}
                      </td>

                      {/* LOCATION */}

                      <td className="border-b px-3 py-3 text-gray-600 whitespace-nowrap">
                        {order.user
                          ?.address ||
                          "-"}
                      </td>

                      {/* SOURCE */}

                      <td className="border-b px-3 py-3">
                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {getSourceLabel(
                            order.orderSource
                          )}
                        </span>
                      </td>

                      {/* ITEM COUNT */}

                      <td className="border-b px-3 py-3 text-center font-medium">
                        {order.items
                          ?.length ||
                          0}
                      </td>

                      {/* TOTAL */}

                      <td className="border-b px-3 py-3 text-right font-semibold whitespace-nowrap">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="border-b px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`w-fit text-xs font-semibold px-2 py-1 rounded-full capitalize ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {
                              order.status
                            }
                          </span>

                          <select
                            value={
                              order.status
                            }
                            disabled={
                              updatingId ===
                              order._id
                            }
                            onChange={(
                              e
                            ) =>
                              updateStatus(
                                order._id,
                                e.target
                                  .value
                              )
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white disabled:opacity-50"
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
                        </div>
                      </td>

                      {/* ACTION */}

                      <td className="border-b px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/orders/${order._id}`
                            )
                          }
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}