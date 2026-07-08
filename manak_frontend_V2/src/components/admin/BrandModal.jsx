import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import api from "../../services/api";

export default function BrandModal({
  open,
  onClose,
  onSave,
  loading = false,
  brand = null,
}) {
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    displayOrder: 0,
    isActive: true,
    image: null,
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!open) return;

    fetchCompanies();
  }, [open]);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        company: brand.company?._id || brand.company || "",
        displayOrder: brand.displayOrder || 0,
        isActive: brand.isActive,
        image: null,
      });

      setPreview(brand.image || "");
    } else {
      setFormData({
        name: "",
        company: "",
        displayOrder: 0,
        isActive: true,
        image: null,
      });

      setPreview("");
    }
  }, [brand]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");

      setCompanies(
        res.data.filter((company) => company.isActive)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return alert("Brand name is required");
    }

    if (!formData.company) {
      return alert("Please select a company");
    }

    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="border-b px-6 py-5 shrink-0">

          <div>

            <h2 className="text-2xl font-bold">

              {brand ? "Edit Brand" : "Add Brand"}

            </h2>

            <p className="text-slate-500 mt-1">

              Manage brand information

            </p>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <form
          onSubmit={submit}
         
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >

          {/* Brand Name */}

          <div>

            <label className="block mb-2 font-medium">

              Brand Name

            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter brand name"
              className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

          {/* Company */}

          <div>

            <label className="block mb-2 font-medium">

              Company

            </label>

            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
            >

              <option value="">

                Select Company

              </option>

              {companies.map((company) => (

                <option
                  key={company._id}
                  value={company._id}
                >

                  {company.name}

                </option>

              ))}

            </select>

          </div>

          {/* Display Order */}

          <div>

            <label className="block mb-2 font-medium">

              Display Order

            </label>

            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>

          {/* Active */}

          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />

            <label>

              Brand is Active

            </label>

          </div>

          {/* Image */}

          <div>

            <label className="block mb-3 font-medium">

              Brand Logo

            </label>

            <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col justify-center items-center cursor-pointer hover:border-primary transition">

              {preview ? (

                <img
                  src={preview}
                  alt="Preview"
                  className="w-36 h-36 rounded-xl object-cover border"
                />

              ) : (

                <>

                  <ImageIcon
                    size={48}
                    className="text-slate-400"
                  />

                  <p className="mt-3 text-slate-500">

                    Upload Brand Logo

                  </p>

                  <Upload
                    className="mt-3 text-primary"
                  />

                </>

              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleImage}
              />

            </label>

          </div>

          {/* Footer */}

          <div className="border-t pt-5 flex justify-end gap-3 shrink-0">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border hover:bg-slate-100"
            >

              Cancel

            </button>

            <button
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-blue-700 disabled:opacity-50"
            >

              {loading
                ? "Saving..."
                : brand
                ? "Update Brand"
                : "Save Brand"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
