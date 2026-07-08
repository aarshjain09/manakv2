import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Search,
  X,
  PackageSearch,
} from "lucide-react";

import API from "../services/api";

import {
  CartContext,
} from "../context/cart";

import ProductCard from "../components/productcard";

export default function BrandProducts() {
  const { brandId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const brand = location.state?.brand;

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

  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  // ==========================================
  // LOAD PRODUCTS BY BRAND
  // ==========================================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          `/products/brand/${brandId}`
        );

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setProducts(
          data.filter(
            (product) =>
              product.isActive !== false
          )
        );
      } catch (err) {
        console.error(
          "Failed to load brand products:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      loadProducts();
    }
  }, [brandId]);

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
  // SEARCH FILTER
  // ==========================================
  const visibleProducts = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
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

      return searchableText.includes(keyword);
    });
  }, [products, search]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          BACK + TITLE
      ===================================== */}
      <section className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/brands")}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft size={17} />
          All Brands
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {brand?.name
            ? `${brand.name} Products`
            : "Brand Products"}
        </h1>

        <p className="mt-1.5 text-sm text-slate-500">
          Browse available products from
          this brand
        </p>
      </section>

      {/* =====================================
          SEARCH
      ===================================== */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products in this brand..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* =====================================
          RESULT COUNT
      ===================================== */}
      {!loading && !error && (
        <p className="mb-4 text-xs text-slate-500 sm:text-sm">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {visibleProducts.length}
          </span>{" "}
          {visibleProducts.length === 1
            ? "product"
            : "products"}
        </p>
      )}

      {/* =====================================
          LOADING
      ===================================== */}
      {loading && <ProductSkeletonGrid />}

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
            className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================
          EMPTY
      ===================================== */}
      {!loading &&
        !error &&
        visibleProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <PackageSearch
              size={30}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try another product name or code."
                : "No products are currently available for this brand."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Clear Search
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
                  increaseBox={increaseBox}
                  decreaseBox={decreaseBox}
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
// SKELETON
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
          </div>
        </div>
      ))}
    </div>
  );
}