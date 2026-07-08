const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      trim: true,
      default: "",
    },

    ownerName: {
      type: String,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "customer", "worker"],
      default: "customer",
    },
    customerCode: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    default: undefined,
},
    priceTier: {
      type: String,
      enum: ["A", "B", "C"],
      default: "C",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);