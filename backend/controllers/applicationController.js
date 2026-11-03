const Application = require("../models/Application");
const Job = require("../models/Job");

// Apply for a Job
const applyJob = async (req, res) => {
    try {
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({
                success: false,
                message: "Only job seekers can apply for jobs"
            });
        }

        const { coverLetter } = req.body;
        const jobId = req.params.jobId;

        const job = await Job.findOne({
            _id: jobId,
            isActive: true
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or inactive"
            });
        }

        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        const application = await Application.create({
            job: jobId,
            applicant: req.user._id,
            coverLetter: coverLetter || ""
        });

        res.status(201).json({
            success: true,
            message: "Job application submitted successfully!",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get My Applications (Job Seeker)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user._id
        })
            .populate("job")
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Applications for Employer's Jobs
const getJobApplications = async (req, res) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({
                success: false,
                message: "Only employers can view job applications"
            });
        }

        const job = await Job.findOne({
            _id: req.params.jobId,
            employer: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const applications = await Application.find({
            job: job._id
        })
            .populate("applicant", "name email phone skills resume")
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Update Application Status (Employer)
const updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== "employer") {
            return res.status(403).json({
                success: false,
                message: "Only employers can update application status"
            });
        }

        const { status } = req.body;

        const allowedStatus = [
            "Pending",
            "Reviewed",
            "Shortlisted",
            "Rejected",
            "Selected"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        const application = await Application.findById(
            req.params.applicationId
        ).populate("job");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (
            !application.job ||
            application.job.employer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this application"
            });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            success: true,
            message: "Application status updated successfully!",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Export All Functions
module.exports = {
    applyJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
};