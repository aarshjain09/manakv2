import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export default function CategoryModal({
  open,
  onClose,
  onSave,
  loading = false,
  category = null,
}) {
  // ============================================
  // FORM STATE
  // ============================================

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    displayOrder: 0,
    isActive: true,
    image: null,
  });

  const [
    preview,
    setPreview,
  ] = useState("");

  // ============================================
  // RESET / EDIT MODE
  // ============================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setFormData({
        name:
          category.name || "",

        displayOrder:
          category.displayOrder ??
          0,

        isActive:
          category.isActive ??
          true,

        image: null,
      });

      setPreview(
        category.image || ""
      );
    } else {
      setFormData({
        name: "",
        displayOrder: 0,
        isActive: true,
        image: null,
      });

      setPreview("");
    }
  }, [
    open,
    category,
  ]);

  // ============================================
  // CLEAN OBJECT URL
  // ============================================

  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          preview
        );
      }
    };
  }, [preview]);

  // ============================================
  // HANDLE CHANGE
  // ============================================

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
    }));
  };

  // ============================================
  // IMAGE CHANGE
  // ============================================

  const handleImage = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // Optional basic validation
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image file"
      );

      return;
    }

    // Remove previous temporary preview
    if (
      preview &&
      preview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        preview
      );
    }

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(
      previewUrl
    );
  };

  // ============================================
  // SUBMIT
  // ============================================

  const submit = (e) => {
    e.preventDefault();

    const cleanName =
      formData.name.trim();

    if (!cleanName) {
      alert(
        "Category name is required"
      );

      return;
    }

    /*
      Backend requires image when
      creating a new category.

      During edit, existing image
      is enough.
    */
    if (
      !category &&
      !formData.image
    ) {
      alert(
        "Category image is required"
      );

      return;
    }

    onSave({
      ...formData,

      name: cleanName,

      displayOrder:
        Number(
          formData.displayOrder
        ) || 0,
    });
  };

  // ============================================
  // CLOSE
  // ============================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-4
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {category
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {category
                ? "Update global category information."
                : "Create a global category shared across all brands."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={loading}
            aria-label="Close category modal"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={submit}
          className="
            flex-1
            space-y-6
            overflow-y-auto
            p-6
          "
        >
          {/* =================================
              CATEGORY NAME
          ================================= */}

          <div>
            <label
              htmlFor="category-name"
              className="
                mb-2
                block
                font-medium
                text-slate-800
              "
            >
              Category Name
            </label>

            <input
              id="category-name"
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Example: Soap, Face Wash, Body Lotion"
              autoComplete="off"
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              This category is
              global and can be
              used by products from
              any company or brand.
            </p>
          </div>

          {/* =================================
              DISPLAY ORDER
          ================================= */}

          <div>
            <label
              htmlFor="category-display-order"
              className="
                mb-2
                block
                font-medium
                text-slate-800
              "
            >
              Display Order
            </label>

            <input
              id="category-display-order"
              type="number"
              name="displayOrder"
              min="0"
              step="1"
              value={
                formData.displayOrder
              }
              onChange={
                handleChange
              }
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                px-4
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />

            <p className="mt-2 text-xs text-slate-400">
              Lower numbers appear
              first in the customer
              catalogue.
            </p>
          </div>

          {/* =================================
              ACTIVE STATUS
          ================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >
            <div>
              <p className="font-medium text-slate-800">
                Active Category
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Active categories
                are available in the
                shopping catalogue.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
                className="peer sr-only"
              />

              <span
                className="
                  h-6
                  w-11
                  rounded-full
                  bg-slate-300
                  transition
                  after:absolute
                  after:left-[2px]
                  after:top-[2px]
                  after:h-5
                  after:w-5
                  after:rounded-full
                  after:bg-white
                  after:transition-all
                  after:content-['']
                  peer-checked:bg-primary
                  peer-checked:after:translate-x-full
                "
              />
            </label>
          </div>

          {/* =================================
              CATEGORY IMAGE
          ================================= */}

          <div>
            <label className="mb-3 block font-medium text-slate-800">
              Category Image
            </label>

            <label
              className="
                flex
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-2xl
                border-2
                border-dashed
                border-slate-300
                p-8
                transition
                hover:border-primary
                hover:bg-blue-50/30
              "
            >
              {preview ? (
                <div className="flex w-full flex-col items-center">
                  <img
                    src={preview}
                    alt="Category preview"
                    className="
                      h-40
                      w-40
                      rounded-2xl
                      border
                      border-slate-200
                      object-cover
                      shadow-sm
                    "
                  />

                  <p className="mt-4 text-sm font-medium text-primary">
                    Click to replace
                    image
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG or WebP
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                    "
                  >
                    <ImageIcon
                      size={34}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-4 font-medium text-slate-700">
                    Upload Category
                    Image
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG or WebP
                  </p>

                  <Upload
                    size={20}
                    className="mt-4 text-primary"
                  />
                </>
              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={
                  handleImage
                }
              />
            </label>
          </div>

          {/* =================================
              FOOTER
          ================================= */}

          <div
            className="
              flex
              shrink-0
              justify-end
              gap-3
              border-t
              border-slate-200
              pt-5
            "
          >
            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={loading}
              className="
                rounded-xl
                border
                border-slate-300
                px-6
                py-3
                font-medium
                text-slate-700
                transition
                hover:bg-slate-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                bg-primary
                px-6
                py-3
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Saving..."
                : category
                  ? "Update Category"
                  : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}