import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Store,
  Phone,
  Mail,
  MapPin,
  Hash,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { AuthContext } from "../context/auth";

export default function Profile() {
  const navigate = useNavigate();

  const { user, logout } =
    useContext(AuthContext);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  // ==========================================
  // USER FALLBACK
  // ==========================================
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <User
              size={30}
              className="text-slate-400"
            />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Profile unavailable
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Please log in again to view
            your account.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/", {
                replace: true,
              })
            }
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DISPLAY VALUES
  // ==========================================
  const displayName =
    user.ownerName ||
    user.shopName ||
    "Customer";

  const initials =
    getInitials(displayName);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* =====================================
          PAGE HEADER
      ===================================== */}
      <section className="mb-5 sm:mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          My Account
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your shop and account
          information
        </p>
      </section>

      {/* =====================================
          PROFILE HERO
      ===================================== */}
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:mb-7">
        {/* TOP ACCENT */}
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* AVATAR */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-3xl">
              {initials}
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
                  {displayName}
                </h2>

                <AccountStatus
                  isActive={
                    user.isActive !== false
                  }
                />
              </div>

              {/* SHOP NAME */}
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Store size={15} />

                <span className="truncate">
                  {user.shopName ||
                    "Shop name unavailable"}
                </span>
              </div>

              {/* CUSTOMER CODE */}
              {user.customerCode && (
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <Hash size={13} />

                    {user.customerCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTENT GRID
      ===================================== */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ===================================
            SHOP DETAILS
        =================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          {/* SECTION HEADER */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Shop Information
              </h2>

              <p className="text-xs text-slate-500 sm:text-sm">
                Your registered business
                details
              </p>
            </div>
          </div>

          {/* DETAILS */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ProfileField
              icon={Store}
              label="Shop Name"
              value={
                user.shopName ||
                "Not provided"
              }
            />

            <ProfileField
              icon={User}
              label="Owner Name"
              value={
                user.ownerName ||
                "Not provided"
              }
            />

            <ProfileField
              icon={Hash}
              label="Customer Code"
              value={
                user.customerCode ||
                "Not assigned"
              }
            />

            <div className="sm:col-span-2">
              <ProfileField
                icon={MapPin}
                label="Address"
                value={formatAddress(
                  user.address
                )}
              />
            </div>
          </div>
        </section>

        {/* ===================================
            ACCOUNT SUMMARY
        =================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {/* SECTION HEADER */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Account
              </h2>

              <p className="text-xs text-slate-500">
                Customer account summary
              </p>
            </div>
          </div>

          {/* ACCOUNT DETAILS */}
          <div className="mt-5 space-y-3">
            <SummaryRow
              label="Status"
              value={
                user.isActive !== false
                  ? "Active"
                  : "Inactive"
              }
            />

            <SummaryRow
              label="Role"
              value={formatRole(
                user.role
              )}
            />
          </div>

          {/* ORDERS LINK */}
          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
            className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            View My Orders

            <ChevronRight size={17} />
          </button>
        </section>

        {/* ===================================
            CONTACT DETAILS
        =================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          {/* SECTION HEADER */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Phone size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Contact Information
              </h2>

              <p className="text-xs text-slate-500 sm:text-sm">
                Registered contact details
              </p>
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ProfileField
              icon={Phone}
              label="Phone Number"
              value={
                user.phone ||
                "Not provided"
              }
            />

            <ProfileField
              icon={Mail}
              label="Email Address"
              value={
                user.email ||
                "Not provided"
              }
            />
          </div>
        </section>

        {/* ===================================
            LOGOUT
        =================================== */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <LogOut size={19} />
          </div>

          <h2 className="mt-4 font-bold text-red-950">
            Sign Out
          </h2>

          <p className="mt-1 text-sm text-red-700/80">
            End your current MANAK
            session on this device.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <LogOut size={17} />

            Logout
          </button>
        </section>
      </div>

      <div className="h-8 sm:h-12" />
    </div>
  );
}

// ==========================================
// PROFILE FIELD
// ==========================================
function ProfileField({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// ACCOUNT STATUS
// ==========================================
function AccountStatus({
  isActive,
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset sm:text-xs ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-red-200"
      }`}
    >
      {isActive
        ? "Active"
        : "Inactive"}
    </span>
  );
}

// ==========================================
// SUMMARY ROW
// ==========================================
function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}

// ==========================================
// GET INITIALS
// ==========================================
function getInitials(value) {
  if (!value) {
    return "CU";
  }

  const words = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

// ==========================================
// FORMAT ADDRESS
// ==========================================
function formatAddress(address) {
  if (!address) {
    return "Not provided";
  }

  if (typeof address === "string") {
    return address;
  }

  if (
    typeof address === "object"
  ) {
    const formatted =
      Object.values(address)
        .filter(Boolean)
        .join(", ");

    return (
      formatted ||
      "Not provided"
    );
  }

  return "Not provided";
}

// ==========================================
// FORMAT ROLE
// ==========================================
function formatRole(role) {
  if (!role) {
    return "Customer";
  }

  const value = String(role);

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}