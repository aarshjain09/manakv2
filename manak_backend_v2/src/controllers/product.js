const Product = require("../models/product");

/* =====================================================
                    CONSTANTS
===================================================== */

const PRODUCT_POPULATE = [
  {
    path: "company",
    select: "name image displayOrder",
  },
  {
    path: "brand",
    select: "name image displayOrder",
  },
  {
    path: "category",
    select: "name image displayOrder",
  },
];

/* =====================================================
                    HELPERS
===================================================== */

const normalizeStock = (boxes, pieces, piecesPerBox) => {
  boxes = Number(boxes || 0);
  pieces = Number(pieces || 0);
  piecesPerBox = Number(piecesPerBox || 1);

  const totalPieces = boxes * piecesPerBox + pieces;

  return {
    stockBoxes: Math.floor(totalPieces / piecesPerBox),
    stockPieces: totalPieces % piecesPerBox,
  };
};

/* =====================================================
                CREATE PRODUCT
===================================================== */

exports.createProduct = async (req, res) => {
  try {
    const {
      productCode,
      barcode,
      name,
      company,
      brand,
      category,
      mrp,
      priceA,
      priceB,
      priceC,
      margin = 0,
      piecesPerBox = 1,
      allowPieceSale = true,
      stockBoxes = 0,
      stockPieces = 0,
      displayOrder = 0,
    } = req.body;

    /* ================= Required Validation ================= */

    if (
      !productCode ||
      !name ||
      !company ||
      !brand ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product Code, Product Name, Company, Brand and Category are required.",
      });
    }

    /* ================= Image Validation ================= */

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Product image is required.",
      });
    }

    /* ================= Product Code Validation ================= */

    const normalizedProductCode =
      String(productCode).trim();

    const existingProductCode =
      await Product.findOne({
        productCode: normalizedProductCode,
      });

    if (existingProductCode) {
      return res.status(400).json({
        success: false,
        message: "Product Code already exists.",
      });
    }

    /* ================= Barcode Validation ================= */

    const normalizedBarcode =
      barcode && String(barcode).trim()
        ? String(barcode).trim()
        : undefined;

    if (normalizedBarcode) {
      const existingBarcode =
        await Product.findOne({
          barcode: normalizedBarcode,
        });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: "Barcode already exists.",
        });
      }
    }

    /* ================= Normalize Stock ================= */

    const normalizedStock = normalizeStock(
      stockBoxes,
      stockPieces,
      piecesPerBox
    );

    /* ================= Create Product ================= */

    const product = new Product({
      productCode: normalizedProductCode,

      barcode: normalizedBarcode,

      name: name.trim(),

      company,
      brand,
      category,

      mrp: Number(mrp),

      priceA: Number(priceA),

      priceB: Number(priceB),

      priceC: Number(priceC),

      margin: Number(margin),

      piecesPerBox: Number(piecesPerBox),

      allowPieceSale,

      stockBoxes:
        normalizedStock.stockBoxes,

      stockPieces:
        normalizedStock.stockPieces,

      displayOrder:
        Number(displayOrder),

      image: imageFile.path,

      isActive: true,
    });

    await product.save();

    await product.populate(
      PRODUCT_POPULATE
    );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully.",
      data: product,
    });
  } catch (err) {
    console.error(
      "Create Product Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
                GET ALL PRODUCTS
===================================================== */

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      
    })
      .populate(PRODUCT_POPULATE)
      .sort({
        displayOrder: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Get Products Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
                GET PRODUCT BY ID
===================================================== */

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      PRODUCT_POPULATE
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Get Product Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* =====================================================
                UPDATE PRODUCT
===================================================== */

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    const {
      productCode,
      barcode,
      piecesPerBox,
      stockBoxes,
    stockPieces,
    } = req.body;

    /* =====================================================
                    PRODUCT CODE
    ===================================================== */

    if (
      productCode &&
      productCode.trim() !== product.productCode
    ) {
      const existingProduct = await Product.findOne({
        productCode: productCode.trim(),
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product Code already exists.",
        });
      }
    }

    /* =====================================================
                    BARCODE
    ===================================================== */

    if (
      barcode &&
      barcode.trim() !== "" &&
      barcode.trim() !== product.barcode
    ) {
      const existingBarcode = await Product.findOne({
        barcode: barcode.trim(),
        _id: { $ne: product._id },
      });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: "Barcode already exists.",
        });
      }
    }

    /* =====================================================
                    UPDATE FIELDS
    ===================================================== */

    const allowedFields = [
      "productCode",
      "barcode",
      "name",
      "company",
      "brand",
      "category",
      "mrp",
      "priceA",
      "priceB",
      "priceC",
      "margin",
      "piecesPerBox",
      "allowPieceSale",
      "displayOrder",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    /* =====================================================
                    IMAGE
    ===================================================== */

    if (imageFile) {
      product.image = imageFile.path;
    }

    /* =====================================================
                    STOCK
    ===================================================== */
/* =====================================================
                STOCK
===================================================== */

if (
  stockBoxes !== undefined ||
  stockPieces !== undefined ||
  piecesPerBox !== undefined
) {
  // Preserve actual inventory in pieces
  const totalPieces =
    product.stockBoxes * product.piecesPerBox +
    product.stockPieces;

  // If admin edits stock, use the new values
  const updatedTotalPieces =
    stockBoxes !== undefined || stockPieces !== undefined
      ? Number(stockBoxes || 0) *
          Number(piecesPerBox || product.piecesPerBox) +
        Number(stockPieces || 0)
      : totalPieces;

  const finalPiecesPerBox =
    Number(piecesPerBox || product.piecesPerBox);

  product.stockBoxes = Math.floor(
    updatedTotalPieces / finalPiecesPerBox
  );

  product.stockPieces =
    updatedTotalPieces % finalPiecesPerBox;
}
        /* =====================================================
                    SAVE PRODUCT
    ===================================================== */

    await product.save();

    await product.populate(PRODUCT_POPULATE);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (err) {
    console.error("Update Product Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
            TOGGLE PRODUCT STATUS
===================================================== */

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.isActive = !product.isActive;

    await product.save();

    await product.populate(PRODUCT_POPULATE);

    return res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive ? "activated" : "deactivated"
      } successfully.`,
      data: product,
    });
  } catch (err) {
    console.error("Toggle Product Status Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
                ADD STOCK
===================================================== */

exports.addStock = async (req, res) => {
  try {
    const {
      stockBoxes = 0,
      stockPieces = 0,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const normalizedStock = normalizeStock(
      product.stockBoxes + Number(stockBoxes),
      product.stockPieces + Number(stockPieces),
      product.piecesPerBox
    );

    product.stockBoxes = normalizedStock.stockBoxes;
    product.stockPieces = normalizedStock.stockPieces;

    await product.save();

    await product.populate(PRODUCT_POPULATE);

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully.",
      data: product,
    });
  } catch (err) {
    console.error("Add Stock Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =====================================================
            GET PRODUCTS BY COMPANY
===================================================== */

exports.getProductsByCompany = async (req, res) => {
  try {
    const products = await Product.find({
      company: req.params.companyId,
      isActive: true,
    })
      .populate(PRODUCT_POPULATE)
      .sort({
        displayOrder: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Get Products By Company Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
            GET PRODUCTS BY BRAND
===================================================== */

exports.getProductsByBrand = async (req, res) => {
  try {
    const products = await Product.find({
      brand: req.params.brandId,
      isActive: true,
    })
      .populate(PRODUCT_POPULATE)
      .sort({
        displayOrder: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Get Products By Brand Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
            GET PRODUCTS BY CATEGORY
===================================================== */

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    })
      .populate(PRODUCT_POPULATE)
      .sort({
        displayOrder: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Get Products By Category Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* =====================================================
                DUPLICATE PRODUCT
===================================================== */

exports.duplicateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      PRODUCT_POPULATE
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const duplicate = {
      productCode: "",

      barcode: "",

      name: product.name,

      company: product.company,

      brand: product.brand,

      category: product.category,

      mrp: product.mrp,

      priceA: product.priceA,

      priceB: product.priceB,

      priceC: product.priceC,

      margin: product.margin,

      piecesPerBox: product.piecesPerBox,

      allowPieceSale: product.allowPieceSale,

      stockBoxes: 0,

      stockPieces: 0,

      displayOrder: product.displayOrder,

      image: product.image,

      isActive: true,
    };

    return res.status(200).json({
      success: true,
      message: "Duplicate template generated successfully.",
      data: duplicate,
    });
  } catch (err) {
    console.error("Duplicate Product Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* =====================================================
                SEARCH PRODUCTS
===================================================== */

exports.searchProducts = async (req, res) => {
  try {
    const keyword = String(
      req.params.keyword || ""
    ).trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required.",
      });
    }

    // Escape special regex characters
    const escapedKeyword = keyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const searchRegex = new RegExp(
      escapedKeyword,
      "i"
    );

    const products = await Product.find({
      isActive: true,

      $or: [
        {
          name: searchRegex,
        },
        {
          productCode: searchRegex,
        },
        {
          barcode: searchRegex,
        },
      ],
    })
      .populate(PRODUCT_POPULATE)
      .sort({
        displayOrder: 1,
        name: 1,
      })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error(
      "Search Products Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =====================================================
            GET PRODUCT BY BARCODE
===================================================== */

exports.getProductByBarcode = async (
  req,
  res
) => {
  try {
    const barcode = String(
      req.params.barcode || ""
    ).trim();

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required.",
      });
    }

    const product = await Product.findOne({
      barcode,
      isActive: true,
    }).populate(PRODUCT_POPULATE);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "No product found for this barcode.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(
      "Get Product By Barcode Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* =====================================================
                EXCEL HELPERS
===================================================== */

const getExcelCell = (row, key) => {
  return row[key];
};

const hasExcelValue = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
};

const parseExcelPrice = (
  value,
  fieldName
) => {
  if (!hasExcelValue(value)) {
    throw new Error(
      `${fieldName} cannot be empty.`
    );
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    throw new Error(
      `${fieldName} must be a valid number greater than or equal to 0.`
    );
  }

  return number;
};


/* =====================================================
            DOWNLOAD PRODUCTS EXCEL
===================================================== */

exports.downloadProductsExcel = async (
  req,
  res
) => {
  try {
    const XLSX = require("xlsx");

    const products = await Product.find({})
      .select(
        "productCode name mrp priceA priceB priceC barcode"
      )
      .sort({
        productCode: 1,
      })
      .lean();

    const rows = products.map(
      (product) => ({
        "Product Code":
          product.productCode || "",

        "Product Name":
          product.name || "",

        MRP:
          Number(product.mrp) || 0,

        "Price A":
          Number(product.priceA) || 0,

        "Price B":
          Number(product.priceB) || 0,

        "Price C":
          Number(product.priceC) || 0,

        Barcode:
          product.barcode || "",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    /* ================= COLUMN WIDTHS ================= */

    worksheet["!cols"] = [
      { wch: 18 }, // Product Code
      { wch: 40 }, // Product Name
      { wch: 12 }, // MRP
      { wch: 12 }, // Price A
      { wch: 12 }, // Price B
      { wch: 12 }, // Price C
      { wch: 22 }, // Barcode
    ];

    /* ================= FORCE CODE + BARCODE AS TEXT ================= */

    for (
      let rowNumber = 2;
      rowNumber <= products.length + 1;
      rowNumber++
    ) {
      const productCodeCell =
        worksheet[`A${rowNumber}`];

      const barcodeCell =
        worksheet[`G${rowNumber}`];

      if (productCodeCell) {
        productCodeCell.t = "s";
        productCodeCell.z = "@";
      }

      if (barcodeCell) {
        barcodeCell.t = "s";
        barcodeCell.z = "@";
      }
    }

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Products"
    );

    const buffer = XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    );

    const date = new Date()
      .toISOString()
      .split("T")[0];

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="products-${date}.xlsx"`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (err) {
    console.error(
      "Download Products Excel Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to download products Excel.",
    });
  }
};


/* =====================================================
            UPLOAD PRODUCTS EXCEL
===================================================== */

exports.uploadProductsExcel = async (
  req,
  res
) => {
  try {
    const XLSX = require("xlsx");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select an Excel file.",
      });
    }

    const workbook = XLSX.read(
      req.file.buffer,
      {
        type: "buffer",

        // Important for product codes / barcodes
        cellText: true,
        cellDates: false,
      }
    );

    const firstSheetName =
      workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file does not contain a sheet.",
      });
    }

    const worksheet =
      workbook.Sheets[firstSheetName];

    const rows =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: "",
          raw: false,
        }
      );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file contains no product rows.",
      });
    }

    /* ================= VALIDATE HEADERS ================= */

    const requiredHeaders = [
      "Product Code",
      "Product Name",
      "MRP",
      "Price A",
      "Price B",
      "Price C",
      "Barcode",
    ];

    const actualHeaders = Object.keys(
      rows[0]
    );

    const missingHeaders =
      requiredHeaders.filter(
        (header) =>
          !actualHeaders.includes(header)
      );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Missing Excel columns: ${missingHeaders.join(
            ", "
          )}`,
      });
    }

    const results = {
      totalRows: rows.length,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    /* =====================================================
              PROCESS EACH EXCEL ROW
    ===================================================== */

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      const row = rows[index];

      const excelRowNumber =
        index + 2;

      const productCode = String(
        getExcelCell(
          row,
          "Product Code"
        ) || ""
      ).trim();

      try {
        if (!productCode) {
          throw new Error(
            "Product Code is required."
          );
        }

        const product =
          await Product.findOne({
            productCode,
          });

        if (!product) {
          throw new Error(
            "Product not found."
          );
        }

        /* ================= PRICES ================= */

        const newMrp =
          parseExcelPrice(
            row["MRP"],
            "MRP"
          );

        const newPriceA =
          parseExcelPrice(
            row["Price A"],
            "Price A"
          );

        const newPriceB =
          parseExcelPrice(
            row["Price B"],
            "Price B"
          );

        const newPriceC =
          parseExcelPrice(
            row["Price C"],
            "Price C"
          );

        /* ================= BARCODE ================= */

        const newBarcode = String(
          row["Barcode"] ?? ""
        ).trim();

        if (
          newBarcode &&
          newBarcode !== product.barcode
        ) {
          const duplicateBarcode =
            await Product.findOne({
              barcode: newBarcode,
              _id: {
                $ne: product._id,
              },
            }).select(
              "_id productCode name"
            );

          if (duplicateBarcode) {
            throw new Error(
              `Barcode already used by product ${duplicateBarcode.productCode}.`
            );
          }
        }

        /* ================= CHECK CHANGES ================= */

        const currentBarcode =
          product.barcode || "";

        const hasChanges =
          Number(product.mrp) !==
            newMrp ||
          Number(product.priceA) !==
            newPriceA ||
          Number(product.priceB) !==
            newPriceB ||
          Number(product.priceC) !==
            newPriceC ||
          currentBarcode !==
            newBarcode;

        if (!hasChanges) {
          results.skipped++;
          continue;
        }

        /* ================= UPDATE ================= */

        product.mrp = newMrp;
        product.priceA = newPriceA;
        product.priceB = newPriceB;
        product.priceC = newPriceC;

        if (newBarcode) {
          product.barcode =
            newBarcode;
        } else {
          product.barcode =
            undefined;
        }

        /*
          Using save() intentionally.

          Your Product schema has pre("save")
          logic that rebuilds searchKeywords
          when barcode changes.
        */

        await product.save();

        results.updated++;
      } catch (err) {
        results.failed++;

        results.errors.push({
          row: excelRowNumber,
          productCode,
          message:
            err.code === 11000
              ? "Duplicate Product Code or Barcode."
              : err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Products Excel processed successfully.",
      results,
    });
  } catch (err) {
    console.error(
      "Upload Products Excel Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "Unable to process products Excel.",
    });
  }
};