const Brand = require("../models/brand");

// CREATE BRAND
exports.createBrand = async (req, res) => {
   console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  try {
    const { name, company, displayOrder } = req.body;

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    if (!name || !company) {
      return res.status(400).json({
        message: "Name and company are required",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        message: "Brand image is required",
      });
    }

    const existing = await Brand.findOne({
      name: name.trim(),
      company,
    });

    if (existing) {
      return res.status(400).json({
        message: "Brand already exists in this company",
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      company,
      image: imageFile.path,
      displayOrder,
      isActive: true,
    });

    res.status(201).json(brand);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// GET ALL BRANDS
// GET ALL BRANDS
exports.getBrands = async (req, res) => {
  try {
    const filter = {};

    // Customer only sees active brands
    if (req.user.role === "customer") {
      filter.isActive = true;
    }

    const brands = await Brand.find(filter)
      .populate("company")
      .sort({
        displayOrder: 1,
        name: 1,
      });

    res.json(brands);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET BRANDS OF COMPANY
exports.getBrandsByCompany = async (req, res) => {
  try {
    const brands = await Brand.find({
      company: req.params.companyId,
      isActive: true,
    }).sort({
      name: 1,
    });

    res.json(brands);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    const { name, company, displayOrder, isActive } = req.body;

    if (name) brand.name = name;
    if (company) brand.company = company;

    if (displayOrder !== undefined) {
      brand.displayOrder = displayOrder;
    }

    if (isActive !== undefined) {
      brand.isActive = isActive;
    }

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    if (imageFile) {
      brand.image = imageFile.path;
    }

    await brand.save();

    res.json(brand);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE BRAND (Soft Delete)
// TOGGLE BRAND STATUS
exports.toggleBrandStatus = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    brand.isActive = !brand.isActive;

    await brand.save();

    res.json({
      message: `Brand ${
        brand.isActive ? "activated" : "deactivated"
      } successfully`,
      brand,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};