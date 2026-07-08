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
  if (!order) return;

  const printWindow = window.open(
    "",
    "_blank",
    "width=1100,height=800"
  );

  if (!printWindow) {
    alert(
      "Please allow popups to print the order."
    );
    return;
  }

  const items = order.items || [];

  const itemRows = items
    .map((item, index) => {
      const rate =
        Number(item.rate || 0);

      const amount =
        Number(item.amount || 0);

      const productName =
        item.product?.name ||
        "Unknown Product";

      const productCode =
        item.product?.productCode ||
        "-";

      return `
        <tr>
          <td class="center">
            ${index + 1}
          </td>

          <td class="code">
            ${productCode}
          </td>

          <td>
            ${productName}
          </td>

          <td class="center">
            ${Number(item.boxes || 0)}
          </td>

          <td class="center">
            ${Number(item.pieces || 0)}
          </td>

          <td class="right">
            ${rate.toFixed(2)}
          </td>

          <td class="right">
            ${amount.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const orderNumber =
    order.orderNumber ||
    order._id ||
    "-";

  const customerName =
    order.user?.shopName ||
    order.user?.ownerName ||
    "-";

  const ownerName =
    order.user?.ownerName ||
    "-";

  const customerCode =
    order.user?.customerCode ||
    "-";

  const phone =
    order.user?.phone ||
    "-";

  const address =
    order.user?.address ||
    "-";

  const createdBy =
    order.createdBy?.ownerName ||
    order.createdBy?.shopName ||
    "-";

  const source =
    getSourceLabel(
      order.orderSource
    );

  const status =
    String(order.status || "-")
      .toUpperCase();

  const grandTotal =
    Number(
      order.totalAmount || 0
    ).toFixed(2);

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>
          Order ${orderNumber}
        </title>

        <meta charset="UTF-8" />

        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            font-size: 11px;
          }

          .print-page {
            width: 100%;
          }

          /* ================= HEADER ================= */

          .header {
            border: 1.5px solid #000;
          }

          .business-header {
            display: grid;
            grid-template-columns:
              1fr auto;
            align-items: start;
            padding: 10px 12px;
          }

          .business-name {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }

          .business-subtitle {
            margin-top: 3px;
            font-size: 10px;
          }

          .document-title {
            text-align: right;
          }

          .document-title h2 {
            margin: 0;
            font-size: 15px;
            text-transform: uppercase;
          }

          .document-title p {
            margin: 4px 0 0;
            font-size: 10px;
          }

          /* ================= INFO GRID ================= */

          .info-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            border-left: 1.5px solid #000;
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
          }

          .info-box {
            padding: 8px 10px;
            min-height: 112px;
          }

          .info-box:first-child {
            border-right:
              1px solid #000;
          }

          .section-title {
            margin-bottom: 6px;
            padding-bottom: 3px;
            border-bottom:
              1px solid #777;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .info-row {
            display: grid;
            grid-template-columns:
              95px 1fr;
            gap: 5px;
            margin-bottom: 4px;
            line-height: 1.35;
          }

          .label {
            font-weight: 700;
          }

          .value {
            overflow-wrap: anywhere;
          }

          /* ================= TABLE ================= */

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 7px;
            table-layout: fixed;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }

          th,
          td {
            border: 1px solid #000;
            padding: 5px 4px;
            vertical-align: top;
          }

          th {
            background: #eeeeee;
            font-size: 10px;
            font-weight: 700;
            text-align: center;
          }

          td {
            font-size: 10px;
          }

          .col-sno {
            width: 6%;
          }

          .col-code {
            width: 14%;
          }

          .col-product {
            width: 34%;
          }

          .col-boxes {
            width: 9%;
          }

          .col-pieces {
            width: 9%;
          }

          .col-rate {
            width: 13%;
          }

          .col-amount {
            width: 15%;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .code {
            font-family:
              "Courier New",
              monospace;
            font-size: 9px;
          }

          /* ================= TOTAL ================= */

          .total-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 7px;
          }

          .total-box {
            width: 300px;
            border: 1.5px solid #000;
          }

          .total-row {
            display: grid;
            grid-template-columns:
              1fr 1fr;
          }

          .total-label,
          .total-value {
            padding: 8px 10px;
            font-size: 13px;
            font-weight: 800;
          }

          .total-label {
            border-right:
              1px solid #000;
          }

          .total-value {
            text-align: right;
          }

          /* ================= FOOTER ================= */

          .footer {
            display: grid;
            grid-template-columns:
              1fr 220px;
            gap: 20px;
            margin-top: 22px;
          }

          .footer-note {
            font-size: 9px;
            line-height: 1.5;
          }

          .signature {
            text-align: center;
          }

          .signature-space {
            height: 35px;
          }

          .signature-line {
            border-top: 1px solid #000;
            padding-top: 4px;
            font-size: 10px;
            font-weight: 700;
          }

          .generated {
            margin-top: 14px;
            padding-top: 5px;
            border-top: 1px solid #aaa;
            text-align: center;
            font-size: 8px;
          }

          @media print {
            body {
              -webkit-print-color-adjust:
                exact;
              print-color-adjust:
                exact;
            }
          }
        </style>
      </head>

      <body>
        <div class="print-page">

          <!-- ================= HEADER ================= -->

          <div class="header">
            <div class="business-header">

              <div>
                <h1 class="business-name">
                  MANAK
                </h1>

                <div class="business-subtitle">
                  Distributor Management System
                </div>
              </div>

              <div class="document-title">
                <h2>
                  Order Sheet
                </h2>

                <p>
                  Order No:
                  ${orderNumber}
                </p>
              </div>

            </div>
          </div>


          <!-- ================= INFORMATION ================= -->

          <div class="info-grid">

            <div class="info-box">

              <div class="section-title">
                Customer Details
              </div>

              <div class="info-row">
                <div class="label">
                  Shop Name
                </div>

                <div class="value">
                  ${customerName}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Owner
                </div>

                <div class="value">
                  ${ownerName}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Customer ID
                </div>

                <div class="value">
                  ${customerCode}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Phone
                </div>

                <div class="value">
                  ${phone}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Address
                </div>

                <div class="value">
                  ${address}
                </div>
              </div>

            </div>


            <div class="info-box">

              <div class="section-title">
                Order Details
              </div>

              <div class="info-row">
                <div class="label">
                  Date
                </div>

                <div class="value">
                  ${formatDate(order.createdAt)}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Source
                </div>

                <div class="value">
                  ${source}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Status
                </div>

                <div class="value">
                  ${status}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Created By
                </div>

                <div class="value">
                  ${createdBy}
                </div>
              </div>

              <div class="info-row">
                <div class="label">
                  Role
                </div>

                <div class="value">
                  ${
                    order.createdBy?.role ||
                    "-"
                  }
                </div>
              </div>

            </div>

          </div>


          <!-- ================= ITEMS ================= -->

          <table>

            <thead>
              <tr>
                <th class="col-sno">
                  S.No
                </th>

                <th class="col-code">
                  Code
                </th>

                <th class="col-product">
                  Product
                </th>

                <th class="col-boxes">
                  Box
                </th>

                <th class="col-pieces">
                  Pcs
                </th>

                <th class="col-rate">
                  Rate
                </th>

                <th class="col-amount">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              ${
                itemRows ||
                `
                  <tr>
                    <td
                      colspan="7"
                      class="center"
                    >
                      No items found
                    </td>
                  </tr>
                `
              }
            </tbody>

          </table>


          <!-- ================= TOTAL ================= -->

          <div class="total-area">

            <div class="total-box">

              <div class="total-row">

                <div class="total-label">
                  Grand Total
                </div>

                <div class="total-value">
                  ₹ ${grandTotal}
                </div>

              </div>

            </div>

          </div>


          <!-- ================= FOOTER ================= -->

          <div class="footer">

            <div class="footer-note">
              <strong>Note:</strong>
              This document is an order sheet generated
              from MANAK DMS.
            </div>

            <div class="signature">
              <div class="signature-space">
              </div>

              <div class="signature-line">
                Authorised Signature
              </div>
            </div>

          </div>


          <div class="generated">
            Generated from MANAK DMS
          </div>

        </div>

        <script>
          window.onload = function () {
            window.focus();

            setTimeout(function () {
              window.print();
            }, 250);
          };

          window.onafterprint = function () {
            window.close();
          };
        </script>

      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(
    printHtml
  );
  printWindow.document.close();
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