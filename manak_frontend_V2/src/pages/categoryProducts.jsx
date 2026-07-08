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
  ShoppingCart,
} from "lucide-react";

import API from "../services/api";

import {
  CartContext,
} from "../context/cart";

import ProductCard from "../components/productcard";

export default function CategoryProducts() {
  const { categoryId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const category =
    location.state?.category;

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
    useState("");

  // ==========================================
  // LOAD CATEGORY PRODUCTS
  // ==========================================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          `/products/category/${categoryId}`
        );

        const data = Array.isArray(
          res.data
        )
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
          "Failed to load category products:",
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

    if (categoryId) {
      loadProducts();
    }
  }, [categoryId]);

  // ==========================================
  // CART LOOKUP
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
  // FILTER
  // ==========================================
  const visibleProducts =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      if (!keyword) {
        return products;
      }

      return products.filter(
        (product) => {
          const searchableText = [
            product.name,
            product.productCode,
            product.barcode,
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
    }, [products, search]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          HEADER
      ===================================== */}
      <section className="mb-5 sm:mb-7">
        <button
          type="button"
          onClick={() =>
            navigate("/categories")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={17} />

          All Categories
        </button>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Category Products
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {category?.name ||
                "Products"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Browse available products
              in this category
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-primary sm:flex"
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
            placeholder="Search products in this category..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* COUNT */}
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

      {/* LOADING */}
      {loading && (
        <ProductSkeletonGrid />
      )}

      {/* ERROR */}
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
        </div>
      )}

      {/* EMPTY */}
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
              No matching products are
              available in this category.
            </p>
          </div>
        )}

      {/* PRODUCT GRID */}
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