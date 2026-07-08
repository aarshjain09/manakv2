const Company = require("../models/company");

/* ======================================================
                    CREATE COMPANY
====================================================== */

exports.createCompany = async (req, res) => {
  try {
    const { name, displayOrder = 0 } = req.body;

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        message: "Company image is required",
      });
    }

    const existing = await Company.findOne({
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "Company already exists",
      });
    }

    const company = await Company.create({
      name: name.trim(),
      image: imageFile.path,
      displayOrder: Number(displayOrder),
      isActive: true,
    });

    res.status(201).json(company);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ======================================================
                    GET ALL COMPANIES
====================================================== */

/* ======================================================
                    GET ALL COMPANIES
====================================================== */

exports.getCompanies = async (req, res) => {
  try {
    const filter = {};

    // Customer only sees active companies
    if (req.user.role === "customer") {
      filter.isActive = true;
    }

    const companies = await Company.find(filter)
      .sort({
        displayOrder: 1,
        name: 1,
      });

    res.json(companies);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
/* ======================================================
                    GET COMPANY BY ID
====================================================== */

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.json(company);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ======================================================
                    UPDATE COMPANY
====================================================== */

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const { name, displayOrder, isActive } = req.body;

    if (name !== undefined) {
      const existing = await Company.findOne({
        name: name.trim(),
        _id: { $ne: company._id },
      });

      if (existing) {
        return res.status(400).json({
          message: "Company already exists",
        });
      }

      company.name = name.trim();
    }

    if (displayOrder !== undefined) {
      company.displayOrder = Number(displayOrder);
    }

    if (isActive !== undefined) {
      company.isActive = isActive;
    }

    const imageFile = req.files?.find(
      (file) => file.fieldname === "image"
    );

    if (imageFile) {
      company.image = imageFile.path;
    }

    await company.save();

    res.json(company);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ======================================================
                TOGGLE ACTIVE / INACTIVE
====================================================== */

exports.toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    company.isActive = !company.isActive;

    await company.save();

    res.json(company);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ======================================================
                    SEARCH COMPANIES
====================================================== */

exports.searchCompanies = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const companies = await Company.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).sort({
      displayOrder: 1,
      name: 1,
    });

    res.json(companies);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};