
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Power,
  Package,
  Box,
  IndianRupee,
  Barcode,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import ProductModal from "../../components/admin/ProductModal";


export default function Products() {
  /* =====================================================
                        STATES
  ===================================================== */

  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");

  const [companyFilter, setCompanyFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  /* ================= EXCEL STATES ================= */

  const [excelFile, setExcelFile] = useState(null);

  const [uploadingExcel, setUploadingExcel] =
    useState(false);

  const [downloadingExcel, setDownloadingExcel] =
    useState(false);

  const excelInputRef = useRef(null);


  /* =====================================================
                    RESPONSE HELPER
  ===================================================== */

  const extractArray = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    return [];
  };


  /* =====================================================
                    FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");

      setProducts(extractArray(res));
    } catch (err) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to load products."
      );
    }
  };


  /* =====================================================
                    FETCH COMPANIES
  ===================================================== */

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");

      setCompanies(extractArray(res));
    } catch (err) {
      console.error(
        "FETCH COMPANIES ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to load companies."
      );
    }
  };


  /* =====================================================
                    FETCH BRANDS
  ===================================================== */

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");

      setBrands(extractArray(res));
    } catch (err) {
      console.error(
        "FETCH BRANDS ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to load brands."
      );
    }
  };


  /* =====================================================
                    FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");

      setCategories(extractArray(res));
    } catch (err) {
      console.error(
        "FETCH CATEGORIES ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to load categories."
      );
    }
  };


  /* =====================================================
                    INITIAL LOAD
  ===================================================== */

  const loadPageData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchProducts(),
        fetchCompanies(),
        fetchBrands(),
        fetchCategories(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);


  /* =====================================================
              FILTER BRANDS BY COMPANY
  ===================================================== */

  const availableBrands = useMemo(() => {
    if (!companyFilter) {
      return brands;
    }

    return brands.filter((brand) => {
      const brandCompanyId =
        brand.company?._id ||
        brand.company;

      return (
        String(brandCompanyId) ===
        String(companyFilter)
      );
    });
  }, [brands, companyFilter]);


  /* =====================================================
              CATEGORY IS GLOBAL
  ===================================================== */

  /*
    No category filtering by brand.

    Categories are global and independent.

    Structure:
    Company -> Brand
    Category -> Global
  */


  /* =====================================================
                    FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productCompanyId =
        product.company?._id ||
        product.company;

      const productBrandId =
        product.brand?._id ||
        product.brand;

      const productCategoryId =
        product.category?._id ||
        product.category;

      const matchesCompany =
        !companyFilter ||
        String(productCompanyId) ===
          String(companyFilter);

      const matchesBrand =
        !brandFilter ||
        String(productBrandId) ===
          String(brandFilter);

      const matchesCategory =
        !categoryFilter ||
        String(productCategoryId) ===
          String(categoryFilter);

      const searchableText = [
        product.name,
        product.productCode,
        product.barcode,
        product.company?.name,
        product.brand?.name,
        product.category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword ||
        searchableText.includes(keyword);

      return (
        matchesCompany &&
        matchesBrand &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    products,
    search,
    companyFilter,
    brandFilter,
    categoryFilter,
  ]);


  /* =====================================================
                    FILTER CHANGES
  ===================================================== */

  const handleCompanyFilter = (e) => {
    setCompanyFilter(e.target.value);

    // Brand depends on Company
    setBrandFilter("");

    // Category is global
    // Do not reset category
  };

  const handleBrandFilter = (e) => {
    // Category is global
    // Do not reset category
    setBrandFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearch("");
    setCompanyFilter("");
    setBrandFilter("");
    setCategoryFilter("");
  };


  /* =====================================================
                        ADD
  ===================================================== */

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };


  /* =====================================================
                        EDIT
  ===================================================== */

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };


  /* =====================================================
                    CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return;

    setEditingProduct(null);
    setModalOpen(false);
  };


  /* =====================================================
                    BUILD FORM DATA
  ===================================================== */

  const buildFormData = (formData) => {
    const data = new FormData();

    data.append(
      "productCode",
      formData.productCode.trim()
    );

    data.append(
      "barcode",
      formData.barcode?.trim() || ""
    );

    data.append(
      "name",
      formData.name.trim()
    );

    data.append(
      "company",
      formData.company
    );

    data.append(
      "brand",
      formData.brand
    );

    data.append(
      "category",
      formData.category
    );

    data.append(
      "mrp",
      formData.mrp
    );

    data.append(
      "priceA",
      formData.priceA
    );

    data.append(
      "priceB",
      formData.priceB
    );

    data.append(
      "priceC",
      formData.priceC
    );

    data.append(
      "margin",
      formData.margin || "0"
    );

    data.append(
      "piecesPerBox",
      formData.piecesPerBox || "1"
    );

    data.append(
      "allowPieceSale",
      String(formData.allowPieceSale)
    );

    data.append(
      "stockBoxes",
      formData.stockBoxes || "0"
    );

    data.append(
      "stockPieces",
      formData.stockPieces || "0"
    );

    data.append(
      "displayOrder",
      formData.displayOrder || "0"
    );

    data.append(
      "isActive",
      String(formData.isActive)
    );

    if (formData.image instanceof File) {
      data.append(
        "image",
        formData.image
      );
    }

    return data;
  };


  /* =====================================================
                    SAVE PRODUCT
  ===================================================== */

  const saveProduct = async (formData) => {
    try {
      setSaving(true);

      const data =
        buildFormData(formData);

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct._id}`,
          data
        );

        toast.success(
          "Product updated successfully."
        );
      } else {
        await api.post(
          "/products",
          data
        );

        toast.success(
          "Product created successfully."
        );
      }

      setModalOpen(false);
      setEditingProduct(null);

      await fetchProducts();
    } catch (err) {
      console.error(
        "SAVE PRODUCT ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
                    TOGGLE STATUS
  ===================================================== */

  const toggleStatus = async (product) => {
    try {
      await api.patch(
        `/products/${product._id}/status`
      );

      toast.success(
        `Product ${
          product.isActive
            ? "deactivated"
            : "activated"
        } successfully.`
      );

      await fetchProducts();
    } catch (err) {
      console.error(
        "TOGGLE PRODUCT ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to update product status."
      );
    }
  };


  /* =====================================================
                DOWNLOAD PRODUCTS EXCEL
  ===================================================== */

  const downloadProductsExcel = async () => {
    try {
      setDownloadingExcel(true);

      const response = await api.get(
        "/products/excel/download",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      const date = new Date()
        .toISOString()
        .split("T")[0];

      link.href = url;

      link.download =
        `products-${date}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Products Excel downloaded."
      );
    } catch (err) {
      console.error(
        "DOWNLOAD EXCEL ERROR:",
        err
      );

      toast.error(
        "Unable to download products Excel."
      );
    } finally {
      setDownloadingExcel(false);
    }
  };


  /* =====================================================
                SELECT EXCEL FILE
  ===================================================== */

  const handleExcelFileChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls")
    ) {
      toast.error(
        "Please select an Excel file."
      );

      e.target.value = "";

      return;
    }

    setExcelFile(file);
  };


  /* =====================================================
                REMOVE SELECTED EXCEL
  ===================================================== */

  const clearExcelFile = () => {
    setExcelFile(null);

    if (excelInputRef.current) {
      excelInputRef.current.value = "";
    }
  };


  /* =====================================================
                UPLOAD PRODUCTS EXCEL
  ===================================================== */

  const uploadProductsExcel = async () => {
    if (!excelFile) {
      toast.error(
        "Please select an Excel file."
      );

      return;
    }

    try {
      setUploadingExcel(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        excelFile
      );

      const response = await api.post(
        "/products/excel/upload",
        formData
      );

      const results =
        response.data?.results;

      const updated =
        results?.updated || 0;

      const skipped =
        results?.skipped || 0;

      const failed =
        results?.failed || 0;

      if (failed > 0) {
        toast.error(
          `Updated ${updated}, skipped ${skipped}, failed ${failed}.`
        );
      } else {
        toast.success(
          `Updated ${updated}, skipped ${skipped}.`
        );
      }

      if (
        results?.errors?.length > 0
      ) {
        console.table(
          results.errors
        );
      }

      clearExcelFile();

      await fetchProducts();
    } catch (err) {
      console.error(
        "UPLOAD EXCEL ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to upload products Excel."
      );
    } finally {
      setUploadingExcel(false);
    }
  };


  /* =====================================================
                    STOCK HELPERS
  ===================================================== */

  const totalPieces = (product) => {
    const boxes =
      Number(product.stockBoxes) || 0;

    const pieces =
      Number(product.stockPieces) || 0;

    const piecesPerBox =
      Number(product.piecesPerBox) || 1;

    return (
      boxes * piecesPerBox +
      pieces
    );
  };


  /* =====================================================
                        JSX
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Products
          </h1>

          <p className="text-slate-500 mt-1">
            Manage products, pricing, packing and stock.
          </p>
        </div>


        {/* ================= HEADER ACTIONS ================= */}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">

          {/* Download Excel */}

          <button
            type="button"
            onClick={downloadProductsExcel}
            disabled={downloadingExcel}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium transition"
          >
            <Download size={18} />

            {downloadingExcel
              ? "Downloading..."
              : "Download Excel"}
          </button>


          {/* Select Excel */}

          <button
            type="button"
            onClick={() =>
              excelInputRef.current?.click()
            }
            disabled={uploadingExcel}
            className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-60 text-amber-800 px-5 py-3 rounded-xl font-medium transition"
          >
            <FileSpreadsheet size={18} />

            Select Excel
          </button>

          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelFileChange}
            className="hidden"
          />


          {/* Add Product */}

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
          >
            <Plus size={18} />
            Add Product
          </button>

        </div>

      </div>


      {/* ================= SELECTED EXCEL FILE ================= */}

      {excelFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold text-slate-800">
                  Excel file selected
                </p>

                <p className="text-sm text-slate-600 truncate mt-1">
                  {excelFile.name}
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={uploadProductsExcel}
                disabled={uploadingExcel}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition"
              >
                <Upload size={18} />

                {uploadingExcel
                  ? "Updating..."
                  : "Upload & Update"}
              </button>


              <button
                type="button"
                onClick={clearExcelFile}
                disabled={uploadingExcel}
                title="Remove selected file"
                className="w-11 h-11 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-60 flex items-center justify-center transition"
              >
                <X
                  size={18}
                  className="text-slate-600"
                />
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <SummaryCard
          title="Total Products"
          value={products.length}
          icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <SummaryCard
          title="Visible Results"
          value={filteredProducts.length}
          icon={Filter}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Stock Boxes"
          value={products.reduce(
            (sum, product) =>
              sum +
              (Number(product.stockBoxes) || 0),
            0
          )}
          icon={Box}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <SummaryCard
          title="Total Stock Pieces"
          value={products.reduce(
            (sum, product) =>
              sum + totalPieces(product),
            0
          )}
          icon={Package}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />

      </div>


      {/* ================= SEARCH + FILTERS ================= */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-5">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

          <div className="relative xl:col-span-2">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search name, code, barcode..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            />

          </div>


          <select
            value={companyFilter}
            onChange={handleCompanyFilter}
            className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">
              All Companies
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


          <select
            value={brandFilter}
            onChange={handleBrandFilter}
            className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">
              All Brands
            </option>

            {availableBrands.map((brand) => (
              <option
                key={brand._id}
                value={brand._id}
              >
                {brand.name}
              </option>
            ))}
          </select>


          {/* GLOBAL CATEGORY FILTER */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            ))}
          </select>

        </div>


        {(search ||
          companyFilter ||
          brandFilter ||
          categoryFilter) && (
          <div className="mt-4 flex justify-end">

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear all filters
            </button>

          </div>
        )}

      </div>


      {/* ================= PRODUCT TABLE ================= */}

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">

        {loading ? (

          <div className="h-80 flex items-center justify-center">

            <p className="text-slate-500">
              Loading products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="h-80 flex flex-col items-center justify-center text-center px-4">

            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">

              <Package
                size={30}
                className="text-purple-600"
              />

            </div>

            <h2 className="text-xl font-semibold text-slate-800 mt-4">
              No Products Found
            </h2>

            <p className="text-slate-500 mt-2">
              Add a product or change your filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1500px]">

              <thead className="bg-slate-100">

                <tr>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Product
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Code / Barcode
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Hierarchy
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    MRP
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Price A
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Price B
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Price C
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Packing
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Stock
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product, index) => (

                    <tr
                      key={product._id}
                      className={`border-t border-slate-200 hover:bg-purple-50/50 transition ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }`}
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3 min-w-[240px]">

                          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">

                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package
                                size={22}
                                className="text-slate-400"
                              />
                            )}

                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {product.name}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Order:{" "}
                              {product.displayOrder ?? 0}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <div className="min-w-[160px]">

                          <p className="font-medium text-slate-700">
                            {product.productCode}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">

                            <Barcode size={14} />

                            <span>
                              {product.barcode || "No barcode"}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <div className="min-w-[190px]">

                          <p className="text-sm font-medium text-slate-700">
                            {product.company?.name || "—"}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {product.brand?.name || "—"}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {product.category?.name || "—"}
                          </p>

                        </div>

                      </td>


                      <td className="px-5 py-4">
                        <MoneyValue
                          value={product.mrp}
                          muted
                        />
                      </td>


                      <td className="px-5 py-4">
                        <TierPrice
                          tier="A"
                          value={product.priceA}
                          className="bg-green-100 text-green-700"
                        />
                      </td>


                      <td className="px-5 py-4">
                        <TierPrice
                          tier="B"
                          value={product.priceB}
                          className="bg-blue-100 text-blue-700"
                        />
                      </td>


                      <td className="px-5 py-4">
                        <TierPrice
                          tier="C"
                          value={product.priceC}
                          className="bg-purple-100 text-purple-700"
                        />
                      </td>


                      <td className="px-5 py-4">

                        <div className="min-w-[130px]">

                          <p className="font-medium text-slate-700">
                            {product.piecesPerBox || 1} pcs / box
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {product.allowPieceSale
                              ? "Piece sale allowed"
                              : "Box sale only"}
                          </p>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <div className="min-w-[130px]">

                          <p className="font-medium text-slate-700">
                            {product.stockBoxes || 0} boxes
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {product.stockPieces || 0} extra pcs
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {totalPieces(product)} total pcs
                          </p>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(product)
                            }
                            title="Edit Product"
                            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition"
                          >
                            <Pencil
                              size={18}
                              className="text-blue-600"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(product)
                            }
                            title={
                              product.isActive
                                ? "Deactivate Product"
                                : "Activate Product"
                            }
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                              product.isActive
                                ? "bg-red-100 hover:bg-red-200"
                                : "bg-green-100 hover:bg-green-200"
                            }`}
                          >
                            <Power
                              size={18}
                              className={
                                product.isActive
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


      {/* ================= FOOTER COUNT ================= */}

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {products.length}
          </span>{" "}
          products
        </p>

      </div>


      {/* ================= MODAL ================= */}

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        loading={saving}
        companies={companies}
        brands={brands}
        categories={categories}
        onClose={closeModal}
        onSave={saveProduct}
      />

    </div>
  );
}


/* =====================================================
                    SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {value}
          </h2>

        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <Icon
            size={23}
            className={iconColor}
          />
        </div>

      </div>

    </div>
  );
}


/* =====================================================
                    MONEY VALUE
===================================================== */

function MoneyValue({
  value,
  muted = false,
}) {
  return (
    <div
      className={`flex items-center font-semibold ${
        muted
          ? "text-slate-600"
          : "text-slate-800"
      }`}
    >
      <IndianRupee size={15} />

      <span>
        {Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}


/* =====================================================
                    TIER PRICE
===================================================== */

function TierPrice({
  tier,
  value,
  className,
}) {
  return (
    <div className="min-w-[105px]">

      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${className}`}
      >
        {tier}
      </span>

      <div className="flex items-center mt-2 font-semibold text-slate-800">

        <IndianRupee size={14} />

        <span>
          {Number(value || 0).toFixed(2)}
        </span>

      </div>

    </div>
  );
}

