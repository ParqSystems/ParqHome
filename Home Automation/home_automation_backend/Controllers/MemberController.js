const UserRole = require("./../Models/UserRole.js");
const Request = require("./../Models/Request.js");
const User = require("./../Models/User.js");


const memberPendingRequest = async (req, res) => {
    try {
        const { familyId, memberEmail } = req.body;

        const user = await User.findOne({ email: memberEmail });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        

        let requestsDoc = await Request.findOne({ familyId });
        if (!requestsDoc) {
            return res.status(400).json({ message: "Family doc not found. Please try again!" });
        }

        const existingRole = await UserRole.findOne({ familyId, userId:user._id });
        if (existingRole) {
            return res.status(400).json({ message: "User already belongs to this family" });
        }

        

        let request = requestsDoc.requests.find((r) => r.memberEmail === memberEmail);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "pending") {
            return res.status(400).json({ message: "This is not a pending request" });
        }


        const newRole = await UserRole.create({
            userId:user._id,
            familyId,
            role: "member"
        });

        request.status = "approved-member";
        await requestsDoc.save();

        return res.status(200).json({ message: "User added as a family member successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured. Please try again!" });
    }
}

const guestPendingRequest = async (req, res) => {
    try {
        const { familyId, memberEmail, expiresAt } = req.body;

        if (!expiresAt) {
            return res.status(400).json({ message: "Guest requests must include expiry date and time" });
        }
        
        if (new Date(expiresAt) < new Date()) {
            return res.status(400).json({ message: "Expiry date and time must be beyond current date and time" });
        }

        const user = await User.findOne({ email: memberEmail });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let requestsDoc = await Request.findOne({ familyId });
        if (!requestsDoc) {
            return res.status(400).json({ message: "Family doc not found. Please try again!" });
        }

        const existingRole = await UserRole.findOne({ familyId, userId:user._id });
        if (existingRole) {
            return res.status(400).json({ message: "User already belongs to this family" });
        }

        

        let request = requestsDoc.requests.find((r) => r.memberEmail === memberEmail);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "pending") {
            return res.status(400).json({ message: "This is not a pending request" });
        }


        const newRole = await UserRole.create({
            userId:user._id,
            familyId,
            role: "guest",
            expiresAt
        });

        request.status = "approved-guest";
        await requestsDoc.save();

        return res.status(200).json({ message: "User added as a guest successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured. Please try again!" });
    }
}

const rejectPendingRequest = async (req, res) => {
    try {
        const { familyId, memberEmail } = req.body;
        
        const requestsDoc = await Request.findOne({ familyId });
        if (!requestsDoc) {
            return res.status(400).json({ message: "Family document not found. Please try again!" });
        }

        let request = requestsDoc.requests.find((r) => r.memberEmail === memberEmail);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be rejected" });
        }

        request.status = "rejected";

        await requestsDoc.save();

        return res.status(200).json({ message: "Request rejected successfully" });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An internal server error occurred. Please try again!" });
    }
}


const universalMemberDelete = async (req,res) => {
    try {
        const { userId, familyId } = req.body;

        const foundRequestsDoc = await Request.findOne({ familyId });
        if (!foundRequestsDoc) {
            return res.status(404).json({ message: "Family document not found! Delete failed" });
        }

        const newRequests = foundRequestsDoc.requests.filter((r) => r._id.toString() !== userId);
        foundRequestsDoc.requests = newRequests;
        await foundRequestsDoc.save();

        await UserRole.deleteOne({ familyId, userId });

        return res.status(200).json({ message: "User deleted successfully" });
        

    }
    catch (error) {
        console.log("An error occured during member deletion : ");
        console.log(error);
        return res.status(500).json({ message: "An internal server occured during user deletion" });
    }
}

const restoreToPending = async (req, res) => {
    try {
        const { familyId, userId } = req.body;
        
        const foundRequestsDoc = await Request.findOne({ familyId });
        if (!foundRequestsDoc) {
            return res.status(404).json({ message: "Family document not found! Restoration to pending list failed" });
        }


        const request = foundRequestsDoc.requests.find((r) => r._id.toString() === userId);

        if (!request) {
            return res.status(404).json({ message: "User request not found! Restoration failed" });
        }

        request.status = "pending";
        
        
        await foundRequestsDoc.save();

        return res.status(200).json({ message: "Restoration to pending was successful" });
    }
    catch (error) {
        console.log("An error occured during restoration to pending : ");
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured while restoring to pending list" });
    }
}


const updateGuestExpiry = async (req, res) => {
    try {
        const { familyId, userId, updatedGuestExpiry } = req.body;

        const foundUserRole = await UserRole.findOne({ familyId, userId });

        if (!foundUserRole) {
            return res.status(404).json({ message: "User role not found! Expiry update failed" });
        }

        foundUserRole.expiresAt = updatedGuestExpiry;
        await foundUserRole.save();

        return res.status(200).json({ message: "Guest expiry updated successfully" });
    }
    catch (error) {
        console.log("An error occured while updating guest expiry : ");
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured! Guest expiry update failed" });
    }
}


module.exports = { memberPendingRequest, guestPendingRequest, rejectPendingRequest, universalMemberDelete,  restoreToPending, updateGuestExpiry};