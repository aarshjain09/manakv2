import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Building2,
  Grid3X3,
  Package,
  Search,
  ScanBarcode,
  ShoppingBag,
  Tags,
  Loader2,
  X,
} from "lucide-react";

import BarcodeScanner from "../pages/barcode";
import QuantitySelector from "../components/quantityselector";

import API from "../services/api";

import {
  AuthContext,
} from "../context/auth";

import {
  CartContext,
} from "../context/cart";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

export default function Home() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH CONTEXT
  // ==========================================
  const {
    user,
  } = useContext(AuthContext);

  // ==========================================
  // CART CONTEXT
  // ==========================================
  const {
    cart = [],
    addToCart,
    updateQty,
  } = useContext(CartContext);

  // ==========================================
  // WORKER SELECTED CUSTOMER CONTEXT
  // ==========================================
  const {
    selectedCustomer,
  } = useContext(
    WorkerCustomerContext
  );

  // ==========================================
  // COMPANY STATE
  // ==========================================
  const [companies, setCompanies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // SEARCH STATE
  // ==========================================
  const [search, setSearch] =
    useState("");

  // ==========================================
  // SCANNER STATE
  // ==========================================
  const [scannerOpen, setScannerOpen] =
    useState(false);

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

  // ==========================================
  // LOAD COMPANIES
  // ==========================================
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);

        const res = await API.get(
          "/companies"
        );

        setCompanies(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load companies:",
          err
        );

        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // ==========================================
  // SEARCH SUBMIT
  // ==========================================
  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(
        value
      )}`
    );
  };

  // ==========================================
  // OPEN SCANNER
  // ==========================================
  const handleOpenScanner = () => {
    setScanError("");
    setScannedProduct(null);
    setScannerOpen(true);
  };

  // ==========================================
  // BARCODE DETECTED
  // ==========================================
  const handleBarcodeDetected = async (
    barcode
  ) => {
    try {
      setScannerOpen(false);
      setScanLoading(true);
      setScanError("");
      setScannedProduct(null);

      const cleanBarcode = String(
        barcode || ""
      ).trim();

      console.log(
        "SCANNED BARCODE:",
        cleanBarcode
      );

      const res = await API.get(
        `/products/barcode/${encodeURIComponent(
          cleanBarcode
        )}`
      );

      console.log(
        "BARCODE PRODUCT RESPONSE:",
        res.data
      );

      const product =
        res.data?.data || res.data;

      if (!product?._id) {
        throw new Error(
          "Invalid product response."
        );
      }

      setScannedProduct(product);
    } catch (err) {
      console.error(
        "FULL BARCODE ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setScanError(
        err.response?.data?.message ||
          err.message ||
          "No product found for this barcode."
      );
    } finally {
      setScanLoading(false);
    }
  };

  // ==========================================
  // GET EFFECTIVE PRICE TIER
  //
  // CUSTOMER:
  // logged-in customer's tier
  //
  // WORKER:
  // selected customer's tier
  // ==========================================
  const getEffectivePriceTier = () => {
    if (user?.role === "worker") {
      return String(
        selectedCustomer?.priceTier ||
          "C"
      )
        .trim()
        .toUpperCase();
    }

    return String(
      user?.priceTier || "C"
    )
      .trim()
      .toUpperCase();
  };

  // ==========================================
  // GET CUSTOMER TIER PRICE
  // ==========================================
  const getTierPrice = (product) => {
    if (!product) {
      return 0;
    }

    const tier =
      getEffectivePriceTier();

    let price = 0;

    if (tier === "A") {
      price = Number(
        product.priceA || 0
      );
    } else if (tier === "B") {
      price = Number(
        product.priceB || 0
      );
    } else {
      price = Number(
        product.priceC || 0
      );
    }

    /*
      Fallback only if selected tier price
      is missing or invalid.
    */
    if (!price || price <= 0) {
      price = Number(
        product.pricePerPiece || 0
      );
    }

    return price;
  };

  // ==========================================
  // CALCULATE MARGIN
  // ==========================================
  const getMargin = (product) => {
    if (!product) {
      return 0;
    }

    const mrp = Number(
      product.mrp || 0
    );

    const sellingPrice =
      getTierPrice(product);

    if (
      mrp <= 0 ||
      sellingPrice <= 0
    ) {
      return 0;
    }

    return (
      ((mrp - sellingPrice) / mrp) *
      100
    );
  };

  // ==========================================
  // GET SCANNED PRODUCT CART ITEM
  // ==========================================
  const getScannedCartItem = () => {
    if (!scannedProduct?._id) {
      return null;
    }

    return (
      cart.find((item) => {
        const productId =
          typeof item.product ===
          "object"
            ? item.product?._id
            : item.product;

        return (
          String(productId) ===
          String(scannedProduct._id)
        );
      }) || null
    );
  };

  const scannedCartItem =
    getScannedCartItem();

  const scannedPieces =
    Number(
      scannedCartItem?.pieces || 0
    );

  const scannedBoxes =
    Number(
      scannedCartItem?.boxes || 0
    );

  const scannedPrice =
    getTierPrice(scannedProduct);

  const scannedMargin =
    getMargin(scannedProduct);

  // ==========================================
  // UPDATE SCANNED PIECES
  // ==========================================
  const handleScannedPiecesChange = (
    value
  ) => {
    if (!scannedProduct) {
      return;
    }

    const qty = Math.max(
      0,
      Number(value) || 0
    );

    if (scannedCartItem) {
      updateQty(
        scannedProduct._id,
        "pieces",
        qty
      );
    } else {
      addToCart(
        scannedProduct,
        qty,
        0
      );
    }
  };

  // ==========================================
  // UPDATE SCANNED BOXES
  // ==========================================
  const handleScannedBoxesChange = (
    value
  ) => {
    if (!scannedProduct) {
      return;
    }

    const qty = Math.max(
      0,
      Number(value) || 0
    );

    if (scannedCartItem) {
      updateQty(
        scannedProduct._id,
        "boxes",
        qty
      );
    } else {
      addToCart(
        scannedProduct,
        0,
        qty
      );
    }
  };

  // ==========================================
  // QUICK LINKS
  // ==========================================
  const quickLinks = [
    {
      title: "All Products",
      subtitle: "Browse full catalogue",
      icon: Package,
      path: "/products",
    },
    {
      title: "Categories",
      subtitle: "Shop by category",
      icon: Grid3X3,
      path: "/categories",
    },
    {
      title: "Brands",
      subtitle: "Browse top brands",
      icon: Tags,
      path: "/brands",
    },
  ];

  return (
    <>
      <div className="w-full max-w-[1600px] mx-auto">
        {/* =====================================
            HERO
        ===================================== */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-4 py-6 sm:rounded-3xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

          <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">
              <ShoppingBag size={14} />

              MANAK Distributor Store
            </div>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Order your stock quickly and
              manage purchases in one place
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Browse companies, discover
              products, and place wholesale
              orders directly from your
              catalogue.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="mt-6 flex w-full max-w-2xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-xl"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <Search
                  size={20}
                  className="ml-3 shrink-0 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:block"
              >
                Search
              </button>

              <button
                type="button"
                onClick={
                  handleOpenScanner
                }
                aria-label="Scan barcode"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <ScanBarcode
                  size={21}
                />
              </button>
            </form>
          </div>
        </section>

        {/* =====================================
            SCAN LOADING
        ===================================== */}
        {scanLoading && (
          <section className="mt-5">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
              <Loader2
                size={21}
                className="animate-spin text-primary"
              />

              <p className="text-sm font-semibold text-slate-700">
                Finding scanned product...
              </p>
            </div>
          </section>
        )}

        {/* =====================================
            SCAN ERROR
        ===================================== */}
        {scanError && (
          <section className="mt-5">
            <div className="relative rounded-2xl border border-red-200 bg-red-50 px-5 py-5">
              <button
                type="button"
                onClick={() =>
                  setScanError("")
                }
                aria-label="Close error"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-100 hover:text-red-700"
              >
                <X size={17} />
              </button>

              <div className="pr-10">
                <p className="text-sm font-bold text-red-800">
                  Product not found
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {scanError}
                </p>

                <button
                  type="button"
                  onClick={
                    handleOpenScanner
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <ScanBarcode
                    size={17}
                  />

                  Scan Again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            FULL SCANNED PRODUCT CARD
        ===================================== */}
        {scannedProduct && (
          <section className="mt-5">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
              {/* LEFT ACCENT */}
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />

              {/* CLOSE */}
              <button
                type="button"
                onClick={() =>
                  setScannedProduct(null)
                }
                aria-label="Close scanned product"
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={17} />
              </button>

              <div className="p-4 pl-5 sm:p-5 sm:pl-6">
                {/* FOUND BADGE */}
                <div className="mb-4 flex items-center justify-between gap-3 pr-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <ScanBarcode
                      size={14}
                    />

                    Product Found
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleOpenScanner
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition hover:opacity-70"
                  >
                    <ScanBarcode
                      size={15}
                    />

                    Scan Again
                  </button>
                </div>

                <div className="grid gap-5 lg:grid-cols-[140px_minmax(0,1fr)_280px] lg:items-center">
                  {/* ===========================
                      PRODUCT IMAGE
                  =========================== */}
                  <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-40 lg:h-36">
                    {scannedProduct.image ? (
                      <img
                        src={
                          scannedProduct.image
                        }
                        alt={
                          scannedProduct.name
                        }
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <Package
                        size={38}
                        className="text-slate-300"
                      />
                    )}
                  </div>

                  {/* ===========================
                      PRODUCT DETAILS
                  =========================== */}
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-snug text-slate-950 sm:text-xl">
                      {
                        scannedProduct.name
                      }
                    </h3>

                    {/* CODE + BARCODE */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {scannedProduct.productCode && (
                        <p className="text-xs text-slate-500">
                          Code:{" "}
                          <span className="font-semibold text-slate-700">
                            {
                              scannedProduct.productCode
                            }
                          </span>
                        </p>
                      )}

                      {scannedProduct.barcode && (
                        <p className="text-xs text-slate-500">
                          Barcode:{" "}
                          <span className="font-semibold text-slate-700">
                            {
                              scannedProduct.barcode
                            }
                          </span>
                        </p>
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Your Price
                        </p>

                        <p className="text-2xl font-bold text-emerald-600">
                          ₹
                          {scannedPrice.toFixed(
                            2
                          )}
                        </p>
                      </div>

                      {Number(
                        scannedProduct.mrp || 0
                      ) > 0 && (
                        <div className="pb-1">
                          <p className="text-xs text-slate-400">
                            MRP
                          </p>

                          <p className="text-sm font-medium text-slate-500 line-through">
                            ₹
                            {Number(
                              scannedProduct.mrp
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {scannedMargin > 0 && (
                        <div className="mb-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {scannedMargin.toFixed(
                            1
                          )}
                          % Margin
                        </div>
                      )}
                    </div>

                    {/* BOX INFO */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Number(
                        scannedProduct.piecesPerBox ||
                          0
                      ) > 0 && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {
                            scannedProduct.piecesPerBox
                          }{" "}
                          pcs / box
                        </span>
                      )}

                      {Number(
                        scannedProduct.boxPrice ||
                          0
                      ) > 0 && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          Box ₹
                          {Number(
                            scannedProduct.boxPrice
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ===========================
                      QUANTITY CONTROLS
                  =========================== */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-bold text-slate-900">
                      Select Quantity
                    </p>

                    {/* PIECES */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Pieces
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Loose units
                        </p>
                      </div>

                      <QuantitySelector
                        value={
                          scannedPieces
                        }
                        onChange={
                          handleScannedPiecesChange
                        }
                      />
                    </div>

                    {/* DIVIDER */}
                    <div className="my-3 border-t border-slate-200" />

                    {/* BOXES */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Boxes
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {Number(
                            scannedProduct.piecesPerBox ||
                              0
                          ) > 0
                            ? `${scannedProduct.piecesPerBox} pcs each`
                            : "Full boxes"}
                        </p>
                      </div>

                      <QuantitySelector
                        value={
                          scannedBoxes
                        }
                        onChange={
                          handleScannedBoxesChange
                        }
                      />
                    </div>

                    {/* CART STATUS */}
                    {(scannedPieces > 0 ||
                      scannedBoxes > 0) && (
                      <div className="mt-4 rounded-xl bg-emerald-100 px-3 py-2.5 text-center">
                        <p className="text-xs font-bold text-emerald-700">
                          Added to Cart
                        </p>

                        <p className="mt-0.5 text-[11px] text-emerald-600">
                          {scannedPieces} pieces
                          {" · "}
                          {scannedBoxes} boxes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================
            QUICK ACCESS
        ===================================== */}
        <section className="mt-6 sm:mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Quick Access
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find products the way you
              prefer
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() =>
                    navigate(item.path)
                  }
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-primary group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      {item.subtitle}
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================
            COMPANIES
        ===================================== */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Shop by Company
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Browse products from
                available companies
              </p>
            </div>

            <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
              <Building2 size={16} />

              {companies.length} companies
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({
                length: 10,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/3] animate-pulse bg-slate-100" />

                  <div className="p-3">
                    <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Building2 size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No companies available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Companies will appear here
                when available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {companies.map(
                (company) => (
                  <button
                    key={company._id}
                    onClick={() =>
                      navigate(
                        `/company/${company._id}`
                      )
                    }
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 p-4 sm:p-5">
                      {company.image ? (
                        <img
                          src={
                            company.image
                          }
                          alt={
                            company.name
                          }
                          loading="lazy"
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2
                            size={34}
                            className="text-slate-300"
                          />
                        </div>
                      )}

                      <div className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white text-slate-600 opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowRight
                          size={16}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
                      <h3 className="truncate text-center text-sm font-semibold text-slate-900 sm:text-base">
                        {company.name}
                      </h3>

                      <p className="mt-1 text-center text-xs text-slate-400">
                        View products
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <div className="h-6 sm:h-10" />
      </div>

      {/* =====================================
          BARCODE SCANNER MODAL
      ===================================== */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() =>
          setScannerOpen(false)
        }
        onDetected={
          handleBarcodeDetected
        }
      />
    </>
  );
}