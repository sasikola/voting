const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../middleware/jwtAuth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      age,
      aadharCardNumber,
      email,
      password,
      mobile,
      address,
      role,
      isVoted,
    } = req.body;
    let existingUser = await User.findOne({
      aadharCardNumber: aadharCardNumber,
    });
    if (existingUser) {
      res.json({ error: "User exists with this username or email" });
    }

    const admin = await User.findOne({ role: "admin" });
    if (role === "admin" && admin) {
      return res.status(400).json({ error: "Admin already exists!" });
    }

    if (!/^\d{12}$/.test(aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      age,
      aadharCardNumber,
      email,
      password: hashedPassword,
      mobile,
      address,
      role,
      isVoted,
    });
    const response = await user.save();
    const payload = {
      _id: response.id,
    };
    const token = generateToken(payload);
    res.json({
      message: "User registered successfully!",
      response: response,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found with this Aadhar Number!" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    // to generate token
    const payload = {
      _id: user.id,
    };
    const token = generateToken(payload);

    res.status(200).json({ message: "Logged in successfully!", token: token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error });
  }
});

module.exports = router;
