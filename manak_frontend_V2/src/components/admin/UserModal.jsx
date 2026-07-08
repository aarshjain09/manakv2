import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Store,
  MapPin,
  ShieldCheck,
  BadgeIndianRupee,
} from "lucide-react";

export default function UserModal({
  open,
  onClose,
  onSave,
  loading = false,
  user = null,
}) {
  const [formData, setFormData] = useState({
    ownerName: "",
    shopName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
    customerCode: "",
    priceTier: "A",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user.ownerName || "",
        shopName: user.shopName || "",
        phone: user.phone || "",
        email: user.email || "",
        password: "",
        address: user.address || "",
        role: user.role || "customer",
        customerCode:user.customerCode || "",
        priceTier: user.priceTier || "A",
        isActive:
          user.isActive !== undefined
            ? user.isActive
            : true,
      });
    } else {
      setFormData({
        ownerName: "",
        shopName: "",
        phone: "",
        email: "",
        password: "",
        address: "",
        role: "customer",
        customerCode: "",
        priceTier: "A",
        isActive: true,
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

      ...(name === "role" &&
      value === "worker"
        ? {
            shopName: "",
            address: "",
            priceTier: "A",
          }
        : {}),
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!formData.ownerName.trim()) {
      return alert("Name is required");
    }

    if (!formData.email.trim()) {
      return alert("Email is required");
    }

    if (!user && !formData.password.trim()) {
      return alert(
        "Password is required for new user"
      );
    }

    if (
      formData.role === "customer" &&
      !formData.shopName.trim()
    ) {
      return alert(
        "Shop name is required for customer"
      );
    }

    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5 shrink-0">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {user
                ? "Edit User"
                : "Add User"}
            </h2>

            <p className="text-slate-500 mt-1">
              {user
                ? "Update user information"
                : "Create a customer or worker account"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* Scrollable Form */}

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >

          {/* Role */}

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              User Role
            </label>

            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "customer",
                  }))
                }
                className={`border-2 rounded-xl p-4 text-left transition ${
                  formData.role === "customer"
                    ? "border-primary bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Store
                      size={20}
                      className="text-purple-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Customer
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Shop ordering account
                    </p>
                  </div>

                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "worker",
                    shopName: "",
                    address: "",
                    priceTier: "A",
                  }))
                }
                className={`border-2 rounded-xl p-4 text-left transition ${
                  formData.role === "worker"
                    ? "border-primary bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Worker
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Order entry account
                    </p>
                  </div>

                </div>
              </button>

            </div>
          </div>

          {/* Name */}

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              {formData.role === "customer"
                ? "Owner Name"
                : "Worker Name"}
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder={
                  formData.role === "customer"
                    ? "Enter owner name"
                    : "Enter worker name"
                }
                className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
              />

            </div>
          </div>
          {formData.role === "customer" && (
  <div>
    <label className="block mb-2 font-medium">
      Customer ID
    </label>

    <input
      name="customerCode"
      value={formData.customerCode}
      onChange={handleChange}
      placeholder="Enter Marg Customer ID"
      className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
    />

    <p className="text-xs text-slate-500 mt-2">
      Assigned by admin for Marg mapping.
    </p>
  </div>
)}

          {/* Phone + Email */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                />

              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                />

              </div>
            </div>

          </div>

          {/* Password */}

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  user
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
              />

            </div>

            {user && (
              <p className="text-xs text-slate-500 mt-2">
                Leave blank if you do not want to change the password.
              </p>
            )}
          </div>

          {/* Customer-only Fields */}

          {formData.role === "customer" && (
            <>

              {/* Shop Name */}

              <div>
                <label className="block mb-2 font-medium text-slate-700">
                  Shop Name
                </label>

                <div className="relative">

                  <Store
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="Enter shop name"
                    className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                  />

                </div>
              </div>

              {/* Price Tier */}

              <div>
                <label className="block mb-2 font-medium text-slate-700">
                  Customer Price Tier
                </label>

                <div className="grid grid-cols-3 gap-3">

                  {["A", "B", "C"].map(
                    (tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            priceTier: tier,
                          }))
                        }
                        className={`h-14 rounded-xl border-2 font-bold transition ${
                          formData.priceTier === tier
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <BadgeIndianRupee size={18} />
                          Price {tier}
                        </span>
                      </button>
                    )
                  )}

                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Product prices will be selected automatically using this tier.
                </p>
              </div>

              {/* Address */}

              <div>
                <label className="block mb-2 font-medium text-slate-700">
                  Address
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter shop address"
                    rows={4}
                    className="w-full border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none"
                  />

                </div>
              </div>

            </>
          )}

          {/* Active */}

          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <p className="font-medium text-slate-800">
                Active Account
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Inactive users cannot log in.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`relative w-12 h-7 rounded-full transition ${
                formData.isActive
                  ? "bg-primary"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  formData.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          {/* Footer */}

          <div className="sticky bottom-0 bg-white border-t pt-5 pb-1 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading
                ? "Saving..."
                : user
                ? "Update User"
                : "Create User"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}