import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Search,
  ScanBarcode,
  PackageSearch,
  SlidersHorizontal,
  X,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import API from "../services/api";

import {
  CartContext,
} from "../context/cart";

import {
  AuthContext,
} from "../context/auth";

import ProductCard from "../components/productcard";

export default function Products() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const { user } =
    useContext(AuthContext);

  const {
    cart,

    increaseBox,
    decreaseBox,

    increasePiece,
    decreasePiece,
  } = useContext(CartContext);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState(
      searchParams.get("search") || ""
    );

  const [sortBy, setSortBy] =
    useState("default");

  const [
    marginFilter,
    setMarginFilter,
  ] = useState("all");

  // ==========================================
  // CUSTOMER PRICE TIER
  // ==========================================
  const priceTier = String(
    user?.priceTier || "C"
  )
    .trim()
    .toUpperCase();

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          "/products"
        );

        const data = Array.isArray(
          res.data
        )
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        // Customer should only see active products
        setProducts(
          data.filter(
            (product) =>
              product.isActive !== false
          )
        );
      } catch (err) {
        console.error(
          "Failed to load products:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load products"
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ==========================================
  // SYNC SEARCH FROM URL
  // ==========================================
  useEffect(() => {
    const query =
      searchParams.get("search") || "";

    setSearch(query);
  }, [searchParams]);

  // ==========================================
  // CART LOOKUP MAP
  // ==========================================
  const cartMap = useMemo(() => {
    return new Map(
      cart.map((item) => [
        item.product._id,
        item,
      ])
    );
  }, [cart]);

  // ==========================================
  // FILTER + SORT PRODUCTS
  // ==========================================
  const visibleProducts =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      let result = [...products];

      // ======================================
      // SEARCH
      // ======================================
      if (keyword) {
        result = result.filter(
          (product) => {
            const searchableText = [
              product.name,
              product.productCode,
              product.barcode,
              product.company?.name,
              product.brand?.name,
              product.category?.name,

              ...(Array.isArray(
                product.searchKeywords
              )
                ? product.searchKeywords
                : []),
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

      // ======================================
      // MARGIN FILTER
      //
      // Uses logged-in customer's own tier
      // ======================================
      if (marginFilter !== "all") {
        const minimumMargin =
          Number(marginFilter);

        result = result.filter(
          (product) => {
            const margin =
              getMargin(
                product,
                priceTier
              );

            return (
              margin >= minimumMargin
            );
          }
        );
      }

      // ======================================
      // NAME ASC
      // ======================================
      if (sortBy === "name-asc") {
        result.sort((a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(b.name || "")
          )
        );
      }

      // ======================================
      // NAME DESC
      // ======================================
      if (sortBy === "name-desc") {
        result.sort((a, b) =>
          String(
            b.name || ""
          ).localeCompare(
            String(a.name || "")
          )
        );
      }

      // ======================================
      // PRICE LOW TO HIGH
      //
      // Uses customer's tier price
      // ======================================
      if (sortBy === "price-low") {
        result.sort(
          (a, b) =>
            getCustomerPrice(
              a,
              priceTier
            ) -
            getCustomerPrice(
              b,
              priceTier
            )
        );
      }

      // ======================================
      // PRICE HIGH TO LOW
      // ======================================
      if (sortBy === "price-high") {
        result.sort(
          (a, b) =>
            getCustomerPrice(
              b,
              priceTier
            ) -
            getCustomerPrice(
              a,
              priceTier
            )
        );
      }

      // ======================================
      // MARGIN HIGH TO LOW
      // ======================================
      if (
        sortBy === "margin-high"
      ) {
        result.sort(
          (a, b) =>
            getMargin(
              b,
              priceTier
            ) -
            getMargin(
              a,
              priceTier
            )
        );
      }

      // ======================================
      // MARGIN LOW TO HIGH
      // ======================================
      if (
        sortBy === "margin-low"
      ) {
        result.sort(
          (a, b) =>
            getMargin(
              a,
              priceTier
            ) -
            getMargin(
              b,
              priceTier
            )
        );
      }

      return result;
    }, [
      products,
      search,
      sortBy,
      marginFilter,
      priceTier,
    ]);

  // ==========================================
  // SEARCH CHANGE
  // ==========================================
  const handleSearchChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSearch(value);

    if (value.trim()) {
      setSearchParams({
        search: value,
      });
    } else {
      setSearchParams({});
    }
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================
  const clearSearch = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          PAGE HEADER
      ===================================== */}
      <section className="mb-5 sm:mb-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Product Catalogue
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              All Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Browse and add wholesale
              products to your cart
            </p>
          </div>

          {/* CART SHORTCUT */}
          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary lg:flex"
          >
            <ShoppingCart size={18} />

            Cart

            {cart.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* =====================================
          SEARCH + CONTROLS
      ===================================== */}
      <section className="sticky top-16 z-20 -mx-3 mb-5 border-y border-slate-200 bg-slate-50/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:mb-7 lg:rounded-2xl lg:border lg:bg-white lg:p-4 lg:shadow-sm">
        <div className="flex flex-col gap-3">
          {/* =================================
              SEARCH
          ================================= */}
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search name, code, brand..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* =================================
              FILTER + SORT + SCANNER
          ================================= */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {/* MARGIN FILTER */}
            <div className="relative min-w-0 sm:w-48">
              <TrendingUp
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
              />

              <select
                value={marginFilter}
                onChange={(e) =>
                  setMarginFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-7 text-xs font-medium text-slate-700 outline-none transition focus:border-primary sm:text-sm"
              >
                <option value="all">
                  All Margins
                </option>

                <option value="10">
                  10%+ Margin
                </option>

                <option value="15">
                  15%+ Margin
                </option>

                <option value="20">
                  20%+ Margin
                </option>

                <option value="25">
                  25%+ Margin
                </option>

                <option value="30">
                  30%+ Margin
                </option>

                <option value="40">
                  40%+ Margin
                </option>
              </select>
            </div>

            {/* SORT */}
            <div className="relative min-w-0 sm:w-52">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-7 text-xs font-medium text-slate-700 outline-none transition focus:border-primary sm:text-sm"
              >
                <option value="default">
                  Default
                </option>

                <option value="name-asc">
                  Name A-Z
                </option>

                <option value="name-desc">
                  Name Z-A
                </option>

                <option value="price-low">
                  Price Low-High
                </option>

                <option value="price-high">
                  Price High-Low
                </option>

                <option value="margin-high">
                  Margin High-Low
                </option>

                <option value="margin-low">
                  Margin Low-High
                </option>
              </select>
            </div>

            {/* BARCODE SCANNER */}
           
          </div>
        </div>
      </section>

      {/* =====================================
          ACTIVE MARGIN FILTER
      ===================================== */}
      {marginFilter !== "all" && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <TrendingUp size={13} />

            {marginFilter}%+ Margin

            <button
              type="button"
              onClick={() =>
                setMarginFilter("all")
              }
              className="ml-1 rounded-full p-0.5 transition hover:bg-emerald-100"
            >
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* =====================================
          RESULTS COUNT
      ===================================== */}
      {!loading && !error && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {visibleProducts.length}
            </span>{" "}
            {visibleProducts.length === 1
              ? "product"
              : "products"}
          </p>

          {search && (
            <p className="max-w-[55%] truncate text-xs text-slate-400 sm:text-sm">
              Search:{" "}
              <span className="font-medium text-slate-600">
                "{search}"
              </span>
            </p>
          )}
        </div>
      )}

      {/* =====================================
          LOADING
      ===================================== */}
      {loading && (
        <ProductSkeletonGrid />
      )}

      {/* =====================================
          ERROR
      ===================================== */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
          <PackageSearch
            size={34}
            className="mx-auto text-red-300"
          />

          <h2 className="mt-3 font-semibold text-red-900">
            Could not load products
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================
          EMPTY STATE
      ===================================== */}
      {!loading &&
        !error &&
        visibleProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageSearch
                size={27}
              />
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {search ||
              marginFilter !== "all"
                ? "Try changing your search or margin filter."
                : "Products will appear here when available."}
            </p>

            {(search ||
              marginFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  setMarginFilter(
                    "all"
                  );
                }}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      {/* =====================================
          PRODUCT GRID
      ===================================== */}
      {!loading &&
        !error &&
        visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {visibleProducts.map(
              (product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  cartItem={cartMap.get(
                    product._id
                  )}
                  increaseBox={
                    increaseBox
                  }
                  decreaseBox={
                    decreaseBox
                  }
                  increasePiece={
                    increasePiece
                  }
                  decreasePiece={
                    decreasePiece
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
// CUSTOMER TIER PRICE HELPER
// ==========================================
function getCustomerPrice(
  product,
  priceTier
) {
  const tier = String(
    priceTier || "C"
  )
    .trim()
    .toUpperCase();

  if (tier === "A") {
    return Number(
      product?.priceA || 0
    );
  }

  if (tier === "B") {
    return Number(
      product?.priceB || 0
    );
  }

  return Number(
    product?.priceC || 0
  );
}

// ==========================================
// CUSTOMER MARGIN HELPER
// ==========================================
function getMargin(
  product,
  priceTier
) {
  const mrp = Number(
    product?.mrp || 0
  );

  const price =
    getCustomerPrice(
      product,
      priceTier
    );

  if (
    mrp <= 0 ||
    price <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    ((mrp - price) / mrp) * 100
  );
}

// ==========================================
// SKELETON GRID
// ==========================================
function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({
        length: 10,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-square animate-pulse bg-slate-100" />

          <div className="space-y-3 p-3 sm:p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

            <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />

            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />

            <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />

            <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}