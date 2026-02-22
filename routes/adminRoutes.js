const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * ✅ ADMIN INSERT (ONE TIME ONLY)
 * URL: POST /api/admin/create
 * BODY:
 * {
 *   "email": "admin@gmail.com",
 *   "password": "admin123"
 * }
 */
router.post("/create", async (req, res) => {
  const { email, password } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    return res.status(400).json({ msg: "Admin already exists" });
  }

  const admin = new Admin({ email, password });
  await admin.save();

  res.json({ msg: "Admin created successfully" });
});

/**
 * ✅ ADMIN LOGIN
 * URL: POST /api/admin/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

module.exports = router;
