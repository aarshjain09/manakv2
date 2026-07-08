
const router = require("express").Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");
const excelUpload = require("../middleware/excel");

const productController = require("../controllers/product");


/* ======================================================
                    PRODUCT CRUD
====================================================== */

/* ================= BARCODE TEST ================= */

router.get(
  "/barcode-test",
  (req, res) => {
    res.json({
      message: "Barcode router is active",
    });
  }
);


/* ================= CREATE PRODUCT ================= */

router.post(
  "/",
  auth,
  admin,
  upload.any(),
  productController.createProduct
);


/* ================= GET ALL PRODUCTS ================= */

router.get(
  "/",
  auth,
  productController.getProducts
);


/* ======================================================
                    PRODUCT EXCEL
====================================================== */

/*
  IMPORTANT:
  Keep Excel routes before "/:id" routes.
*/


/* ================= DOWNLOAD PRODUCTS EXCEL ================= */

router.get(
  "/excel/download",
  auth,
  admin,
  productController.downloadProductsExcel
);


/* ================= UPLOAD PRODUCTS EXCEL ================= */

router.post(
  "/excel/upload",
  auth,
  admin,
  excelUpload.single("file"),
  productController.uploadProductsExcel
);


/* ======================================================
                    SEARCH
====================================================== */

/*
  Search by:
  - Product name
  - Product code
  - Barcode text

  IMPORTANT:
  Must remain before "/:id"
*/

router.get(
  "/search/:keyword",
  auth,
  productController.searchProducts
);


/* ======================================================
                    BARCODE LOOKUP
====================================================== */

/*
  Exact barcode lookup.

  IMPORTANT:
  Must remain before "/:id"
*/

router.get(
  "/barcode/:barcode",
  auth,
  productController.getProductByBarcode
);


/* ======================================================
                    FILTERS
====================================================== */

/* ================= BY COMPANY ================= */

router.get(
  "/company/:companyId",
  auth,
  productController.getProductsByCompany
);


/* ================= BY BRAND ================= */

router.get(
  "/brand/:brandId",
  auth,
  productController.getProductsByBrand
);


/* ================= BY CATEGORY ================= */

router.get(
  "/category/:categoryId",
  auth,
  productController.getProductsByCategory
);


/* ======================================================
                    PRODUCT STATUS
====================================================== */

router.patch(
  "/:id/status",
  auth,
  admin,
  productController.toggleProductStatus
);


/* ======================================================
                    STOCK
====================================================== */

router.patch(
  "/:id/stock",
  auth,
  admin,
  productController.addStock
);


/* ======================================================
                    DUPLICATE PRODUCT
====================================================== */

router.post(
  "/:id/duplicate",
  auth,
  admin,
  productController.duplicateProduct
);


/* ======================================================
                    UPDATE PRODUCT
====================================================== */

router.put(
  "/:id",
  auth,
  admin,
  upload.any(),
  productController.updateProduct
);


/* ======================================================
                    GET PRODUCT BY ID
====================================================== */

/*
  IMPORTANT:
  Keep this route LAST among GET routes.

  Otherwise:
  /excel/download
  /search/abc
  /barcode/123
  /company/xyz
  /brand/xyz
  /category/xyz

  can conflict with "/:id".
*/

router.get(
  "/:id",
  auth,
  productController.getProductById
);


module.exports = router;

