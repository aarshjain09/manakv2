import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

export default function CompanyModal({
  open,
  onClose,
  onSave,
  loading = false,
  company = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    displayOrder: 0,
    isActive: true,
    image: null,
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        displayOrder: company.displayOrder || 0,
        isActive: company.isActive,
        image: null,
      });

      setPreview(company.image || "");
    } else {
      setFormData({
        name: "",
        displayOrder: 0,
        isActive: true,
        image: null,
      });

      setPreview("");
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
      return alert("Company name is required");
    }

    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-2xl font-bold">

              {company
                ? "Edit Company"
                : "Add Company"}

            </h2>

            <p className="text-slate-500 mt-1">

              Manage company information

            </p>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex justify-center items-center"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <form
          onSubmit={submit}
          className="p-6 space-y-6"
        >

          {/* Company Name */}

          <div>

            <label className="block mb-2 font-medium">

              Company Name

            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter company name"
              className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
            />

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

              Company is Active

            </label>

          </div>

          {/* Upload */}

          <div>

            <label className="block mb-3 font-medium">

              Company Logo

            </label>

            <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">

              {
                preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-36 h-36 rounded-xl object-cover border"
                  />
                ) : (
                  <>
                    <ImageIcon
                      size={45}
                      className="text-slate-400"
                    />

                    <p className="mt-3 text-slate-500">

                      Upload Company Logo

                    </p>

                    <Upload
                      className="mt-3 text-primary"
                    />
                  </>
                )
              }

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleImage}
              />

            </label>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 pt-4 border-t">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : company
                ? "Update Company"
                : "Save Company"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}