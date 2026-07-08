const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ======================================================
                    REGISTER
====================================================== */

exports.register = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phone,
      email,
      password,
      address,
    } = req.body;

    // Required fields check
    if (!ownerName || !email || !password) {
      return res.status(400).json({
        message:
          "Owner name, email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // Duplicate user check
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create customer
    const user = await User.create({
      shopName: shopName || "",
      ownerName: ownerName.trim(),
      phone: phone || "",
      email: normalizedEmail,
      password: hashedPassword,
      address: address || "",

      // Public registration always creates customer
      role: "customer",

      // Default customer price tier
      priceTier: "A",

      isActive: true,
    });

    // Never return password
    const safeUser = {
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      phone: user.phone,
      email: user.email,
      address: user.address,
      role: user.role,
      priceTier: user.priceTier,
      isActive: user.isActive,
    };

    return res.status(201).json({
      token: generateToken(
        user._id,
        user.role
      ),
      user: safeUser,
    });

  } catch (err) {
    console.error(
      "REGISTER ERROR:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Unable to register user",
    });
  }
};

/* ======================================================
                      LOGIN
====================================================== */

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Required fields check
    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Validate credentials
    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Block inactive users
    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive. Contact admin.",
      });
    }

    // Never return password
    const safeUser = {
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      phone: user.phone,
      email: user.email,
      address: user.address,
      role: user.role,
      priceTier: user.priceTier,
      isActive: user.isActive,
    };

    return res.json({
      token: generateToken(
        user._id,
        user.role
      ),
      user: safeUser,
    });

  } catch (err) {
    console.error(
      "LOGIN ERROR:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Unable to login",
    });
  }
};