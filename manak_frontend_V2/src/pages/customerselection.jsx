import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Check,
  Loader2,
  LogOut,
  Search,
  Store,
  UserRound,
  Phone,
  Hash,
} from "lucide-react";

import API from "../services/api";

import {
  AuthContext,
} from "../context/auth";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

export default function CustomerSelection() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useContext(AuthContext);

  const {
    selectedCustomer,
    selectCustomer,
    clearSelectedCustomer,
  } = useContext(
    WorkerCustomerContext
  );

  const [customers, setCustomers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    pendingCustomer,
    setPendingCustomer,
  ] = useState(
    selectedCustomer || null
  );

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          If your backend customer endpoint
          differs, only change this URL.
        */
        const res = await API.get(
          "/users/worker/customers"
        );

        const data = Array.isArray(
          res.data
        )
          ? res.data
          : res.data?.users || [];

        // Only active customers
        

        setCustomers(data);
      } catch (err) {
        console.error(
          "Failed to load customers:",
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data?.message ||
            "Failed to load customers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // ==========================================
  // FILTER CUSTOMERS
  // ==========================================
  const filteredCustomers = useMemo(() => {
  const keyword = String(search || "")
    .trim()
    .toLowerCase();

  if (!keyword) {
    return customers;
  }

  return customers.filter((customer) => {
    const searchableText = [
      customer.shopName,
      customer.ownerName,
      customer.customerCode,
      customer.phone,
      customer.email,
      customer.address,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .map((value) => {
        // Address may be an object
        if (
          typeof value === "object"
        ) {
          return Object.values(value)
            .filter(Boolean)
            .join(" ");
        }

        return String(value);
      })
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      keyword
    );
  });
}, [customers, search]);
  // ==========================================
  // SELECT CARD
  // ==========================================
  const handleSelect = (
    customer
  ) => {
    setPendingCustomer(customer);
  };

  // ==========================================
  // PROCEED
  // ==========================================
  const handleProceed = () => {
    if (!pendingCustomer) {
      return;
    }

    selectCustomer(
      pendingCustomer
    );

    navigate("/home", {
      replace: true,
    });
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    clearSelectedCustomer();
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================
          TOP HEADER
      ===================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-950">
              MANAK
            </h1>

            <p className="text-xs text-slate-500">
              Worker Order Entry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.ownerName ||
                  user?.name ||
                  "Worker"}
              </p>

              <p className="text-xs text-slate-500">
                Worker Account
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN
      ===================================== */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* INTRO */}
        <section className="overflow-hidden rounded-2xl bg-slate-950 px-5 py-6 sm:rounded-3xl sm:px-8 sm:py-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <Store size={14} />

              Start New Order
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Select the customer you are
              ordering for
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Search by customer code, shop
              name, owner name, or phone
              number. After proceeding, you
              will enter the complete MANAK
              catalogue.
            </p>

            {/* SEARCH */}
            <div className="mt-6 flex max-w-2xl items-center rounded-xl bg-white p-1.5 shadow-xl">
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
                placeholder="Search customer, shop, code or phone..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
              />
            </div>
          </div>
        </section>

        {/* =====================================
            SELECTED CUSTOMER
        ===================================== */}
        {pendingCustomer && (
          <section className="sticky top-3 z-20 mt-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Check size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Selected Customer
                  </p>

                  <h3 className="truncate font-bold text-slate-950">
                    {pendingCustomer.shopName ||
                      pendingCustomer.ownerName}
                  </h3>

                  <p className="truncate text-xs text-slate-500">
                    {pendingCustomer.customerCode ||
                      "No customer code"}
                    {pendingCustomer.ownerName
                      ? ` · ${pendingCustomer.ownerName}`
                      : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceed}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Proceed to Catalogue

                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* =====================================
            CUSTOMER LIST
        ===================================== */}
        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Customers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredCustomers.length}{" "}
                available
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-primary"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading customers...
                </p>
              </div>
            </div>
          ) : error ? (
            /* ERROR */
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>
            </div>
          ) : filteredCustomers.length ===
            0 ? (
            /* EMPTY */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <Store
                size={30}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another shop name,
                customer code, owner, or
                phone number.
              </p>
            </div>
          ) : (
            /* GRID */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCustomers.map(
                (customer) => {
                  const isSelected =
                    String(
                      pendingCustomer?._id ||
                        ""
                    ) ===
                    String(
                      customer._id
                    );

                  return (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() =>
                        handleSelect(
                          customer
                        )
                      }
                      className={`relative rounded-2xl border p-4 text-left shadow-sm transition ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check
                            size={15}
                          />
                        </div>
                      )}

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Store size={21} />
                      </div>

                      <h3 className="mt-4 truncate pr-8 font-bold text-slate-950">
                        {customer.shopName ||
                          "Unnamed Shop"}
                      </h3>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <UserRound
                            size={14}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {customer.ownerName ||
                              "No owner name"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Hash
                            size={14}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {customer.customerCode ||
                              "No customer code"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone
                            size={14}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {customer.phone ||
                              "No phone"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}