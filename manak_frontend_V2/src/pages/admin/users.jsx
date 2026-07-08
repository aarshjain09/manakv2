import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Power,
  Users as UsersIcon,
  Store,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import UserModal from "../../components/admin/UserModal";

export default function Users() {
  /* ============================================
                    STATES
  ============================================ */

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  /* ============================================
                  FETCH USERS
  ============================================ */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/users");

      setUsers(res.data);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ============================================
                  FILTER USERS
  ============================================ */

  const filteredUsers = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      /* Hide admin from normal management table */

      if (user.role === "admin") {
        return false;
      }

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesSearch =
        !keyword ||
        user.ownerName
          ?.toLowerCase()
          .includes(keyword) ||
        user.shopName
          ?.toLowerCase()
          .includes(keyword) ||
        user.email
          ?.toLowerCase()
          .includes(keyword) ||
        user.phone
          ?.toLowerCase()
          .includes(keyword) ||
        user.address
          ?.toLowerCase()
          .includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  /* ============================================
                    COUNTS
  ============================================ */

  const customerCount = users.filter(
    (user) => user.role === "customer"
  ).length;

  const workerCount = users.filter(
    (user) => user.role === "worker"
  ).length;

  const managedUserCount =
    customerCount + workerCount;

  /* ============================================
                    ADD USER
  ============================================ */

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  /* ============================================
                    EDIT USER
  ============================================ */

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  /* ============================================
                  CLOSE MODAL
  ============================================ */

  const closeModal = () => {
    setEditingUser(null);
    setModalOpen(false);
  };

  /* ============================================
                    SAVE USER
  ============================================ */

  const saveUser = async (formData) => {
    try {
      setSaving(true);

      const payload = {
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      /* Password */

      if (formData.password?.trim()) {
        payload.password =
          formData.password.trim();
      }

      /* Customer-only fields */

      if (formData.role === "customer") {
        payload.shopName =
          formData.shopName;

        payload.address =
          formData.address;
        payload.customerCode =
  formData.customerCode?.trim() || "";
        payload.priceTier =
          formData.priceTier;
      }

      if (editingUser) {
        await api.put(
          `/users/${editingUser._id}`,
          payload
        );

        toast.success(
          "User updated successfully."
        );
      } else {
        await api.post(
          "/users",
          payload
        );

        toast.success(
          "User created successfully."
        );
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
                  TOGGLE STATUS
  ============================================ */

  const toggleStatus = async (user) => {
    try {
      await api.patch(
        `/users/${user._id}/status`
      );

      toast.success(
        `User ${
          user.isActive
            ? "deactivated"
            : "activated"
        }`
      );

      fetchUsers();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Unable to update user status."
      );
    }
  };

  /* ============================================
                        JSX
  ============================================ */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Users
          </h1>

          <p className="text-slate-500 mt-1">
            Manage customers and workers.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add User
        </button>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Users
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {managedUserCount}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <UsersIcon
                size={23}
                className="text-purple-600"
              />
            </div>

          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Customers
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {customerCount}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Store
                size={23}
                className="text-blue-600"
              />
            </div>

          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Workers
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {workerCount}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShieldCheck
                size={23}
                className="text-green-600"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Search + Filters */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-5">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* Search */}

          <div className="relative w-full max-w-md">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search name, shop, email or phone..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

          {/* Role Filters */}

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">

            <button
              onClick={() =>
                setRoleFilter("all")
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                roleFilter === "all"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              All
            </button>

            <button
              onClick={() =>
                setRoleFilter("customer")
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                roleFilter === "customer"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Customers
            </button>

            <button
              onClick={() =>
                setRoleFilter("worker")
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                roleFilter === "worker"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Workers
            </button>

          </div>

        </div>

      </div>

      {/* Users Table */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">

        {loading ? (

          <div className="h-80 flex items-center justify-center">
            <p className="text-slate-500">
              Loading users...
            </p>
          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="h-80 flex flex-col items-center justify-center text-center px-4">

            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">

              <UsersIcon
                size={30}
                className="text-purple-600"
              />

            </div>

            <h2 className="text-xl font-semibold text-slate-800 mt-4">
              No Users Found
            </h2>

            <p className="text-slate-500 mt-2">
              Add your first customer or worker.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-slate-100">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    User
                  </th>
                  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Contact
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Shop
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Price Tier
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Created
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map(
                  (user, index) => (

                    <tr
                      key={user._id}
                      className={`border-t border-slate-200 hover:bg-purple-50/50 transition ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }`}
                    >

                      {/* User */}

                    <td className="px-6 py-4">

  <div className="flex items-center gap-3">

    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
        user.role === "worker"
          ? "bg-green-100 text-green-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {user.ownerName
        ?.charAt(0)
        ?.toUpperCase() || "U"}
    </div>

    <div>

      <p className="font-semibold text-slate-800">
        {user.ownerName}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {user.email}
      </p>

      {/* Customer Code */}

      {user.role === "customer" && (
        <p className="text-xs mt-1">
          <span className="text-slate-400">
            Customer ID:
          </span>{" "}
          <span className="font-semibold text-purple-700">
            {user.customerCode || "Not Assigned"}
          </span>
        </p>
      )}

    </div>

  </div>

</td>
                      {/* Contact */}

                      <td className="px-6 py-4 text-slate-600">
                        {user.phone || "—"}
                      </td>

                      {/* Shop */}

                      <td className="px-6 py-4">

                        {user.role === "customer" ? (
                          <div>
                            <p className="font-medium text-slate-700">
                              {user.shopName || "—"}
                            </p>

                            {user.address && (
                              <p className="text-xs text-slate-500 mt-1 max-w-[220px] truncate">
                                {user.address}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* Role */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.role === "worker"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {user.role === "worker"
                            ? "Worker"
                            : "Customer"}
                        </span>

                      </td>

                      {/* Price Tier */}

                      <td className="px-6 py-4">

                        {user.role === "customer" ? (
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold">
                            {user.priceTier || "C"}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      {/* Created */}

                      <td className="px-6 py-4 text-slate-600">

                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-3">

                          <button
                            onClick={() =>
                              handleEdit(user)
                            }
                            title="Edit User"
                            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition"
                          >
                            <Pencil
                              size={18}
                              className="text-blue-600"
                            />
                          </button>

                          <button
                            onClick={() =>
                              toggleStatus(user)
                            }
                            title={
                              user.isActive
                                ? "Deactivate User"
                                : "Activate User"
                            }
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                              user.isActive
                                ? "bg-red-100 hover:bg-red-200"
                                : "bg-green-100 hover:bg-green-200"
                            }`}
                          >
                            <Power
                              size={18}
                              className={
                                user.isActive
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Footer Count */}

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">
          Showing
          <span className="font-semibold mx-1 text-slate-700">
            {filteredUsers.length}
          </span>
          users
        </p>

      </div>

      {/* User Modal */}

      <UserModal
        open={modalOpen}
        user={editingUser}
        loading={saving}
        onClose={closeModal}
        onSave={saveUser}
      />

    </div>
  );
}