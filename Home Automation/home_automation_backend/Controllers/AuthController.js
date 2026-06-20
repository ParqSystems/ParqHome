const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const User = require("../Models/User.js");
const Family = require("../Models/Family.js");
const UserRole = require("../Models/UserRole.js");
const Request = require("./../Models/Request.js");
const Switch = require("./../Models/Switch.js");
const SwitchGroup = require("./../Models/SwitchGroup.js");



const generateFamilyId = async () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let familyId;
    let exists = true;

    while (exists) {
        const prefix = Array.from({ length: 3 }, () =>
            letters[Math.floor(Math.random() * letters.length)]
        ).join("");


        const number = Math.floor(100000 + Math.random() * 900000);

        familyId = `${prefix}-${number}`;

        exists = await Family.exists({ familyId });
    }

    return familyId;
};

const addNewUser = async (req, res) => {
    let session;
    try {
        const { email, phone, name, password, familyName } = req.body;
        if (!email || !phone || !name || !password) {
            return res.status(400).json({ message: "Please enter all fields!" });
        }

        const isAdmin = familyName && familyName.trim().length > 0;
        const existingUser = await User.exists({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists! Try a different email" });
        }

        session = await mongoose.startSession();
        session.startTransaction();
        

        const passwordHash = await bcryptjs.hash(password, 10);
        
        
        const newUser = await User.create([{
            email,
            phone,
            name,
            passwordHash,
            refreshTokens: []
        }], { session });
        
        const user = newUser[0];

        let family = null;
        
        if (isAdmin) {
            const familyId = await generateFamilyId();
            const newFamily = await Family.create([{
                familyName,
                familyId,
                createdBy: user._id
            }], { session });
        
            family = newFamily[0];

            await UserRole.create([{
                userId: user._id,
                familyId,
                role: "admin"
            }], { session });


            await Request.create([{
                familyId,
                requests: []
            }], { session });

            await Switch.create([{
                familyId,
                switches: []
            }], { session });

            await SwitchGroup.create([{
                familyId,
                switchGroups: []
            }], { session });
        }

        const accessToken = jsonwebtoken.sign(
            { userId: user._id },
            process.env.SECRET_ACCESS_TOKEN_KEY,
            { expiresIn: "15m" }
        );

        const refreshToken = jsonwebtoken.sign(
            { userId: user._id },
            process.env.SECRET_REFRESH_TOKEN_KEY,
            { expiresIn: "7d" }
        );

        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await user.save({ session });
        await session.commitTransaction();
        // session.endSession();

        return res.status(201).json({
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                userId: user._id,
                email: user.email,
                name: user.name
            },
            family: isAdmin ? {
                familyId: family.familyId,
                name: family.familyName
            } : null
        });
    }
    catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error(error);
        return res.status(500).json({ message: "An internal server occurred. Try again" });
    }
    finally {
        if (session) {
            session.endSession();
        }
    }
}


const generateMemberRequest = async (req, res) => {
    try {
        const { email, phone, name, password, familyId } = req.body;

        if (!email || !name || !phone || !familyId) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }

        const family = await Family.findOne({ familyId });
        if (!family) {
            return res.status(404).json({ message: "Family not found!" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            if (!password) {
                return res.status(400).json({ message: "Password is mandatory for new user" });
            }

            const passwordHash = await bcryptjs.hash(password, 10);

            user = await User.create({
                email,
                phone,
                name,
                passwordHash,
                refreshTokens: []
            }); 
        }


        const existingRole = await UserRole.findOne({ userId: user._id, familyId });
        if (existingRole) {
            return res.status(400).json({ message: "Requesting member already exists in this family" });
        }

        let requestDoc = await Request.findOne({ familyId });
        if (!requestDoc) {
            requestDoc = await Request.create({ familyId, requests: [] });
        }

        if (requestDoc.requests.find(r => r.memberEmail === email && r.status === "pending")) {
            return res.status(409).json({ message: "Cannot request same family twice" });
        }

        requestDoc.requests.push({
            memberEmail: email,
            memberPhone: phone,
            memberName: name,
            status: "pending"
        });


        await requestDoc.save();


        return res.status(200).json({ message: "Request sent successfully" });


    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An internal server error occurred. Try again" });
    }
}



const checkEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email }).select("name phone");
        if (!user) {
            return res.status(200).json({ exists: false });
        }
        return res.status(200).json({ exists: true, name: user.name, phone: user.phone });
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occured" });
    }
}


const checkFamily = async (req, res) => {
    try {
        const { familyId } = req.params;
        const family = await Family.findOne({ familyId }).select("familyName");
        
        if (!family) {
            return res.status(404).json({
                exists: false
            });
        }

        return res.status(200).json({
            exists: true,
            familyName: family.familyName
        });
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occured" });
    }
}


const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        let user;
        if (/^[0-9]+$/.test(username)) {
            user = await User.findOne({ phone: username });
        }
        else {
            user = await User.findOne({ email: username });
        }


        if (!user) {
            return res.status(400).json({ message: "Email/Phone not found in system. Signup first!" });
        }

        if (!user.passwordHash) {
            return res.status(400).json({
                message: "No password found. Login using Google",
                usedGoogleSignup: true
            });
        }

        const isMatch = await bcryptjs.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password. Please try again!",
                usedGoogleSignup:false
            });           
        }

        const accessToken = jsonwebtoken.sign(
            { userId: user._id },
            process.env.SECRET_ACCESS_TOKEN_KEY,
            { expiresIn: "1h" }
        );


        const refreshToken = jsonwebtoken.sign(
            { userId: user._id },
            process.env.SECRET_REFRESH_TOKEN_KEY,
            { expiresIn: "7d" }
        );
        
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await user.save();


        return res.status(200).json({
            message: "Logged in successfully",
            accessToken,
            refreshToken,
            user: {
                userId: user._id,
                email: user.email,
                name: user.name
            }
        });


    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occured. Try again!" });
    }
}


module.exports = {addNewUser, generateMemberRequest, checkEmail, checkFamily, login};