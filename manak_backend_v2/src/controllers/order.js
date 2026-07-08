const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const ExcelJS = require("exceljs");



// ==========================================
// HELPER – GET CUSTOMER PRICE
// ==========================================
const getProductRate = (product, priceTier) => {
  if (priceTier === "A") {
    return Number(product.priceA || 0);
  }

  if (priceTier === "B") {
    return Number(product.priceB || 0);
  }

  return Number(product.priceC || 0);
};

// ==========================================
// HELPER – PREPARE ORDER ITEMS
// Checks stock + calculates prices
// ==========================================
const prepareOrderItems = async (
  items,
  priceTier
) => {
  const calculatedItems = [];

  let calculatedTotal = 0;

  for (const item of items) {
    const product = await Product.findById(
      item.product
    );

    if (!product) {
      const error = new Error(
        "Product not found"
      );

      error.statusCode = 404;
      throw error;
    }

    if (!product.isActive) {
      const error = new Error(
        `${product.name} is inactive`
      );

      error.statusCode = 400;
      throw error;
    }

    const boxes = Number(
      item.boxes || 0
    );

    const pieces = Number(
      item.pieces || 0
    );

    const piecesPerBox = Number(
      product.piecesPerBox || 1
    );

    // Basic validation
    if (
      !Number.isInteger(boxes) ||
      !Number.isInteger(pieces) ||
      boxes < 0 ||
      pieces < 0
    ) {
      const error = new Error(
        `Invalid quantity for ${product.name}`
      );

      error.statusCode = 400;
      throw error;
    }

    // Respect allowPieceSale
    if (
      pieces > 0 &&
      !product.allowPieceSale
    ) {
      const error = new Error(
        `Loose piece sale is not allowed for ${product.name}`
      );

      error.statusCode = 400;
      throw error;
    }

    const totalPieces =
      boxes * piecesPerBox +
      pieces;

    if (totalPieces <= 0) {
      const error = new Error(
        `Quantity cannot be zero for ${product.name}`
      );

      error.statusCode = 400;
      throw error;
    }

    const availablePieces =
      Number(product.stockBoxes || 0) *
        piecesPerBox +
      Number(product.stockPieces || 0);

    if (totalPieces > availablePieces) {
      const error = new Error(
        `Insufficient stock for ${product.name}`
      );

      error.statusCode = 400;
      throw error;
    }

    const rate = getProductRate(
      product,
      priceTier
    );

    const amount = Number(
      (totalPieces * rate).toFixed(2)
    );

    calculatedItems.push({
      product: product._id,
      boxes,
      pieces,
      piecesPerBox,
      rate,
      totalPieces,
      amount
    });

    calculatedTotal += amount;
  }

  return {
    calculatedItems,

    calculatedTotal: Number(
      calculatedTotal.toFixed(2)
    )
  };
};

// ==========================================
// HELPER – DEDUCT STOCK
// ==========================================
const deductStock = async (
  calculatedItems
) => {
  for (const item of calculatedItems) {
    const product = await Product.findById(
      item.product
    );

    if (!product) {
      const error = new Error(
        "Product not found"
      );

      error.statusCode = 404;
      throw error;
    }

    const currentAvailablePieces =
      Number(product.stockBoxes || 0) *
        Number(product.piecesPerBox || 1) +
      Number(product.stockPieces || 0);

    const remainingPieces =
      currentAvailablePieces -
      Number(item.totalPieces || 0);

    if (remainingPieces < 0) {
      const error = new Error(
        `Insufficient stock for ${product.name}`
      );

      error.statusCode = 400;
      throw error;
    }

    product.stockBoxes = Math.floor(
      remainingPieces /
        Number(product.piecesPerBox || 1)
    );

    product.stockPieces =
      remainingPieces %
      Number(product.piecesPerBox || 1);

    await product.save();
  }
};

// ==========================================
// CREATE ORDER – DIRECT CUSTOMER
// ==========================================
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must have at least one item"
      });
    }

    if (req.user.role !== "customer") {
      return res.status(403).json({
        message:
          "Only customers can place direct orders"
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive"
      });
    }

    if (!req.user.customerCode) {
      return res.status(400).json({
        message:
          "Customer code is missing"
      });
    }

    // Calculate everything on backend
    const {
      calculatedItems,
      calculatedTotal
    } = await prepareOrderItems(
      items,
      req.user.priceTier
    );

    // Deduct stock
    await deductStock(
      calculatedItems
    );

    // Save order
    const order = new Order({
      user: req.user._id,

      customerCode:
        req.user.customerCode,

      createdBy: req.user._id,

      orderSource:
        "customer_direct",

      items: calculatedItems,

      totalAmount:
        calculatedTotal,

      status: "pending"
    });

    await order.save();

    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "shopName ownerName phone address customerCode priceTier"
        )
        .populate(
          "createdBy",
          "shopName ownerName role"
        )
        .populate(
          "items.product"
        );

    return res
      .status(201)
      .json(populatedOrder);
  } catch (error) {
    console.error(
      "Create direct order error:",
      error
    );

    return res
      .status(
        error.statusCode || 500
      )
      .json({
        message:
          error.message ||
          "Failed to create order"
      });
  }
};

// ==========================================
// WORKER/ADMIN – CREATE NOTEBOOK ORDER
// ==========================================
// ==========================================
// WORKER / ADMIN – CREATE NOTEBOOK ORDER
// ==========================================
// ==========================================
// WORKER / ADMIN – CREATE NOTEBOOK ORDER
// ==========================================
exports.createNotebookOrder = async (
  req,
  res
) => {
  try {
    const {
      customerCode,
      items,
      status
    } = req.body;

    // ======================================
    // ROLE CHECK
    // ======================================

    if (
      req.user.role !== "worker" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Only workers or admins can create notebook orders"
      });
    }

    // ======================================
    // CUSTOMER CODE VALIDATION
    // ======================================

    if (
      !customerCode ||
      !customerCode.trim()
    ) {
      return res.status(400).json({
        message:
          "Please select a customer"
      });
    }

    // ======================================
    // ITEMS VALIDATION
    // ======================================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must have at least one item"
      });
    }

    // ======================================
    // STATUS VALIDATION
    //
    // Salesman:
    // pending
    //
    // Worker packing directly:
    // packed
    // ======================================

    const allowedStatuses = [
      "pending",
      "packed"
    ];

    const selectedStatus =
      status || "pending";

    if (
      !allowedStatuses.includes(
        selectedStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid order status. Allowed: pending, packed"
      });
    }

    // ======================================
    // FIND CUSTOMER
    // ======================================

    const customer =
      await User.findOne({
        customerCode:
          customerCode
            .trim()
            .toUpperCase(),

        role: "customer"
      });

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found"
      });
    }

    // ======================================
    // CUSTOMER ACTIVE CHECK
    // ======================================

    if (!customer.isActive) {
      return res.status(400).json({
        message:
          "Customer account is inactive"
      });
    }

    // ======================================
    // CALCULATE ORDER
    //
    // Uses selected customer's price tier
    // ======================================

    const {
      calculatedItems,
      calculatedTotal
    } = await prepareOrderItems(
      items,
      customer.priceTier
    );

    // ======================================
    // DEDUCT STOCK
    // ======================================

    await deductStock(
      calculatedItems
    );

    // ======================================
    // CREATE ORDER
    // ======================================

    const order = new Order({
      user:
        customer._id,

      customerCode:
        customer.customerCode,

      createdBy:
        req.user._id,

      orderSource:
        "salesman_notebook",

      items:
        calculatedItems,

      totalAmount:
        calculatedTotal,

      // IMPORTANT:
      // Comes from worker checkout
      status:
        selectedStatus
    });

    // ======================================
    // SAVE ORDER
    // ======================================

    await order.save();

    // ======================================
    // POPULATE RESPONSE
    // ======================================

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "shopName ownerName phone address customerCode priceTier"
        )
        .populate(
          "createdBy",
          "shopName ownerName role"
        )
        .populate(
          "items.product"
        );

    // ======================================
    // RESPONSE
    // ======================================

    return res
      .status(201)
      .json(populatedOrder);

  } catch (error) {
    console.error(
      "Create notebook order error:",
      error
    );

    return res
      .status(
        error.statusCode || 500
      )
      .json({
        message:
          error.message ||
          "Failed to create notebook order"
      });
  }
};
// ==========================================
// CUSTOMER – OWN ORDER HISTORY
// ==========================================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
};

// ==========================================
// CUSTOMER – SINGLE OWN ORDER VIEW
// ==========================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate(
        "user",
        "shopName ownerName phone customerCode priceTier"
      )
      .populate(
        "createdBy",
        "shopName ownerName role"
      )
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.json(order);
  } catch (error) {
    console.error("Get customer order error:", error);

    return res.status(500).json({
      message: "Failed to fetch order"
    });
  }
};

// ==========================================
// ADMIN – ALL ORDERS WITH FILTERS
// ==========================================
// ==========================================
// ADMIN – ALL ORDERS WITH FILTERS
// ==========================================
exports.getAdminOrders = async (req, res) => {
  try {
    const {
      status,
      source,
      fromDate,
      toDate
    } = req.query;

    const filter = {};

    // ======================================
    // STATUS FILTER
    // ======================================
    if (
      status &&
      status !== "all"
    ) {
      filter.status = status;
    }

    // ======================================
    // SOURCE FILTER
    // ======================================
    if (
      source &&
      source !== "all"
    ) {
      filter.orderSource = source;
    }

    // ======================================
    // DATE FILTER
    // ======================================
    if (
      fromDate ||
      toDate
    ) {
      filter.createdAt = {};

      // FROM DATE
      if (fromDate) {
        const startDate =
          new Date(
            `${fromDate}T00:00:00.000+05:30`
          );

        if (
          Number.isNaN(
            startDate.getTime()
          )
        ) {
          return res
            .status(400)
            .json({
              message:
                "Invalid fromDate format"
            });
        }

        filter.createdAt.$gte =
          startDate;
      }

      // TO DATE
      if (toDate) {
        const endDate =
          new Date(
            `${toDate}T23:59:59.999+05:30`
          );

        if (
          Number.isNaN(
            endDate.getTime()
          )
        ) {
          return res
            .status(400)
            .json({
              message:
                "Invalid toDate format"
            });
        }

        filter.createdAt.$lte =
          endDate;
      }
    }

    // ======================================
    // FETCH ORDERS
    // ======================================
    const orders =
      await Order.find(filter)

        // ----------------------------------
        // CUSTOMER DETAILS
        //
        // address is included because
        // MANAK uses address as the
        // village / location field.
        // ----------------------------------
        .populate(
          "user",
          "shopName ownerName phone address customerCode priceTier"
        )

        // ----------------------------------
        // ORDER CREATOR
        // ----------------------------------
        .populate(
          "createdBy",
          "shopName ownerName role"
        )

        // ----------------------------------
        // PRODUCT DETAILS
        // ----------------------------------
        .populate(
          "items.product"
        )

        // ----------------------------------
        // NEWEST FIRST
        // ----------------------------------
        .sort({
          createdAt: -1
        });

    return res.json(
      orders
    );
  } catch (error) {
    console.error(
      "Get admin orders error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to fetch admin orders"
      });
  }
};
// ==========================================
// ADMIN – SINGLE ORDER VIEW
// ==========================================
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(
        "user",
        "shopName ownerName phone customerCode priceTier"
      )
      .populate(
        "createdBy",
        "shopName ownerName role"
      )
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.json(order);
  } catch (error) {
    console.error("Get admin order error:", error);

    return res.status(500).json({
      message: "Failed to fetch order"
    });
  }
};

// ==========================================
// ADMIN – UPDATE ORDER STATUS
// ==========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "packed",
      "delivered"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed: pending, packed, delivered"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.status = status;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate(
        "user",
        "shopName ownerName phone customerCode priceTier"
      )
      .populate(
        "createdBy",
        "shopName ownerName role"
      )
      .populate("items.product");

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Failed to update order status"
    });
  }
};

// ==========================================
// ADMIN – EXPORT ORDERS TO EXCEL
// ==========================================
exports.exportOrdersExcel = async (req, res) => {
  try {
    const {
      fromDate,
      toDate
    } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "From date and to date are required"
      });
    }

    const startDate = new Date(
      `${fromDate}T00:00:00.000+05:30`
    );

    const endDate = new Date(
      `${toDate}T23:59:59.999+05:30`
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        message: "From date cannot be after to date"
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate(
        "user",
        "shopName ownerName phone customerCode priceTier"
      )
      .populate(
        "createdBy",
        "shopName ownerName role"
      )
      .populate("items.product")
      .sort({ createdAt: 1 });

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Manak";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
  {
    header: "Order ID",
    key: "orderId",
    width: 28
  },
  {
    header: "Date Placed",
    key: "datePlaced",
    width: 22
  },
  {
    header: "Customer ID",
    key: "customerId",
    width: 18
  },
  {
    header: "Shop Name",
    key: "shopName",
    width: 28
  },
  {
    header: "Owner Name",
    key: "ownerName",
    width: 25
  },
  {
    header: "Phone",
    key: "phone",
    width: 18
  },
  {
    header: "Product Code",
    key: "productCode",
    width: 18
  },
  {
    header: "Product",
    key: "product",
    width: 30
  },
  {
    header: "Boxes",
    key: "boxes",
    width: 10
  },
  {
    header: "Pieces",
    key: "pieces",
    width: 10
  },
  {
    header: "Pieces Per Box",
    key: "piecesPerBox",
    width: 16
  },
  {
    header: "Total Pieces",
    key: "totalPieces",
    width: 14
  },
  {
    header: "Rate Per Piece",
    key: "rate",
    width: 16
  },
  {
    header: "Item Amount",
    key: "itemAmount",
    width: 16
  },
  {
    header: "Source",
    key: "source",
    width: 22
  },
  {
    header: "Status",
    key: "status",
    width: 15
  },
  {
    header: "Order Total",
    key: "totalAmount",
    width: 15
  }
];
// ==========================================
// ADD ORDER ITEMS TO EXCEL
// ==========================================
for (const order of orders) {
  for (const item of order.items || []) {
    worksheet.addRow({
      orderId:
        order._id.toString(),

      datePlaced:
        order.createdAt
          ? order.createdAt.toLocaleString(
              "en-IN",
              {
                timeZone: "Asia/Kolkata"
              }
            )
          : "",

      customerId:
        order.customerCode ||
        order.user?.customerCode ||
        "",

      shopName:
        order.user?.shopName || "",

      ownerName:
        order.user?.ownerName || "",

      phone:
        order.user?.phone || "",

      productCode:
        item.product?.productCode ||
        "",

      product:
        item.product?.name || "",

      boxes:
        Number(item.boxes || 0),

      pieces:
        Number(item.pieces || 0),

      piecesPerBox:
        Number(
          item.piecesPerBox || 0
        ),

      totalPieces:
        Number(
          item.totalPieces || 0
        ),

      rate:
        Number(item.rate || 0),

      itemAmount:
        Number(item.amount || 0),

      source:
        order.orderSource ===
        "customer_direct"
          ? "Customer Direct"
          : order.orderSource ===
            "salesman_notebook"
            ? "Salesman Notebook"
            : "",

      status:
        order.status || "",

      totalAmount:
        Number(
          order.totalAmount || 0
        )
    });
  }
}
// ==========================================
// HEADER STYLE
// ==========================================
worksheet.getRow(1).font = {
  bold: true
};

// ==========================================
// FREEZE HEADER
// ==========================================
worksheet.views = [
  {
    state: "frozen",
    ySplit: 1
  }
];

// ==========================================
// AUTO FILTER
// ==========================================
worksheet.autoFilter = {
  from: "A1",
  to: "Q1"
};

// ==========================================
// FILE NAME
// ==========================================
const fileName =
  `orders_${fromDate}_to_${toDate}.xlsx`;

// ==========================================
// RESPONSE HEADERS
// ==========================================
res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

res.setHeader(
  "Content-Disposition",
  `attachment; filename="${fileName}"`
);

// ==========================================
// SEND EXCEL FILE
// ==========================================
await workbook.xlsx.write(res);

return res.end();
  } catch (error) {
    console.error(
      "Export orders Excel error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to export orders"
      });
    }
  }
};
  