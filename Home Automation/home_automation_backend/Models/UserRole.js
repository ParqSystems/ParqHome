const mongoose = require("mongoose");


const userRoleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userDetails",
        required: true
    },
    familyId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "member", "guest"],
        required: true
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true });


userRoleSchema.index({ userId: 1, familyId: 1 }, { unique: true });


module.exports = mongoose.model("userRoles", userRoleSchema);