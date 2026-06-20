const UserRole = require("./../Models/UserRole.js");
const User = require("./../Models/User.js");
const Switch = require("./../Models/Switch.js");
const SwitchGroup = require("./../Models/SwitchGroup.js");
const Request = require("./../Models/Request.js");


const mqttClient = require("./../mqttClient.js");

const jwt = require("jsonwebtoken");




const getUserDetails = async (req, res) => {
    try {

        // console.log("Inside getUserDetails....");
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY);
        const userId = decoded.userId;


        const { email } = req.body;

        // console.log("Running getUserDetails....");

        console.log("User ID : ");
        console.log(userId);
        
        // const foundRole = await UserRole.findOne({ userId });

        const foundRole = await UserRole.findOne({ email });

        console.log(email);


        console.log(foundRole);
        if (!foundRole) {
            return res.status(400).json({ message: "User not found! Please try again." });
        }
        const familyId = foundRole.familyId;

        const foundUser = await User.findById(userId);
        if (!foundUser) {
            return res.status(400).json({ message: "User details not found! Please try again." });
        }
        const name = foundUser.name;
        
        return res.status(200).json({
            message: "User located in system",
            familyId,
            name
        });
    }

    catch (error) {
        return res.status(500).json({ message: "An internal server error occured! Please try again." });
    }
}


const getSwitchesAndGroups = async (req, res) => {
    try {
        const { familyId } = req.body;
        const foundSwitches = await Switch.findOne({ familyId });
        const foundSwitchGroups = await SwitchGroup.findOne({ familyId });
        if (!foundSwitches || !foundSwitchGroups) {
            return res.status(404).json({ message: "Switches or Switch Groups not found! Please try again." });
        }
        return res.status(200).json({
            switchesDoc: foundSwitches,
            switchGroupsDoc: foundSwitchGroups,
            message: "Switches and Switch groups found"
        });
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occured! Please try again" });
    }
}


const updateSwitches = async (req, res) => {
    try {
        const { familyId, switchUpdates } = req.body;

        if (!familyId || !Array.isArray(switchUpdates)) {
            return res.status(400).json({ message: "Data format violated. Send updates again!" });
        }

        const foundSwitches = await Switch.findOne({ familyId });
        if (!foundSwitches) {
            return res.status(404).json({ message: "Switches not found! Please try again." });
        }

        for (let i = 0; i < switchUpdates.length; i++){
            const tempSwitch = foundSwitches.switches.find(sw => sw.switchId === switchUpdates[i].switchId);
            const { switchId, ...fieldsToUpdate } = switchUpdates[i];
            if (tempSwitch) {
                Object.assign(tempSwitch, fieldsToUpdate);
            }

            mqttClient.publish("home/ui/control", JSON.stringify({ source:"app", familyId, switchId, ...fieldsToUpdate }));
        }

        await foundSwitches.save();


        return res.status(200).json({ message: "Switch(es) updated successfully" });
    }
    catch (error) {
        console.log("An error occured while updating switches : ");
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured! Please try again." });
    }
}


const addOrUpdateSwitchGroup = async (req, res) => {
    try {
        const { familyId, switchGroup } = req.body;
        
        const foundSwitchGroupsDoc = await SwitchGroup.findOne({ familyId });
        if (!foundSwitchGroupsDoc) {
            return res.status(400).json({ message: "Family not found!" });
        }

        let foundGroups = [...foundSwitchGroupsDoc.switchGroups];
        let updatedGroup = false;
        for (let i = 0; i < foundGroups.length; i++){
            if (switchGroup.groupId === foundGroups[i].groupId) {
                foundGroups[i].groupName = switchGroup.groupName;
                foundGroups[i].switches = [...switchGroup.switches];
                updatedGroup = true;
            }
        }

        if (!updatedGroup) {
            foundGroups.push(switchGroup);
        }

        foundSwitchGroupsDoc.switchGroups = [...foundGroups];
        await foundSwitchGroupsDoc.save();

        return res.status(200).json({ message: updatedGroup ? "Switch group updated successfully" : "Switch group added successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An internal error occured while adding/updating switch group. Please try again!" });
    }
}



const deleteSwitchGroup = async (req, res) => {
    try {
        const { familyId, groupId } = req.body;

        const foundFamilyDoc = await SwitchGroup.findOne({ familyId });
        if (!foundFamilyDoc) {
            return res.status(400).json({ message: "Family document not found! Please try again" });
        }

        const foundSwitchGroup = foundFamilyDoc.switchGroups.find((group) => group.groupId === groupId);

        if (!foundSwitchGroup) {
            return res.status(400).json({ message: "Switch group not found. Please try again!" });
        }

        const switchGroups = foundFamilyDoc.switchGroups?.filter((group) => group.groupId !== groupId);
        foundFamilyDoc.switchGroups = switchGroups;
        await foundFamilyDoc.save();
        
        return res.status(200).json({ message: "Switch group deleted successfully" });
        
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while deleting the switch group. Please try again" });
    }
}


const getMembersAndRequests = async (req, res) => {
    try {
        const familyId = req.params.familyId;


        const joinRequests = await Request.findOne({ familyId });
        if (!joinRequests) {
            return res.status(400).json({ message: "Requests document not found! Please try again" });
        }
        let pendingRequests = [];
        let rejectedRequests = [];
        for (let i = 0; i < joinRequests.requests.length; i++){
            let r = joinRequests.requests[i];
            if (r.status === "pending") {
                pendingRequests.push(r);
            }
            if (r.status === "rejected") {
                rejectedRequests.push(r);
            }
        }

        const familyMembers = await UserRole.find({ familyId, role: "member" }).populate("userId", "name email phone");
        

        const guests = await UserRole.find({ familyId, role: "guest" }).populate("userId", "name email phone");

        // console.log(familyMembers);
        // console.log(guests);

        let currentGuests = [];
        let pastGuests = [];

        for (let i = 0; i < guests.length; i++){
            let guest = guests[i];

            if (new Date(guest.expiresAt) > new Date()) {
                currentGuests.push(guest);
            }
            else {
                pastGuests.push(guest);
            }
        }


        console.log("Past guests  : " + pastGuests);
        console.log("Current guests : "+currentGuests);
        console.log("Family members : " + familyMembers);
        console.log("Pending requests : " + pendingRequests);
        console.log("Rejected requests : " + rejectedRequests);
        


        return res.status(200).json({
            pendingRequests,
            rejectedRequests,
            familyMembers,
            currentGuests,
            pastGuests
        });
    }
    catch (error) {
        console.log("An error occured : " + error);
        console.log(error);
        return res.status(500).json({ message: "An internal server occurred. Please try again!" });
    }
}


module.exports = { getUserDetails, getSwitchesAndGroups, updateSwitches, addOrUpdateSwitchGroup, deleteSwitchGroup, getMembersAndRequests };