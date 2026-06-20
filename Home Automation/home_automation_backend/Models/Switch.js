const mongoose = require("mongoose");



const switchSchema = new mongoose.Schema({
    switchId: {
        type: String,
        required: true
    },
    switchName: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ["light", "fan", "dimmer"],
        default: "light"
    },
    fanSpeed: {
        type: Number,
        default: 0
    },
    dimmerValue: {
        type: Number,
        default: 0
    }
}, { _id: false });


const switchesSchema = new mongoose.Schema({
    familyId: {
        type: String,
        required: true,
        index: true
    },
    switches: [switchSchema]
});


module.exports = mongoose.model("switches", switchesSchema);