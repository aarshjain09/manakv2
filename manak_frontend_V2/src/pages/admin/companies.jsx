import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";

import CompanyModal from "../../components/admin/CompanyModal";
import api from "../../services/api";

export default function Companies() {
  /* ============================================
                STATES
  ============================================ */

  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingCompany, setEditingCompany] = useState(null);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  /* ============================================
                LOAD COMPANIES
  ============================================ */

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await api.get("/companies");

      setCompanies(res.data);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  /* ============================================
                SEARCH
  ============================================ */

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [companies, search]);

  /* ============================================
                OPEN ADD
  ============================================ */

  const handleAdd = () => {
    setEditingCompany(null);

    setModalOpen(true);
  };

  /* ============================================
                OPEN EDIT
  ============================================ */

  const handleEdit = (company) => {
    setEditingCompany(company);

    setModalOpen(true);
  };

  /* ============================================
                CLOSE MODAL
  ============================================ */

  const closeModal = () => {
    setModalOpen(false);

    setEditingCompany(null);
  };
    /* ============================================
                SAVE COMPANY
  ============================================ */

  const saveCompany = async (formData) => {
    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("displayOrder", formData.displayOrder);
      payload.append("isActive", formData.isActive);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (editingCompany) {
        await api.put(
          `/companies/${editingCompany._id}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Company updated successfully.");
      } else {
        await api.post("/companies", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Company created successfully.");
      }

      closeModal();

      fetchCompanies();
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

  const toggleStatus = async (company) => {
    try {
      await api.patch(
        `/companies/${company._id}/status`
      );

      toast.success(
        `Company ${
          company.isActive
            ? "deactivated"
            : "activated"
        }`
      );

      fetchCompanies();
    } catch (err) {
      console.error(err);

      toast.error("Unable to update status.");
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
            Companies
          </h1>

          <p className="text-slate-500 mt-1">
            Manage companies, logos and display order.
          </p>

        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <Plus size={18} />

          Add Company

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
              placeholder="Search company..."
              className="w-full h-12 pl-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

          <p className="text-sm text-slate-500">

            Total Companies :

            <span className="font-semibold ml-2">

              {filteredCompanies.length}

            </span>

          </p>

        </div>

      </div>

            {/* Table */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">

        {loading ? (

          <div className="h-80 flex items-center justify-center">

            <p className="text-slate-500">
              Loading companies...
            </p>

          </div>

        ) : filteredCompanies.length === 0 ? (

          <div className="h-80 flex flex-col items-center justify-center">

            <p className="text-2xl">🏢</p>

            <h2 className="text-xl font-semibold mt-4">
              No Companies Found
            </h2>

            <p className="text-slate-500 mt-2">
              Create your first company to get started.
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

              {filteredCompanies.map((company, index) => (

                <tr
                  key={company._id}
                  className={`border-t hover:bg-blue-50 transition ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50"
                  }`}
                >

                  <td className="px-6 py-4">

                    <img
                      src={company.image}
                      alt={company.name}
                      className="w-14 h-14 rounded-xl border object-cover"
                    />

                  </td>

                  <td className="px-6 py-4">

                    <h3 className="font-semibold text-slate-800">

                      {company.name}

                    </h3>

                    <p className="text-xs text-slate-500 mt-1">

                      Created{" "}
                      {new Date(
                        company.createdAt
                      ).toLocaleDateString()}

                    </p>

                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        company.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {company.isActive
                        ? "Active"
                        : "Inactive"}

                    </span>

                  </td>

                  <td className="px-6 py-4 font-semibold">

                    {company.displayOrder}

                  </td>

                  <td className="px-6 py-4">

                    {new Date(
                      company.createdAt
                    ).toLocaleDateString()}

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          handleEdit(company)
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
                          toggleStatus(company)
                        }
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                          company.isActive
                            ? "bg-red-100 hover:bg-red-200"
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                      >

                        <Power
                          size={18}
                          className={
                            company.isActive
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

            {filteredCompanies.length}

          </span>

          companies

        </p>

      </div>

      {/* Modal */}

      <CompanyModal
        open={modalOpen}
        company={editingCompany}
        loading={saving}
        onClose={closeModal}
        onSave={saveCompany}
      />

    </div>
  );
}
