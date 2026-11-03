const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["jobseeker", "employer", "admin"],
        default: "jobseeker"
    },

    phone: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    },

    resume: {
        type: String,
        default: ""
    },

    skills: [{
        type: String
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);