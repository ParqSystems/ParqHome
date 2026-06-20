const express = require("express");
const router = express.Router();

const { addNewUser, generateMemberRequest, checkEmail, checkFamily, login } = require("./../Controllers/AuthController.js");

const { continueWithGoogle } = require("./../Controllers/GoogleController.js");

router.post("/addNewUser", addNewUser);
router.post("/generateMemberRequest", generateMemberRequest);
router.post("/google", continueWithGoogle);
router.post("/login", login);


router.get("/checkEmail/:email", checkEmail);
router.get("/checkFamily/:familyId", checkFamily);

module.exports = router;