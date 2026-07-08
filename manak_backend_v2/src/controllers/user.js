const User = require("../models/user");
const bcrypt = require("bcryptjs");
// ==========================================
// WORKER / ADMIN – CUSTOMER SUGGESTIONS
// ==========================================
exports.searchCustomers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (
      req.user.role !== "worker" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const search = q.trim();

    if (search.length < 2) {
      return res.json([]);
    }

    const customers = await User.find({
      role: "customer",
      isActive: true,
      $or: [
        {
          shopName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          ownerName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          customerCode: {
            $regex: search,
            $options: "i"
          }
        },
        {
          phone: {
            $regex: search,
            $options: "i"
          }
        }
      ]
    })
      .select(
        "shopName ownerName phone customerCode address "
      )
      .limit(10);

    return res.json(customers);
  } catch (error) {
    console.error("Search customers error:", error);

    return res.status(500).json({
      message: "Failed to search customers"
    });
  }
};

/* ======================================================
                    GET ALL USERS
====================================================== */

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);

    return res.status(500).json({
      message:
        err.message || "Unable to fetch users",
    });
  }
};

/* ======================================================
                    CREATE USER
====================================================== */

exports.createUser = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phone,
      email,
      password,
      address,
      role,
      customerCode,
      priceTier,
      isActive,
    } = req.body;

    /* ---------------- REQUIRED FIELDS ---------------- */

    if (!ownerName || !email || !password) {
      return res.status(400).json({
        message:
          "Owner name, email and password are required",
      });
    }

    /* ---------------- ROLE VALIDATION ---------------- */

    const finalRole = role || "customer";

    if (
      !["customer", "worker"].includes(finalRole)
    ) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    /* ---------------- NORMALIZE EMAIL ---------------- */

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    /* ---------------- DUPLICATE EMAIL ---------------- */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    /* ---------------- CUSTOMER CODE ---------------- */

    const normalizedCustomerCode =
      finalRole === "customer" &&
      customerCode?.trim()
        ? customerCode.trim().toUpperCase()
        : undefined;

    /* ---------------- DUPLICATE CUSTOMER CODE ---------------- */

    if (normalizedCustomerCode) {
      const existingCode = await User.findOne({
        customerCode: normalizedCustomerCode,
      });

      if (existingCode) {
        return res.status(400).json({
          message: "Customer ID already exists",
        });
      }
    }

    /* ---------------- HASH PASSWORD ---------------- */

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    /* ---------------- CREATE USER ---------------- */

    const user = await User.create({
      ownerName: ownerName.trim(),

      phone: phone || "",

      email: normalizedEmail,

      password: hashedPassword,

      role: finalRole,

      shopName:
        finalRole === "customer"
          ? shopName || ""
          : "",

      address:
        finalRole === "customer"
          ? address || ""
          : "",

      customerCode:
        finalRole === "customer"
          ? normalizedCustomerCode
          : undefined,

      priceTier:
        finalRole === "customer"
          ? priceTier || "A"
          : "A",

      isActive:
        isActive !== undefined
          ? isActive === true ||
            isActive === "true"
          : true,
    });

    /* ---------------- SAFE RESPONSE ---------------- */

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(201).json(safeUser);
  } catch (err) {
    console.error("CREATE USER ERROR:", err);

    /* MongoDB duplicate protection */

    if (err.code === 11000) {
      const duplicateField = Object.keys(
        err.keyPattern ||
          err.keyValue ||
          {}
      )[0];

      if (duplicateField === "email") {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      if (
        duplicateField === "customerCode"
      ) {
        return res.status(400).json({
          message: "Customer ID already exists",
        });
      }

      return res.status(400).json({
        message: "Duplicate value already exists",
      });
    }

    return res.status(500).json({
      message:
        err.message || "Unable to create user",
    });
  }
};

/* ======================================================
                    UPDATE USER
====================================================== */

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      shopName,
      ownerName,
      phone,
      email,
      password,
      address,
      role,
      customerCode,
      priceTier,
      isActive,
    } = req.body;

    /* ---------------- ROLE VALIDATION ---------------- */

    if (
      role &&
      !["customer", "worker"].includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    /* ---------------- BASIC DETAILS ---------------- */

    if (ownerName !== undefined) {
      user.ownerName = ownerName.trim();
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    /* ---------------- EMAIL ---------------- */

    if (email !== undefined) {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,

        _id: {
          $ne: user._id,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    /* ---------------- FINAL ROLE ---------------- */

    const finalRole =
      role !== undefined
        ? role
        : user.role;

    user.role = finalRole;

    /* ---------------- CUSTOMER FIELDS ---------------- */

    if (finalRole === "customer") {
      if (shopName !== undefined) {
        user.shopName = shopName;
      }

      if (address !== undefined) {
        user.address = address;
      }

      if (priceTier !== undefined) {
        user.priceTier = priceTier;
      }

      /* Customer Code */

      if (customerCode !== undefined) {
        const normalizedCustomerCode =
          customerCode?.trim()
            ? customerCode
                .trim()
                .toUpperCase()
            : undefined;

        if (normalizedCustomerCode) {
          const existingCode =
            await User.findOne({
              customerCode:
                normalizedCustomerCode,

              _id: {
                $ne: user._id,
              },
            });

          if (existingCode) {
            return res.status(400).json({
              message:
                "Customer ID already exists",
            });
          }
        }

        user.customerCode =
          normalizedCustomerCode;
      }
    } else {
      /* Worker cleanup */

      user.shopName = "";
      user.address = "";
      user.priceTier = "A";
      user.customerCode = undefined;
    }

    /* ---------------- STATUS ---------------- */

    if (isActive !== undefined) {
      user.isActive =
        isActive === true ||
        isActive === "true";
    }

    /* ---------------- PASSWORD ---------------- */

    if (
      password &&
      password.trim() !== ""
    ) {
      user.password = await bcrypt.hash(
        password.trim(),
        10
      );
    }

    /* ---------------- SAVE ---------------- */

    await user.save();

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.json(safeUser);
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    /* MongoDB duplicate protection */

    if (err.code === 11000) {
      const duplicateField = Object.keys(
        err.keyPattern ||
          err.keyValue ||
          {}
      )[0];

      if (duplicateField === "email") {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      if (
        duplicateField === "customerCode"
      ) {
        return res.status(400).json({
          message: "Customer ID already exists",
        });
      }

      return res.status(400).json({
        message: "Duplicate value already exists",
      });
    }

    return res.status(500).json({
      message:
        err.message || "Unable to update user",
    });
  }
};

/* ======================================================
                  TOGGLE USER STATUS
====================================================== */

exports.toggleUserStatus = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message:
          "Admin status cannot be changed here",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    const safeUser = await User.findById(
      user._id
    ).select("-password");

    return res.json({
      message: `User ${
        user.isActive
          ? "activated"
          : "deactivated"
      } successfully`,

      user: safeUser,
    });
  } catch (err) {
    console.error(
      "TOGGLE USER STATUS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Unable to update user status",
    });
  }
};
// ==========================================
// GET ACTIVE CUSTOMERS FOR WORKER
// ==========================================
exports.getCustomersForWorker = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
      isActive: true,
    })
      .select(
        "_id shopName ownerName phone customerCode address priceTier"
      )
      .sort({
        shopName: 1,
      });

    return res.status(200).json(customers);
  } catch (err) {
    console.error(
      "GET WORKER CUSTOMERS ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};