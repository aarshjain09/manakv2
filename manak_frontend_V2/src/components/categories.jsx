import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Search,
  X,
  FolderTree,
  ArrowRight,
} from "lucide-react";

import API from "../services/api";

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          "/categories"
        );

        const data = Array.isArray(
          res.data
        )
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        // Customer sees active categories only
        setCategories(
          data.filter(
            (category) =>
              category.isActive !== false
          )
        );
      } catch (err) {
        console.error(
          "Failed to load categories:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================
  const visibleCategories =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      if (!keyword) {
        return categories;
      }

      return categories.filter(
        (category) => {
          const searchableText = [
            category.name,
            category.brand?.name,
            category.brand?.company?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            keyword
          );
        }
      );
    }, [categories, search]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          HEADER
      ===================================== */}
      <section className="mb-5 sm:mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Browse Catalogue
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Categories
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Choose a category to view
          available products
        </p>
      </section>

      {/* =====================================
          SEARCH
      ===================================== */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
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
            placeholder="Search categories..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
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
        <div className="mb-4">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {visibleCategories.length}
            </span>{" "}
            {visibleCategories.length === 1
              ? "category"
              : "categories"}
          </p>
        </div>
      )}

      {/* =====================================
          LOADING
      ===================================== */}
      {loading && (
        <CategorySkeletonGrid />
      )}

      {/* =====================================
          ERROR
      ===================================== */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
          <FolderTree
            size={34}
            className="mx-auto text-red-300"
          />

          <h2 className="mt-3 font-semibold text-red-900">
            Could not load categories
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
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
        visibleCategories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderTree size={27} />
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              No categories found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Try another category name.
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

      {/* =====================================
          CATEGORY GRID
      ===================================== */}
      {!loading &&
        !error &&
        visibleCategories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {visibleCategories.map(
              (category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/categories/${category._id}`,
                      {
                        state: {
                          category,
                        },
                      }
                    )
                  }
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* IMAGE */}
                  <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105 sm:p-5"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FolderTree
                          size={38}
                          className="text-slate-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-3 sm:p-4">
                    <h2 className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
                      {category.name}
                    </h2>

                    {category.brand?.name && (
                      <p className="mt-1 truncate text-[11px] text-slate-400 sm:text-xs">
                        {category.brand.name}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-primary sm:text-xs">
                        View Products
                      </span>

                      <ArrowRight
                        size={16}
                        className="text-primary transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </button>
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
function CategorySkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({
        length: 10,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />

          <div className="space-y-3 p-3 sm:p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}