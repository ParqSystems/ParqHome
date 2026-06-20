const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    passwordHash: {
        type: String
    },
    refreshTokens: [refreshTokenSchema],
    googleToken: {
        type: String
    }
}, { timestamps: true });


module.exports = mongoose.model("userDetails", userSchema);