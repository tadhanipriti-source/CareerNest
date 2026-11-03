const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    company: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    requirements: [{
        type: String
    }],

    location: {
        type: String,
        required: true
    },

    jobType: {
        type: String,
        enum: ["Full Time", "Part Time", "Internship", "Remote"],
        default: "Full Time"
    },

    salary: {
        type: String,
        default: "Not Disclosed"
    },

    experience: {
        type: String,
        default: "Fresher"
    },

    skills: [{
        type: String
    }],

    companyLogo: {
        type: String,
        default: ""
    },

    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Job", jobSchema);