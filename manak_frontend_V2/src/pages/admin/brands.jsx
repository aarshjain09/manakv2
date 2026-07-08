import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import BrandModal from "../../components/admin/BrandModal";

export default function Brands() {

  /* ============================================
                  STATES
  ============================================ */

  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingBrand, setEditingBrand] = useState(null);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  /* ============================================
                LOAD BRANDS
  ============================================ */

  const fetchBrands = async () => {
    try {

      setLoading(true);

      const res = await api.get("/brands");

      setBrands(res.data);

    } catch (err) {

      console.error(err);

      toast.error("Failed to load brands.");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  /* ============================================
                    SEARCH
  ============================================ */

  const filteredBrands = useMemo(() => {

    return brands.filter((brand) => {

      const keyword = search.toLowerCase();

      return (
        brand.name.toLowerCase().includes(keyword) ||
        brand.company?.name
          ?.toLowerCase()
          .includes(keyword)
      );

    });

  }, [brands, search]);

  /* ============================================
                ADD BRAND
  ============================================ */

  const handleAdd = () => {

    setEditingBrand(null);

    setModalOpen(true);

  };

  /* ============================================
                EDIT BRAND
  ============================================ */

  const handleEdit = (brand) => {

    setEditingBrand(brand);

    setModalOpen(true);

  };

  /* ============================================
                CLOSE MODAL
  ============================================ */

  const closeModal = () => {

    setEditingBrand(null);

    setModalOpen(false);

  };
    /* ============================================
                SAVE BRAND
  ============================================ */

  const saveBrand = async (formData) => {
    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("company", formData.company);
      payload.append(
        "displayOrder",
        formData.displayOrder
      );
      payload.append("isActive", formData.isActive);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (editingBrand) {
        await api.put(
          `/brands/${editingBrand._id}`,
          payload
        );

        toast.success("Brand updated successfully.");
      } else {
        await api.post(
          "/brands",
          payload
        );

        toast.success("Brand created successfully.");
      }

      closeModal();

      fetchBrands();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setSaving(false);

    }
  };

  /* ============================================
                TOGGLE STATUS
  ============================================ */

  const toggleStatus = async (brand) => {
    try {

      await api.patch(
        `/brands/${brand._id}/status`
      );

      toast.success(
        `Brand ${
          brand.isActive
            ? "deactivated"
            : "activated"
        }`
      );

      fetchBrands();

    } catch (err) {

      console.error(err);

      toast.error(
        "Unable to update status."
      );

    }
  };

  /* ============================================
                    JSX
  ============================================ */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">

            Brands

          </h1>

          <p className="text-slate-500 mt-1">

            Manage brands and their companies.

          </p>

        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
        >

          <Plus size={18} />

          Add Brand

        </button>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-5">

        <div className="flex justify-between items-center">

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
              placeholder="Search brand..."
              className="w-full h-12 pl-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

          <p className="text-sm text-slate-500">

            Total Brands :

            <span className="font-semibold ml-2">

              {filteredBrands.length}

            </span>

          </p>

        </div>

      </div>
            {/* Table */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">

        {loading ? (

          <div className="h-80 flex items-center justify-center">

            <p className="text-slate-500">
              Loading brands...
            </p>

          </div>

        ) : filteredBrands.length === 0 ? (

          <div className="h-80 flex flex-col items-center justify-center">

            <p className="text-2xl">🏷️</p>

            <h2 className="text-xl font-semibold mt-4">

              No Brands Found

            </h2>

            <p className="text-slate-500 mt-2">

              Create your first brand to get started.

            </p>

          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left px-6 py-4">
                  Logo
                </th>

                <th className="text-left px-6 py-4">
                  Brand
                </th>

                <th className="text-left px-6 py-4">
                  Company
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>

                <th className="text-left px-6 py-4">
                  Display Order
                </th>

                <th className="text-left px-6 py-4">
                  Created
                </th>

                <th className="text-center px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBrands.map((brand, index) => (

                <tr
                  key={brand._id}
                  className={`border-t hover:bg-blue-50 transition ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50"
                  }`}
                >

                  {/* Logo */}

                  <td className="px-6 py-4">

                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-14 h-14 rounded-xl border object-cover"
                    />

                  </td>

                  {/* Brand */}

                  <td className="px-6 py-4">

                    <h3 className="font-semibold text-slate-800">

                      {brand.name}

                    </h3>

                    <p className="text-xs text-slate-500 mt-1">

                      Created{" "}
                      {new Date(
                        brand.createdAt
                      ).toLocaleDateString()}

                    </p>

                  </td>

                  {/* Company */}

                  <td className="px-6 py-4">

                    <span className="font-medium text-slate-700">

                      {brand.company?.name}

                    </span>

                  </td>

                  {/* Status */}

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        brand.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >

                      {brand.isActive
                        ? "Active"
                        : "Inactive"}

                    </span>

                  </td>

                  {/* Display Order */}

                  <td className="px-6 py-4 font-semibold">

                    {brand.displayOrder}

                  </td>

                  {/* Created */}

                  <td className="px-6 py-4">

                    {new Date(
                      brand.createdAt
                    ).toLocaleDateString()}

                  </td>

                  {/* Actions */}

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          handleEdit(brand)
                        }
                        className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition"
                      >

                        <Pencil
                          size={18}
                          className="text-blue-600"
                        />

                      </button>

                      <button
                        onClick={() =>
                          toggleStatus(brand)
                        }
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                          brand.isActive
                            ? "bg-red-100 hover:bg-red-200"
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                      >

                        <Power
                          size={18}
                          className={
                            brand.isActive
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        />

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">

          Showing

          <span className="font-semibold mx-1">

            {filteredBrands.length}

          </span>

          brands

        </p>

      </div>

      {/* Modal */}

      <BrandModal
        open={modalOpen}
        brand={editingBrand}
        loading={saving}
        onClose={closeModal}
        onSave={saveBrand}
      />

    </div>
  );
}