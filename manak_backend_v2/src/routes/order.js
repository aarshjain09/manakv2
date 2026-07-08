const router = require("express").Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const orderController = require("../controllers/order");

// ==========================================
// CUSTOMER – CREATE DIRECT ORDER
// ==========================================
router.post(
  "/",
  auth,
  orderController.createOrder
);

// ==========================================
// WORKER / ADMIN – CREATE NOTEBOOK ORDER
// ==========================================
router.post(
  "/notebook",
  auth,
  orderController.createNotebookOrder
);

// ==========================================
// CUSTOMER – OWN ORDER HISTORY
// ==========================================
router.get(
  "/",
  auth,
  orderController.getOrders
);

// ==========================================
// CUSTOMER – VIEW SINGLE OWN ORDER
// ==========================================
router.get(
  "/view/:id",
  auth,
  orderController.getOrderById
);

// ==========================================
// ADMIN – ALL ORDERS WITH FILTERS
// ==========================================
router.get(
  "/admin",
  auth,
  admin,
  orderController.getAdminOrders
);

// ==========================================
// ADMIN – DOWNLOAD EXCEL
// ==========================================
router.get(
  "/admin/export/excel",
  auth,
  admin,
  orderController.exportOrdersExcel
);

// ==========================================
// ADMIN – VIEW SINGLE ORDER
// ==========================================
router.get(
  "/admin/:id",
  auth,
  admin,
  orderController.getAdminOrderById
);

// ==========================================
// ADMIN – UPDATE STATUS
// ==========================================
router.put(
  "/:id/status",
  auth,
  admin,
  orderController.updateOrderStatus
);

module.exports = router;