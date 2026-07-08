import { useEffect, useMemo, useState } from "react";
import {
  X,
  Package,
  Barcode,
  Hash,
  IndianRupee,
  Percent,
  Box,
  Layers3,
  Upload,
  ImageIcon,
} from "lucide-react";

export default function ProductModal({
  open,
  onClose,
  onSave,
  loading = false,
  product = null,
  companies = [],
  brands = [],
  categories = [],
}) {
  const emptyForm = {
    productCode: "",
    barcode: "",
    name: "",

    company: "",
    brand: "",
    category: "",

    mrp: "",
    priceA: "",
    priceB: "",
    priceC: "",
    margin: "0",

    piecesPerBox: "1",
    allowPieceSale: true,

    stockBoxes: "0",
    stockPieces: "0",

    displayOrder: "0",
    isActive: true,

    image: null,
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const [preview, setPreview] =
    useState("");

  /* =====================================================
                    LOAD PRODUCT
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    if (product) {
      setFormData({
        productCode:
          product.productCode || "",

        barcode:
          product.barcode || "",

        name:
          product.name || "",

        company:
          product.company?._id ||
          product.company ||
          "",

        brand:
          product.brand?._id ||
          product.brand ||
          "",

        category:
          product.category?._id ||
          product.category ||
          "",

        mrp:
          product.mrp ?? "",

        priceA:
          product.priceA ?? "",

        priceB:
          product.priceB ?? "",

        priceC:
          product.priceC ?? "",

        margin:
          product.margin ?? "0",

        piecesPerBox:
          product.piecesPerBox ?? "1",

        allowPieceSale:
          product.allowPieceSale !== undefined
            ? product.allowPieceSale
            : true,

        stockBoxes:
          product.stockBoxes ?? "0",

        stockPieces:
          product.stockPieces ?? "0",

        displayOrder:
          product.displayOrder ?? "0",

        isActive:
          product.isActive !== undefined
            ? product.isActive
            : true,

        image: null,
      });

      setPreview(
        product.image || ""
      );
    } else {
      setFormData({
        ...emptyForm,
      });

      setPreview("");
    }
  }, [product, open]);

  /* =====================================================
                    FILTER BRANDS
  ===================================================== */

  const filteredBrands = useMemo(() => {
    if (!formData.company) {
      return [];
    }

    return brands.filter((brand) => {
      const brandCompanyId =
        brand.company?._id ||
        brand.company;

      return (
        String(brandCompanyId) ===
        String(formData.company)
      );
    });
  }, [brands, formData.company]);

  /* =====================================================
                  FILTER CATEGORIES
  ===================================================== */

  const filteredCategories = useMemo(() => {
    if (!formData.brand) {
      return [];
    }

    return categories.filter(
      (category) => {
        const categoryBrandId =
          category.brand?._id ||
          category.brand;

        return (
          String(categoryBrandId) ===
          String(formData.brand)
        );
      }
    );
  }, [categories, formData.brand]);

  /* =====================================================
                    HANDLE CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    if (name === "company") {
      setFormData((prev) => ({
        ...prev,
        company: value,
        brand: "",
        category: "",
      }));

      return;
    }

    if (name === "brand") {
      setFormData((prev) => ({
        ...prev,
        brand: value,
        category: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
                    HANDLE IMAGE
  ===================================================== */

  const handleImage = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /* =====================================================
                      SUBMIT
  ===================================================== */

  const submit = (e) => {
    e.preventDefault();

    if (
      !formData.productCode.trim()
    ) {
      return alert(
        "Product code is required"
      );
    }

    if (!formData.name.trim()) {
      return alert(
        "Product name is required"
      );
    }

    if (!formData.company) {
      return alert(
        "Please select a company"
      );
    }

    if (!formData.brand) {
      return alert(
        "Please select a brand"
      );
    }

    if (!formData.category) {
      return alert(
        "Please select a category"
      );
    }

    if (
      formData.mrp === "" ||
      Number(formData.mrp) < 0
    ) {
      return alert(
        "Please enter valid MRP"
      );
    }

    if (
      formData.priceA === "" ||
      Number(formData.priceA) < 0
    ) {
      return alert(
        "Please enter valid Price A"
      );
    }

    if (
      formData.priceB === "" ||
      Number(formData.priceB) < 0
    ) {
      return alert(
        "Please enter valid Price B"
      );
    }

    if (
      formData.priceC === "" ||
      Number(formData.priceC) < 0
    ) {
      return alert(
        "Please enter valid Price C"
      );
    }

    if (
      Number(formData.piecesPerBox) < 1
    ) {
      return alert(
        "Pieces per box must be at least 1"
      );
    }

    if (
      !product &&
      !formData.image
    ) {
      return alert(
        "Product image is required"
      );
    }

    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col">

        {/* ================= HEADER ================= */}

        <div className="shrink-0 flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {product
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="text-slate-500 mt-1">
              {product
                ? "Update product information"
                : "Create a new product"}
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

        {/* ================= SCROLL BODY ================= */}

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto"
        >

          <div className="p-6 space-y-8">

            {/* =========================================
                        BASIC DETAILS
            ========================================= */}

            <section>

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Basic Details
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Product identification information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Product Name */}

                <div className="md:col-span-2">

                  <label className="block mb-2 font-medium text-slate-700">
                    Product Name *
                  </label>

                  <div className="relative">

                    <Package
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

                {/* Product Code */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Product Code *
                  </label>

                  <div className="relative">

                    <Hash
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="productCode"
                      value={formData.productCode}
                      onChange={handleChange}
                      placeholder="Example: PRD-001"
                      className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

                {/* Barcode */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Barcode
                  </label>

                  <div className="relative">

                    <Barcode
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Enter barcode"
                      className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* =========================================
                          HIERARCHY
            ========================================= */}

            <section className="border-t pt-7">

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Product Hierarchy
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Select company, brand and category
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Company */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Company *
                  </label>

                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="">
                      Select Company
                    </option>

                    {companies.map(
                      (company) => (
                        <option
                          key={company._id}
                          value={company._id}
                        >
                          {company.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* Brand */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Brand *
                  </label>

                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    disabled={
                      !formData.company
                    }
                    className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {formData.company
                        ? "Select Brand"
                        : "Select Company First"}
                    </option>

                    {filteredBrands.map(
                      (brand) => (
                        <option
                          key={brand._id}
                          value={brand._id}
                        >
                          {brand.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* Category */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={
                      !formData.brand
                    }
                    className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {formData.brand
                        ? "Select Category"
                        : "Select Brand First"}
                    </option>

                    {filteredCategories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

            </section>

            {/* =========================================
                          PRICING
            ========================================= */}

            <section className="border-t pt-7">

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Pricing
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Set MRP and customer tier prices per piece
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

                {/* MRP */}

                <PriceInput
                  label="MRP *"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                />

                {/* Price A */}

                <PriceInput
                  label="Price A *"
                  name="priceA"
                  value={formData.priceA}
                  onChange={handleChange}
                />

                {/* Price B */}

                <PriceInput
                  label="Price B *"
                  name="priceB"
                  value={formData.priceB}
                  onChange={handleChange}
                />

                {/* Price C */}

                <PriceInput
                  label="Price C *"
                  name="priceC"
                  value={formData.priceC}
                  onChange={handleChange}
                />

                {/* Margin */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Margin %
                  </label>

                  <div className="relative">

                    <Percent
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      name="margin"
                      value={formData.margin}
                      onChange={handleChange}
                      className="w-full h-12 border rounded-xl pl-10 pr-3 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* =========================================
                      PACKING + STOCK
            ========================================= */}

            <section className="border-t pt-7">

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Packing & Stock
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Configure box packing and current inventory
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Pieces Per Box */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Pieces Per Box *
                  </label>

                  <div className="relative">

                    <Box
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="1"
                      name="piecesPerBox"
                      value={
                        formData.piecesPerBox
                      }
                      onChange={handleChange}
                      className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

                {/* Stock Boxes */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Stock Boxes
                  </label>

                  <div className="relative">

                    <Layers3
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="0"
                      name="stockBoxes"
                      value={
                        formData.stockBoxes
                      }
                      onChange={handleChange}
                      className="w-full h-12 border rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                    />

                  </div>

                </div>

                {/* Stock Pieces */}

                <div>

                  <label className="block mb-2 font-medium text-slate-700">
                    Extra Stock Pieces
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stockPieces"
                    value={
                      formData.stockPieces
                    }
                    onChange={handleChange}
                    className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
                  />

                  <p className="text-xs text-slate-500 mt-2">
                    Backend automatically normalizes extra pieces into boxes.
                  </p>

                </div>

              </div>

              {/* Piece Sale */}

              <div className="mt-5 flex items-center justify-between border rounded-xl p-4">

                <div>
                  <p className="font-medium text-slate-800">
                    Allow Piece Sale
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Allow customers to order individual pieces.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      allowPieceSale:
                        !prev.allowPieceSale,
                    }))
                  }
                  className={`relative w-12 h-7 rounded-full transition ${
                    formData.allowPieceSale
                      ? "bg-primary"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      formData.allowPieceSale
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

            </section>

            {/* =========================================
                        DISPLAY + IMAGE
            ========================================= */}

            <section className="border-t pt-7">

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Display & Media
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Configure display order and product image
                </p>
              </div>

              {/* Display Order */}

              <div className="mb-6 max-w-sm">

                <label className="block mb-2 font-medium text-slate-700">
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  name="displayOrder"
                  value={
                    formData.displayOrder
                  }
                  onChange={handleChange}
                  className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
                />

              </div>

              {/* Image */}

              <div>

                <label className="block mb-3 font-medium text-slate-700">
                  Product Image
                  {!product && " *"}
                </label>

                <label className="border-2 border-dashed border-slate-300 rounded-2xl min-h-[230px] p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">

                  {preview ? (
                    <div className="flex flex-col items-center">

                      <img
                        src={preview}
                        alt="Product Preview"
                        className="w-44 h-44 object-contain rounded-xl border bg-white"
                      />

                      <p className="text-sm text-primary font-medium mt-3">
                        Click to change image
                      </p>

                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">

                        <ImageIcon
                          size={30}
                          className="text-slate-400"
                        />

                      </div>

                      <p className="font-medium text-slate-700 mt-4">
                        Upload Product Image
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        JPG, PNG or WEBP
                      </p>

                      <Upload
                        size={20}
                        className="text-primary mt-4"
                      />
                    </>
                  )}

                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImage}
                  />

                </label>

              </div>

            </section>

          </div>

          {/* ================= STICKY FOOTER ================= */}

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.04)]">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl border hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =====================================================
                    PRICE INPUT
===================================================== */

function PriceInput({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="block mb-2 font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">

        <IndianRupee
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full h-12 border rounded-xl pl-10 pr-3 focus:ring-2 focus:ring-primary outline-none"
        />

      </div>

    </div>
  );
}