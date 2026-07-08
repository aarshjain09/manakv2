import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Power,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";

import CategoryModal from "../../components/admin/CategoryModal";

export default function Categories() {
  // ============================================
  // STATES
  // ============================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  // ============================================
  // LOAD CATEGORIES
  // ============================================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res =
        await api.get(
          "/categories"
        );

      setCategories(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Load categories error:",
        err
      );

      toast.error(
        "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================
  // SEARCH
  // ============================================

  const filteredCategories =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return categories;
      }

      return categories.filter(
        (category) =>
          String(
            category.name || ""
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      categories,
      search,
    ]);

  // ============================================
  // ADD CATEGORY
  // ============================================

  const handleAdd = () => {
    setEditingCategory(null);

    setModalOpen(true);
  };

  // ============================================
  // EDIT CATEGORY
  // ============================================

  const handleEdit = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setModalOpen(true);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setEditingCategory(null);

    setModalOpen(false);
  };

  // ============================================
  // SAVE CATEGORY
  // ============================================

  const saveCategory = async (
    formData
  ) => {
    try {
      setSaving(true);

      const payload =
        new FormData();

      // ----------------------------------------
      // GLOBAL CATEGORY NAME
      // ----------------------------------------
      payload.append(
        "name",
        String(
          formData.name || ""
        ).trim()
      );

      // ----------------------------------------
      // DISPLAY ORDER
      // ----------------------------------------
      payload.append(
        "displayOrder",
        String(
          Number(
            formData.displayOrder
          ) || 0
        )
      );

      // ----------------------------------------
      // ACTIVE STATUS
      //
      // Mainly useful during edit.
      // ----------------------------------------
      payload.append(
        "isActive",
        String(
          formData.isActive ??
            true
        )
      );

      // ----------------------------------------
      // IMAGE
      // ----------------------------------------
      if (formData.image) {
        payload.append(
          "image",
          formData.image
        );
      }

      // ----------------------------------------
      // UPDATE
      // ----------------------------------------
      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory._id}`,
          payload
        );

        toast.success(
          "Category updated successfully."
        );
      }

      // ----------------------------------------
      // CREATE
      // ----------------------------------------
      else {
        await api.post(
          "/categories",
          payload
        );

        toast.success(
          "Category created successfully."
        );
      }

      setEditingCategory(null);

      setModalOpen(false);

      await fetchCategories();
    } catch (err) {
      console.error(
        "Save category error:",
        err
      );

      toast.error(
        err.response?.data
          ?.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // TOGGLE STATUS
  // ============================================

  const toggleStatus = async (
    category
  ) => {
    try {
      await api.patch(
        `/categories/${category._id}/status`
      );

      toast.success(
        `Category ${
          category.isActive
            ? "deactivated"
            : "activated"
        }`
      );

      await fetchCategories();
    } catch (err) {
      console.error(
        "Toggle category error:",
        err
      );

      toast.error(
        err.response?.data
          ?.message ||
          "Unable to update status."
      );
    }
  };

  // ============================================
  // JSX
  // ============================================

  return (
    <div className="space-y-6">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Categories
          </h1>

          <p className="mt-1 text-slate-500">
            Manage global product
            categories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-blue-700
          "
        >
          <Plus size={18} />

          Add Category
        </button>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search category..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                pl-12
                pr-4
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </div>

          <p className="text-sm text-slate-500">
            Total Categories:

            <span className="ml-2 font-semibold text-slate-800">
              {
                filteredCategories.length
              }
            </span>
          </p>
        </div>
      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-slate-500">
              Loading categories...
            </p>
          </div>
        ) : filteredCategories.length ===
          0 ? (
          <div className="flex h-80 flex-col items-center justify-center">
            <p className="text-2xl">
              📂
            </p>

            <h2 className="mt-4 text-xl font-semibold text-slate-800">
              No Categories Found
            </h2>

            <p className="mt-2 text-slate-500">
              {search
                ? "No category matches your search."
                : "Create your first category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    Image
                  </th>

                  <th className="px-6 py-4 text-left">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left">
                    Display Order
                  </th>

                  <th className="px-6 py-4 text-left">
                    Created
                  </th>

                  <th className="px-6 py-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map(
                  (
                    category,
                    index
                  ) => (
                    <tr
                      key={
                        category._id
                      }
                      className={`
                        border-t
                        transition
                        hover:bg-blue-50
                        ${
                          index % 2 ===
                          0
                            ? "bg-white"
                            : "bg-slate-50"
                        }
                      `}
                    >
                      {/* IMAGE */}

                      <td className="px-6 py-4">
                        {category.image ? (
                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name
                            }
                            className="
                              h-14
                              w-14
                              rounded-xl
                              border
                              border-slate-200
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-14
                              w-14
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-100
                              text-xl
                            "
                          >
                            📂
                          </div>
                        )}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-6 py-4">
                        <h3 className="font-semibold text-slate-800">
                          {
                            category.name
                          }
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Global category
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            ${
                              category.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          `}
                        >
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* DISPLAY ORDER */}

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">
                          {
                            category.displayOrder ??
                            0
                          }
                        </span>
                      </td>

                      {/* CREATED */}

                      <td className="px-6 py-4 text-slate-600">
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                category
                              )
                            }
                            aria-label={`Edit ${category.name}`}
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              bg-blue-100
                              transition
                              hover:bg-blue-200
                            "
                          >
                            <Pencil
                              size={18}
                              className="text-blue-600"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(
                                category
                              )
                            }
                            aria-label={
                              category.isActive
                                ? `Deactivate ${category.name}`
                                : `Activate ${category.name}`
                            }
                            className={`
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              transition
                              ${
                                category.isActive
                                  ? "bg-red-100 hover:bg-red-200"
                                  : "bg-green-100 hover:bg-green-200"
                              }
                            `}
                          >
                            <Power
                              size={18}
                              className={
                                category.isActive
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

      {/* ======================================
          FOOTER
      ====================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing

          <span className="mx-1 font-semibold text-slate-700">
            {
              filteredCategories.length
            }
          </span>

          categories
        </p>
      </div>

      {/* ======================================
          CATEGORY MODAL
      ====================================== */}

      <CategoryModal
        open={modalOpen}
        category={
          editingCategory
        }
        loading={saving}
        onClose={closeModal}
        onSave={saveCategory}
      />
    </div>
  );
}