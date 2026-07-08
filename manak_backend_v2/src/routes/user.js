const router = require("express").Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const worker = require("../middleware/worker");
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  searchCustomers
} = require("../controllers/user");
const {
  getCustomersForWorker,
} = require("../controllers/user");
router.get(
  "/worker/customers",
  auth,
  worker,
  getCustomersForWorker
);
// ==========================================
// WORKER / ADMIN – CUSTOMER SUGGESTIONS
// ==========================================
router.get(
  "/search/customers",
  auth,
  searchCustomers
);

// ==========================================
// ADMIN – GET ALL USERS
// ==========================================
router.get(
  "/",
  auth,
  admin,
  getUsers
);

// ==========================================
// ADMIN – CREATE USER
// ==========================================
router.post(
  "/",
  auth,
  admin,
  createUser
);

// ==========================================
// ADMIN – UPDATE USER
// ==========================================
router.put(
  "/:id",
  auth,
  admin,
  updateUser
);

// ==========================================
// ADMIN – TOGGLE USER STATUS
// ==========================================
router.patch(
  "/:id/status",
  auth,
  admin,
  toggleUserStatus
);

module.exports = router;