const router = require("express").Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const {
  createBrand,
  getBrands,
  getBrandsByCompany,
  updateBrand,
  toggleBrandStatus,
} = require("../controllers/brandController");

router.post(
  "/",
  auth,
  admin,
  upload.any(),
  createBrand
);

router.get("/", auth, getBrands);

router.get(
  "/company/:companyId",
  auth,
  getBrandsByCompany
);

router.put(
  "/:id",
  auth,
  admin,
  upload.any(),
  updateBrand
);

router.patch(
  "/:id/status",
  auth,
  admin,
  toggleBrandStatus
);

module.exports = router;