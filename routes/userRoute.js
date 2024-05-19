const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtAuthMiddleware } = require("../middleware/jwtAuth");
const User = require("../models/User");

const router = express.Router();

// route to get all users
router.get("/users", jwtAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: "Users fetched successfully!", users });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", err });
  }
});

// route to ger profile data
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;

    const userId = userData._id;
    const user = await User.findById(userId);
    res
      .status(200)
      .json({ message: "User profile fetched successfully!", user: user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error });
  }
});

// route to update the profile password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //extract the id from the token
    const { currentPassword, newPassword } = req.body; //extract the both passwords from the body

    // find the user by User id
    const user = await User.findById(userId);
    // check if the current password is correct
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Incorrect password!" });
    }
    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // update the password
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error });
  }
});

module.exports = router;
