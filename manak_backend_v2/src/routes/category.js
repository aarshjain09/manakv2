const router = require(
  "express"
).Router();

const auth = require(
  "../middleware/auth"
);

const admin = require(
  "../middleware/admin"
);

const upload = require(
  "../middleware/upload"
);

const {
  createCategory,
  getCategories,
  getCategoriesByBrand,
  updateCategory,
  toggleCategoryStatus,
} = require(
  "../controllers/categoryController"
);

// ==========================================
// CREATE GLOBAL CATEGORY
// Admin only
// ==========================================
router.post(
  "/",
  auth,
  admin,
  upload.any(),
  createCategory
);

// ==========================================
// GET ALL CATEGORIES
//
// Admin:
// active + inactive
//
// Customer / Worker:
// active only
// ==========================================
router.get(
  "/",
  auth,
  getCategories
);

// ==========================================
// GET CATEGORIES USED BY A BRAND
//
// Categories are GLOBAL.
//
// This endpoint derives categories from
// products belonging to the selected brand.
//
// IMPORTANT:
// Keep before any future "/:id" GET route.
// ==========================================
router.get(
  "/brand/:brandId",
  auth,
  getCategoriesByBrand
);

// ==========================================
// UPDATE GLOBAL CATEGORY
// Admin only
// ==========================================
router.put(
  "/:id",
  auth,
  admin,
  upload.any(),
  updateCategory
);

// ==========================================
// TOGGLE CATEGORY STATUS
// Admin only
// ==========================================
router.patch(
  "/:id/status",
  auth,
  admin,
  toggleCategoryStatus
);

module.exports = router;