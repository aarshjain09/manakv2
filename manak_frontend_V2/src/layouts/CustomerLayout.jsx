import {
  useCallback,
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import {
  Loader2,
  ScanBarcode,
  X,
} from "lucide-react";

import CustomerSidebar from "../components/CustomerSidebar";
import CustomerHeader from "../components/CustomerHeader";

import ExternalScanProductModal from "../components/externalbarcode";

import useExternalBarcodeScanner from "../hooks/externalbarcode";

import API from "../services/api";

export default function CustomerLayout({
  children,
}) {
  // ==========================================
  // SIDEBAR STATE
  // ==========================================
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  // ==========================================
  // EXTERNAL SCANNER STATE
  // ==========================================
  const [
    scannedProduct,
    setScannedProduct,
  ] = useState(null);

  const [
    scanLoading,
    setScanLoading,
  ] = useState(false);

  const [
    scanError,
    setScanError,
  ] = useState("");

  const [
    lastScannedBarcode,
    setLastScannedBarcode,
  ] = useState("");

  // ==========================================
  // OPEN MOBILE SIDEBAR
  // ==========================================
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  // ==========================================
  // CLOSE MOBILE SIDEBAR
  // ==========================================
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ==========================================
  // CLOSE SCANNED PRODUCT
  // ==========================================
  const closeScannedProduct = () => {
    setScannedProduct(null);
  };

  // ==========================================
  // CLOSE SCAN ERROR
  // ==========================================
  const closeScanError = () => {
    setScanError("");
  };

  // ==========================================
  // EXTERNAL BARCODE LOOKUP
  // ==========================================
  const handleExternalScan = useCallback(
    async (barcode) => {
      const cleanBarcode = String(
        barcode || ""
      ).trim();

      if (!cleanBarcode) {
        return;
      }

      try {
        console.log(
          "EXTERNAL SCANNER BARCODE:",
          cleanBarcode
        );

        setLastScannedBarcode(
          cleanBarcode
        );

        setScanLoading(true);

        setScanError("");

        /*
          Close old scanned product before
          loading the newly scanned one.
        */
        setScannedProduct(null);

        const res = await API.get(
          `/products/barcode/${encodeURIComponent(
            cleanBarcode
          )}`
        );

        console.log(
          "EXTERNAL SCANNER RESPONSE:",
          res.data
        );

        const product =
          res.data?.data ||
          res.data;

        if (!product?._id) {
          throw new Error(
            "Invalid product response"
          );
        }

        setScannedProduct(product);
      } catch (err) {
        console.error(
          "EXTERNAL BARCODE ERROR:",
          err
        );

        console.error(
          "EXTERNAL BARCODE STATUS:",
          err.response?.status
        );

        console.error(
          "EXTERNAL BARCODE RESPONSE:",
          err.response?.data
        );

        setScanError(
          err.response?.data?.message ||
            err.message ||
            "Product not found for this barcode"
        );
      } finally {
        setScanLoading(false);
      }
    },
    []
  );

  // ==========================================
  // GLOBAL EXTERNAL BARCODE SCANNER
  //
  // Works across:
  // - Home
  // - Products
  // - Company
  // - Brand
  // - Category
  // - Cart
  // - Other CustomerLayout pages
  // ==========================================
  useExternalBarcodeScanner({
    onScan: handleExternalScan,

    enabled: true,

    /*
      Minimum barcode length.
      Your project may have short internal
      barcodes, so 4 is a safe starting point.
    */
    minLength: 4,

    /*
      External scanners type very quickly.

      If your scanner is slower, increase
      this to 150 or 200.
    */
    maxDelay: 100,
  });

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* =====================================
          DESKTOP SIDEBAR
      ===================================== */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-72 lg:block">
        <CustomerSidebar />
      </div>

      {/* =====================================
          MOBILE SIDEBAR OVERLAY
      ===================================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* DARK BACKDROP */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="absolute inset-0 h-full w-full bg-black/50"
          />

          {/* SIDEBAR DRAWER */}
          <div className="absolute left-0 top-0 z-10 h-full w-[280px] max-w-[85vw]">
            <CustomerSidebar
              mobile
              onClose={closeSidebar}
            />
          </div>
        </div>
      )}

      {/* =====================================
          MAIN CUSTOMER AREA
      ===================================== */}
      <div
        className="
          min-h-screen
          w-full
          lg:ml-72
          lg:w-[calc(100%-18rem)]
        "
      >
        {/* =================================
            GLOBAL CUSTOMER HEADER
        ================================= */}
        <CustomerHeader
          onMenuClick={openSidebar}
        />

        {/* =================================
            EXTERNAL SCANNER STATUS BAR
        ================================= */}
        <div className="border-b border-slate-200 bg-white">
          <div
            className="
              flex
              min-h-10
              items-center
              justify-between
              gap-3
              px-3
              py-2
              sm:px-5
              md:px-6
              lg:px-8
            "
          >
            {/* LEFT STATUS */}
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <ScanBarcode
                  size={15}
                />

                <span className="hidden sm:inline">
                  External Scanner Ready
                </span>

                <span className="sm:hidden">
                  Scanner Ready
                </span>
              </div>
            </div>

            {/* LAST SCANNED BARCODE */}
            {lastScannedBarcode && (
              <div className="min-w-0 text-right">
                <p className="truncate text-[10px] text-slate-400 sm:text-xs">
                  Last scan:{" "}
                  <span className="font-semibold text-slate-600">
                    {
                      lastScannedBarcode
                    }
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================
            PAGE CONTENT
        ================================= */}
        <main
          className="
            min-h-[calc(100vh-4rem)]
            w-full
            overflow-x-hidden
            px-3
            py-4
            sm:px-5
            sm:py-5
            md:px-6
            lg:px-8
            lg:py-6
          "
        >
          {children || <Outlet />}
        </main>
      </div>

      {/* =====================================
          EXTERNAL SCAN LOADING
      ===================================== */}
      {scanLoading && (
        <div
          className="
            fixed
            bottom-4
            right-4
            z-[120]
            flex
            items-center
            gap-3
            rounded-2xl
            bg-slate-950
            px-4
            py-3
            text-white
            shadow-2xl
            sm:bottom-5
            sm:right-5
          "
        >
          <Loader2
            size={19}
            className="shrink-0 animate-spin"
          />

          <div>
            <p className="text-sm font-bold">
              Looking up product
            </p>

            {lastScannedBarcode && (
              <p className="mt-0.5 text-[11px] text-slate-300">
                Barcode:{" "}
                {lastScannedBarcode}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =====================================
          EXTERNAL SCAN ERROR
      ===================================== */}
      {scanError && !scanLoading && (
        <div
          className="
            fixed
            bottom-4
            right-4
            z-[120]
            w-[calc(100%-2rem)]
            max-w-sm
            rounded-2xl
            border
            border-red-200
            bg-white
            p-4
            shadow-2xl
            sm:bottom-5
            sm:right-5
          "
        >
          <button
            type="button"
            onClick={closeScanError}
            aria-label="Close scan error"
            className="
              absolute
              right-3
              top-3
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={16} />
          </button>

          <div className="pr-9">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ScanBarcode
                  size={18}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950">
                  Product not found
                </p>

                {lastScannedBarcode && (
                  <p className="truncate text-[11px] text-slate-400">
                    {
                      lastScannedBarcode
                    }
                  </p>
                )}
              </div>
            </div>

            <p className="mt-3 break-words text-xs leading-5 text-red-600">
              {scanError}
            </p>

            <p className="mt-2 text-[11px] leading-4 text-slate-400">
              Scan another barcode to try
              again.
            </p>
          </div>
        </div>
      )}

      {/* =====================================
          EXTERNAL SCANNED PRODUCT MODAL
      ===================================== */}
      <ExternalScanProductModal
        open={Boolean(
          scannedProduct
        )}
        product={scannedProduct}
        onClose={
          closeScannedProduct
        }
      />
    </div>
  );
}