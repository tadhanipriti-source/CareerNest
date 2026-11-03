
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resume: {
            type: String,
            default: ""
        },

        coverLetter: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Reviewed",
                "Shortlisted",
                "Rejected",
                "Selected"
            ],
            default: "Pending"
        },

        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// One applicant can apply only once for the same job
applicationSchema.index(
    { job: 1, applicant: 1 },
    { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
