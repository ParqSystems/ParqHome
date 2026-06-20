const express = require("express");
const router = express.Router();

const {
    getUserDetails,
    getSwitchesAndGroups,
    updateSwitches,
    addOrUpdateSwitchGroup,
    deleteSwitchGroup,
    getMembersAndRequests
} = require("./../Controllers/DashboardController.js");

const {
    memberPendingRequest,
    guestPendingRequest,
    rejectPendingRequest,
    universalMemberDelete,
    restoreToPending,
    updateGuestExpiry
} = require("./../Controllers/MemberController.js");


const { updateProfile, getProfile, changePassword } = require("./../Controllers/ProfileEditorController.js");


router.get("/getMembersAndRequests/:familyId", getMembersAndRequests);


router.post("/getUserDetails", getUserDetails);
router.post("/getSwitchesAndGroups", getSwitchesAndGroups);

router.post("/updateSwitches", updateSwitches);

router.post("/addOrUpdateSwitchGroup", addOrUpdateSwitchGroup);
router.post("/deleteSwitchGroup", deleteSwitchGroup);


router.post("/memberPendingRequest", memberPendingRequest);
router.post("/guestPendingRequest", guestPendingRequest);
router.post("/rejectPendingRequest", rejectPendingRequest);

router.post("/universalMemberDelete", universalMemberDelete);
router.post("/restoreToPending", restoreToPending);
router.post("/updateGuestExpiry", updateGuestExpiry);


router.post("/updateProfile", updateProfile);
router.get("/getProfile", getProfile);
router.post("/changePassword", changePassword);


module.exports = router;