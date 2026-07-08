const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Customer whose order this is
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Snapshot for future MARG mapping
    customerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    // Who created the order
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // How order entered Manak
    orderSource: {
      type: String,
      enum: [
        "customer_direct",
        "salesman_notebook"
      ],
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        boxes: {
          type: Number,
          default: 0,
          min: 0
        },

        pieces: {
          type: Number,
          default: 0,
          min: 0
        },

        // Snapshot at order time
        piecesPerBox: {
          type: Number,
          required: true,
          min: 1
        },

        // Price per piece at order time
        rate: {
          type: Number,
          required: true,
          min: 0
        },

        // Total pieces ordered
        totalPieces: {
          type: Number,
          required: true,
          min: 1
        },

        // Final line amount
        amount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "packed",
        "delivered"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);