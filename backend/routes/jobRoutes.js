
const express = require("express");
const router = express.Router();

const {
    createJob,
    getAllJobs,
    getMyJobs,
    updateJob,
    deleteJob
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");

// Public Route
router.get("/", getAllJobs);

// Protected Employer Routes
router.get("/my-jobs", protect, getMyJobs);
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

module.exports = router;
