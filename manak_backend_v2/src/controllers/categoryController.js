const Category = require(
  "../models/category"
);

// ==========================================
// HELPER: ESCAPE REGEX
// ==========================================
const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ==========================================
// CREATE CATEGORY
// ==========================================
exports.createCategory = async (
  req,
  res
) => {
  try {
    const {
      name,
      displayOrder,
    } = req.body;

    const imageFile =
      req.files?.find(
        (file) =>
          file.fieldname === "image"
      );

    // --------------------------------------
    // VALIDATION
    // --------------------------------------
    if (!name || !name.trim()) {
      return res.status(400).json({
        message:
          "Category name is required",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        message:
          "Category image is required",
      });
    }

    const cleanName =
      name.trim();

    // --------------------------------------
    // GLOBAL DUPLICATE CHECK
    //
    // Soap and soap are treated as same
    // --------------------------------------
    const existing =
      await Category.findOne({
        name: {
          $regex: new RegExp(
            `^${escapeRegex(
              cleanName
            )}$`,
            "i"
          ),
        },
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Category already exists",
      });
    }

    // --------------------------------------
    // CREATE GLOBAL CATEGORY
    // --------------------------------------
    const category =
      await Category.create({
        name: cleanName,

        image:
          imageFile.path,

        displayOrder:
          Number(displayOrder) || 0,

        isActive: true,
      });

    return res
      .status(201)
      .json(category);
  } catch (err) {
    console.error(
      "Create category error:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to create category",
    });
  }
};

// ==========================================
// GET ALL CATEGORIES
// ==========================================
exports.getCategories = async (
  req,
  res
) => {
  try {
    const filter = {};

    /*
      Customer and worker shopping UI
      should only see active categories.

      Admin can see active + inactive.
    */
    if (
      req.user.role === "customer" ||
      req.user.role === "worker"
    ) {
      filter.isActive = true;
    }

    const categories =
      await Category.find(filter)
        .sort({
          displayOrder: 1,
          name: 1,
        });

    return res.json(categories);
  } catch (err) {
    console.error(
      "Get categories error:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to load categories",
    });
  }
};

// ==========================================
// GET BY BRAND
//
// IMPORTANT:
// Categories are now GLOBAL.
//
// But we keep this function temporarily
// because your existing frontend has:
//
// /brand/:brandId/categories
//
// Instead of Category.find({ brand }),
// we derive categories from products
// belonging to that brand.
// ==========================================
exports.getCategoriesByBrand = async (
  req,
  res
) => {
  try {
    /*
      Require here to avoid changing
      other controller imports.
    */
    const Product = require(
      "../models/product"
    );

    const {
      brandId,
    } = req.params;

    // --------------------------------------
    // FIND ACTIVE PRODUCTS OF BRAND
    // --------------------------------------
    const products =
      await Product.find({
        brand: brandId,
        isActive: true,
      })
        .select("category")
        .lean();

    // --------------------------------------
    // UNIQUE CATEGORY IDS
    // --------------------------------------
    const categoryIds = [
      ...new Set(
        products
          .map((product) =>
            product.category
              ? String(
                  product.category
                )
              : null
          )
          .filter(Boolean)
      ),
    ];

    if (
      categoryIds.length === 0
    ) {
      return res.json([]);
    }

    // --------------------------------------
    // LOAD GLOBAL CATEGORIES
    // --------------------------------------
    const categories =
      await Category.find({
        _id: {
          $in: categoryIds,
        },

        isActive: true,
      }).sort({
        displayOrder: 1,
        name: 1,
      });

    return res.json(categories);
  } catch (err) {
    console.error(
      "Get categories by brand error:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to load brand categories",
    });
  }
};

// ==========================================
// UPDATE CATEGORY
// ==========================================
exports.updateCategory = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        message:
          "Category not found",
      });
    }

    const {
      name,
      displayOrder,
      isActive,
    } = req.body;

    // --------------------------------------
    // UPDATE NAME
    // --------------------------------------
    if (
      name !== undefined &&
      name.trim()
    ) {
      const cleanName =
        name.trim();

      // Check another global category
      // with same name
      const duplicate =
        await Category.findOne({
          _id: {
            $ne: category._id,
          },

          name: {
            $regex: new RegExp(
              `^${escapeRegex(
                cleanName
              )}$`,
              "i"
            ),
          },
        });

      if (duplicate) {
        return res
          .status(400)
          .json({
            message:
              "Category already exists",
          });
      }

      category.name =
        cleanName;
    }

    // --------------------------------------
    // UPDATE DISPLAY ORDER
    // --------------------------------------
    if (
      displayOrder !== undefined
    ) {
      category.displayOrder =
        Number(displayOrder) || 0;
    }

    // --------------------------------------
    // UPDATE ACTIVE STATUS
    // --------------------------------------
    if (
      isActive !== undefined
    ) {
      /*
        Handles:
        true / false
        "true" / "false"
      */
      category.isActive =
        isActive === true ||
        isActive === "true";
    }

    // --------------------------------------
    // UPDATE IMAGE
    // --------------------------------------
    const imageFile =
      req.files?.find(
        (file) =>
          file.fieldname === "image"
      );

    if (imageFile) {
      category.image =
        imageFile.path;
    }

    await category.save();

    return res.json(category);
  } catch (err) {
    console.error(
      "Update category error:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to update category",
    });
  }
};

// ==========================================
// TOGGLE CATEGORY STATUS
// ==========================================
exports.toggleCategoryStatus = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        message:
          "Category not found",
      });
    }

    category.isActive =
      !category.isActive;

    await category.save();

    return res.json({
      message: `Category ${
        category.isActive
          ? "activated"
          : "deactivated"
      } successfully`,

      category,
    });
  } catch (err) {
    console.error(
      "Toggle category status error:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to update category status",
    });
  }
};