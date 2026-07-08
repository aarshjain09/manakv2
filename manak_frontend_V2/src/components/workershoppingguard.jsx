import {
  useContext,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  AuthContext,
} from "../context/auth";

import {
  WorkerCustomerContext,
} from "../context/workercustomer";

export default function WorkerShoppingGuard({
  children,
}) {
  const {
    user,
  } = useContext(AuthContext);

  const {
    selectedCustomer,
    loading,
  } = useContext(
    WorkerCustomerContext
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-600">
          Loading...
        </p>
      </div>
    );
  }

  // Normal customer:
  // no worker customer selection required
  if (user?.role !== "worker") {
    return children;
  }

  // Worker without selected customer
  if (!selectedCustomer) {
    return (
      <Navigate
        to="/worker/customer"
        replace
      />
    );
  }

  return children;
}