const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
    familyName: {
        type: String,
        required: true,
        trim:true
    },
    familyId: {
        type: String,
        unique: true,
        required: true,
        index:true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"userDetails"
    }
}, { timestamps: true });


module.exports = mongoose.model("families", familySchema);