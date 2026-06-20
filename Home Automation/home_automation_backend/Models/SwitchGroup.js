const mongoose = require("mongoose");


const switchGroupSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    switches: [
        {
            type: String
        }
    ]
}, { _id: false });

const switchGroupsSchema = new mongoose.Schema({
    familyId: {
        type: String,
        required: true,
        index: true
    },
    switchGroups: [switchGroupSchema]
});


module.exports = mongoose.model("switchGroupsSchema", switchGroupsSchema);