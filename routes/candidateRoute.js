const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtAuthMiddleware } = require("../middleware/jwtAuth");
const User = require("../models/User");
const Candidate = require("../models/Candidate");

const router = express.Router();

// to check the role is admin or not
const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error });
  }
};

// route to create a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  const { name, party, age } = req.body;

  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin(req.user._id);
    console.log(userIsAdmin);

    if (!userIsAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can create candidates." });
    }

    // Check if the candidate already exists
    const existingCandidate = await Candidate.findOne({ name, party });
    if (existingCandidate) {
      return res.status(400).json({
        error: "Candidate with the same name and party already exists.",
      });
    }

    // Create new candidate
    const candidate = new Candidate({ name, party, age });
    await candidate.save();

    res
      .status(201)
      .json({ message: "Candidate created successfully", candidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// route to update the candidate details
// router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const { candidateId } = req.params;
//     const { name, party, age } = req.body;
//     const userIsAdmin = await isAdmin(req.user._id);
//     if (!userIsAdmin) {
//       return res
//         .status(403)
//         .json({ error: "Access denied. Only admins can update candidates." });
//     }
//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) {
//       return res.status(404).json({ error: "Candidate not found" });
//     }
//     candidate.name = name;
//     candidate.party = party;
//     candidate.age = age;
//     await candidate.save();
//     res
//       .status(200)
//       .json({ message: "Candidate updated successfully", candidate });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error", error });
//   }
// });

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const data = req.body;
    const userIsAdmin = await isAdmin(req.user._id);
    if (!userIsAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can update candidates." });
    }
    const candidate = await Candidate.findByIdAndUpdate(candidateId, data, {
      new: true, //return updated data
      runValidators: true, //run mongo validation
    });

    res
      .status(200)
      .json({ message: "Candidate updated successfully", candidate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", error });
  }
});

module.exports = router;
