const mongoose = require("mongoose");

const categorySchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      image: {
        type: String,
        default: "",
      },

      displayOrder: {
        type: Number,
        default: 0,
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

// Global category name must be unique.
// Case-insensitive:
// "SOAP", "Soap", "soap" are treated as same.
categorySchema.index(
  {
    name: 1,
  },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

module.exports = mongoose.model(
  "Category",
  categorySchema
);