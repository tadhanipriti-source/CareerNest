
const User = require("../models/User");

// Upload Candidate Resume
const uploadResume = async (req, res) => {
    try {
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({
                success: false,
                message: "Only job seekers can upload resumes"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a PDF resume"
            });
        }

        const resumePath = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { resume: resumePath },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Resume uploaded successfully!",
            resume: user.resume
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { uploadResume };
