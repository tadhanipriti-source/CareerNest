
const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    updateProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user
router.get("/me", protect, getMe);

// Update profile
router.put("/profile", protect, updateProfile);

module.exports = router;
