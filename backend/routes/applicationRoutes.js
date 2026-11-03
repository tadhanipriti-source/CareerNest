const express = require("express");
const router = express.Router();

const {
    applyJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

// Job Seeker: Apply for a job
router.post("/:jobId/apply", protect, applyJob);

// Job Seeker: View own applications
router.get("/my-applications", protect, getMyApplications);

// Employer: View applications for own job
router.get("/:jobId/applications", protect, getJobApplications);

// Employer: Update application status
router.patch("/:applicationId/status", protect, updateApplicationStatus);

module.exports = router;