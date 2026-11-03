
const Job = require("../models/Job");

// Create Job
const createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            description,
            requirements,
            location,
            jobType,
            salary,
            experience,
            skills
        } = req.body;

        if (!title || !company || !description || !location) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const job = await Job.create({
            title,
            company,
            description,
            requirements: requirements || [],
            location,
            jobType: jobType || "Full Time",
            salary: salary || "Not Disclosed",
            experience: experience || "Fresher",
            skills: skills || [],
            employer: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Job posted successfully!",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Active Jobs
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true })
            .populate("employer", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Employer Jobs
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            employer: req.user._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Job
const updateJob = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "company",
            "description",
            "requirements",
            "location",
            "jobType",
            "salary",
            "experience",
            "skills"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const job = await Job.findOneAndUpdate(
            {
                _id: req.params.id,
                employer: req.user._id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.json({
            success: true,
            message: "Job updated successfully!",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Job
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            employer: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        await job.deleteOne();

        res.json({
            success: true,
            message: "Job deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getMyJobs,
    updateJob,
    deleteJob
};
