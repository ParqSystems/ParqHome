const mongoose = require("mongoose");


const requestSchema = new mongoose.Schema({
    familyId: {
        type: String,
        required: true,
        index: true
    },
    requests: [
        {
            memberEmail: {
                type: String,
                required: true
            },
            memberName: String,
            memberPhone: String,
            status: {
                type: String,
                enum: ["pending", "approved-member", "approved-guest", "rejected"],
                default: "pending"
            },
            requestedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model("requests", requestSchema);