const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ---------------- Basic Details ----------------

    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Lowercase name for faster search
    productNameLower: {
      type: String,
      default: "",
    },

    // ---------------- Hierarchy ----------------

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ---------------- Pricing ----------------

    mrp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Price Per Piece
    priceA: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    priceB: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    priceC: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Margin %
    margin: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ---------------- Packing ----------------

    piecesPerBox: {
      type: Number,
      default: 1,
      min: 1,
    },

    allowPieceSale: {
      type: Boolean,
      default: true,
    },

    // ---------------- Stock ----------------

    stockBoxes: {
      type: Number,
      default: 0,
      min: 0,
    },

    stockPieces: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ---------------- Media ----------------

    image: {
      type: String,
      default: "",
    },

    // ---------------- Search ----------------

    searchKeywords: {
      type: [String],
      default: [],
    },

    // ---------------- Display ----------------

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

/* ======================================================
                        INDEXES
====================================================== */

productSchema.index({
  productCode: 1,
});

productSchema.index({
  barcode: 1,
});

productSchema.index({
  company: 1,
  brand: 1,
  category: 1,
});

productSchema.index({
  productNameLower: 1,
});

productSchema.index({
  searchKeywords: 1,
});

/* ======================================================
                AUTO SEARCH KEYWORDS
====================================================== */

productSchema.pre(
  "save",
  async function () {
    // Only rebuild search data when relevant fields change
    if (
      !this.isModified("name") &&
      !this.isModified("productCode") &&
      !this.isModified("barcode") &&
      !this.isModified("company") &&
      !this.isModified("brand") &&
      !this.isModified("category")
    ) {
      return;
    }

    /* ---------------- LOWERCASE NAME ---------------- */

    this.productNameLower = String(
      this.name || ""
    )
      .toLowerCase()
      .trim();

    /* ---------------- POPULATE HIERARCHY ---------------- */

    await this.populate(
      "company",
      "name"
    );

    await this.populate(
      "brand",
      "name"
    );

    await this.populate(
      "category",
      "name"
    );

    /* ---------------- KEYWORD SET ---------------- */

    const keywords = new Set();

    const addText = (text) => {
      if (!text) return;

      const value = String(text)
        .toLowerCase()
        .trim();

      if (!value) return;

      // Complete value
      keywords.add(value);

      // Individual words
      const words = value
        .split(/[\s\-_/]+/)
        .filter(Boolean);

      words.forEach((word) => {
        keywords.add(word);
      });

      // Joined version
      keywords.add(
        value.replace(
          /[\s\-_/]+/g,
          ""
        )
      );

      // Adjacent word combinations
      if (words.length >= 2) {
        for (
          let i = 0;
          i < words.length - 1;
          i++
        ) {
          keywords.add(
            words[i] +
              words[i + 1]
          );
        }
      }
    };

    /* ---------------- PRODUCT DATA ---------------- */

    addText(this.name);

    addText(this.productCode);

    addText(this.barcode);

    /* ---------------- COMPANY ---------------- */

    if (
      this.company &&
      this.company.name
    ) {
      addText(
        this.company.name
      );
    }

    /* ---------------- BRAND ---------------- */

    if (
      this.brand &&
      this.brand.name
    ) {
      addText(
        this.brand.name
      );
    }

    /* ---------------- CATEGORY ---------------- */

    if (
      this.category &&
      this.category.name
    ) {
      addText(
        this.category.name
      );
    }

    /* ---------------- SAVE KEYWORDS ---------------- */

    this.searchKeywords = [
      ...keywords,
    ];
  }
);

/* ======================================================
                        EXPORT
====================================================== */

module.exports = mongoose.model(
  "Product",
  productSchema
);