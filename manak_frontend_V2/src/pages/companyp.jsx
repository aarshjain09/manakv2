import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Tags,
  PackageSearch,
  ChevronRight,
  Building2,
} from "lucide-react";

import API from "../services/api";

export default function CompanyProducts() {
  const { companyId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [brands, setBrands] =
    useState([]);

  const [company, setCompany] =
    useState(
      location.state?.company || null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD COMPANY + BRANDS
  // ==========================================
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          companyResponse,
          brandsResponse,
        ] = await Promise.all([
          API.get(
            `/companies/${companyId}`
          ),

          API.get(
            `/brands/company/${companyId}`
          ),
        ]);

        // ====================================
        // COMPANY
        // ====================================
        setCompany(
          companyResponse.data || null
        );

        // ====================================
        // BRANDS
        // ====================================
        const brandData =
          Array.isArray(
            brandsResponse.data
          )
            ? brandsResponse.data
            : Array.isArray(
                brandsResponse.data?.data
              )
              ? brandsResponse.data.data
              : [];

        // Active brands only
        setBrands(
          brandData.filter(
            (brand) =>
              brand.isActive !== false
          )
        );
      } catch (err) {
        console.error(
          "Failed to load company brands:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load brands"
        );

        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [companyId]);

  // ==========================================
  // OPEN BRAND CATEGORIES
  // ==========================================
  const openBrand = (brand) => {
    navigate(
      `/brand/${brand._id}/categories`,
      {
        state: {
          brand,
          company,
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================
          BACK
      ===================================== */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="
          mb-4
          inline-flex
          items-center
          gap-2
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3
          py-2
          text-sm
          font-semibold
          text-slate-700
          shadow-sm
          transition
          hover:border-primary/30
          hover:text-primary
        "
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* =====================================
          COMPANY HERO
      ===================================== */}
      <section
        className="
          relative
          mb-6
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
          sm:mb-8
        "
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

        <div
          className="
            flex
            items-center
            gap-4
            p-4
            sm:gap-6
            sm:p-6
            lg:p-8
          "
        >
          {/* COMPANY IMAGE */}
          <div
            className="
              flex
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              sm:h-28
              sm:w-28
            "
          >
            {company?.image ? (
              <img
                src={company.image}
                alt={company.name}
                className="
                  h-full
                  w-full
                  object-contain
                  p-2
                  sm:p-3
                "
              />
            ) : (
              <Building2
                size={34}
                className="text-slate-300"
              />
            )}
          </div>

          {/* COMPANY INFO */}
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-primary
                sm:text-xs
              "
            >
              Shop by Company
            </p>

            <h1
              className="
                mt-1
                truncate
                text-xl
                font-bold
                tracking-tight
                text-slate-950
                sm:text-3xl
              "
            >
              {company?.name ||
                "Company Brands"}
            </h1>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                sm:text-sm
              "
            >
              Choose a brand to explore
              its product categories
            </p>

            {!loading && (
              <div
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-[11px]
                  font-semibold
                  text-slate-600
                  sm:text-xs
                "
              >
                <Tags size={13} />

                {brands.length}{" "}
                {brands.length === 1
                  ? "Brand"
                  : "Brands"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================
          HEADING
      ===================================== */}
      {!loading &&
        !error &&
        brands.length > 0 && (
          <section className="mb-4 sm:mb-5">
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-widest
                text-primary
              "
            >
              Available Brands
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-slate-950
                sm:text-2xl
              "
            >
              Choose a Brand
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                sm:text-sm
              "
            >
              Select a brand to view
              available categories
            </p>
          </section>
        )}

      {/* =====================================
          LOADING
      ===================================== */}
      {loading && (
        <BrandSkeletonGrid />
      )}

      {/* =====================================
          ERROR
      ===================================== */}
      {!loading && error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-12
            text-center
          "
        >
          <PackageSearch
            size={34}
            className="mx-auto text-red-300"
          />

          <h2 className="mt-3 font-semibold text-red-900">
            Could not load brands
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-4
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
            "
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
        brands.length === 0 && (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-5
              py-16
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
              "
            >
              <Tags
                size={30}
                className="text-slate-400"
              />
            </div>

            <h2
              className="
                mt-4
                text-lg
                font-bold
                text-slate-900
              "
            >
              No brands available
            </h2>

            <p
              className="
                mx-auto
                mt-1
                max-w-sm
                text-sm
                text-slate-500
              "
            >
              There are currently no active
              brands available for this
              company.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/home")
              }
              className="
                mt-5
                rounded-xl
                bg-slate-950
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
              "
            >
              Browse Companies
            </button>
          </div>
        )}

      {/* =====================================
          BRAND GRID
      ===================================== */}
      {!loading &&
        !error &&
        brands.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-4
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
            "
          >
            {brands.map((brand) => (
              <button
                key={brand._id}
                type="button"
                onClick={() =>
                  openBrand(brand)
                }
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  text-left
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-primary/30
                  hover:shadow-lg
                "
              >
                {/* BRAND IMAGE */}
                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    bg-slate-50
                  "
                >
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-contain
                        p-4
                        transition
                        duration-300
                        group-hover:scale-105
                        sm:p-6
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                      "
                    >
                      <Tags
                        size={34}
                        className="text-slate-300"
                      />
                    </div>
                  )}

                  <div
                    className="
                      absolute
                      right-2
                      top-2
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-slate-200
                      bg-white/95
                      text-slate-500
                      shadow-sm
                      transition
                      group-hover:border-primary
                      group-hover:bg-primary
                      group-hover:text-white
                    "
                  >
                    <ChevronRight
                      size={17}
                    />
                  </div>
                </div>

                {/* BRAND DETAILS */}
                <div className="p-3 sm:p-4">
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                      sm:text-xs
                    "
                  >
                    Brand
                  </p>

                  <h3
                    className="
                      mt-1
                      line-clamp-2
                      min-h-10
                      text-sm
                      font-bold
                      leading-5
                      text-slate-900
                      transition
                      group-hover:text-primary
                      sm:text-base
                    "
                  >
                    {brand.name}
                  </h3>

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      gap-2
                    "
                  >
                    <span
                      className="
                        text-[11px]
                        font-semibold
                        text-primary
                        sm:text-xs
                      "
                    >
                      View Categories
                    </span>

                    <ChevronRight
                      size={15}
                      className="
                        text-primary
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

      <div className="h-8 sm:h-12" />
    </div>
  );
}

// ==========================================
// BRAND SKELETON
// ==========================================
function BrandSkeletonGrid() {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:gap-4
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
      "
    >
      {Array.from({
        length: 10,
      }).map((_, index) => (
        <div
          key={index}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
          "
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />

          <div className="space-y-3 p-3 sm:p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}