const router = require("express").Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  toggleCompanyStatus,
} = require("../controllers/companyController");

/* ======================================================
                    CREATE COMPANY
====================================================== */

router.post(
  "/",
  auth,
  admin,
  upload.any(),
  createCompany
);

/* ======================================================
                    GET ALL COMPANIES
====================================================== */

router.get(
  "/",
  auth,
  getCompanies
);

/* ======================================================
                    GET COMPANY BY ID
====================================================== */

router.get(
  "/:id",
  auth,
  getCompanyById
);

/* ======================================================
                    UPDATE COMPANY
====================================================== */

router.put(
  "/:id",
  auth,
  admin,
  upload.any(),
  updateCompany
);

/* ======================================================
                TOGGLE COMPANY STATUS
====================================================== */

router.patch(
  "/:id/status",
  auth,
  admin,
  toggleCompanyStatus
);

module.exports = router;