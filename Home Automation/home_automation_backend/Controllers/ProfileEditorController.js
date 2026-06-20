const User = require("./../Models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const updateProfile = async (req, res) => {
    try {
        const { email, phone, name } = req.body;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY);

        
        const foundUser = await User.findById(decoded.userId);
        if (!foundUser) {
            return res.status(400).json({ message: "User not found! Please try again." });
        }


        const existingEmail = await User.findOne({
            email,
            _id: { $ne: foundUser._id }
        });
        if (existingEmail) {
            return res.status(400).json({ message: "Email belongs to different user. Please try again." });
        }

        const existingPhone = await User.findOne({
            phone,
            _id: { $ne: foundUser._id }
        });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone belongs to different user. Please try again." });
        }


        foundUser.name = name;
        foundUser.email = email;
        foundUser.phone = phone;

        await foundUser.save();

        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error occured during profile update. Please try again" });
    }
}


const getProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Auth token not found! Please try again." });
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(
            token,
            process.env.SECRET_ACCESS_TOKEN_KEY
        );
        const userId = decode.userId;

        const foundUser = await User.findOne({ _id:userId });

        if (!foundUser) {
            return res.status(400).json({ message: "User not found! Please try again" });
        }

        return res.status(200).json({
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone
        });
    }
    catch (error) {
        return res.status(500).json({ message: "An internal server error while getting user details" });
    }
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Auth token not found. Please try again" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY);

        const userId = decoded.userId;

        const foundUser = await User.findOne({ _id: userId });
        if (!foundUser) {
            return res.status(400).json({ message: "User not found. Please try again" });
        }
        const passwordsMatch = await bcrypt.compare(oldPassword, foundUser.passwordHash);
        if (!passwordsMatch) {
            return res.status(400).json({
                message: "Old password is incorrect",
                oldPasswordIncorrect: true
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        foundUser.passwordHash = newHash;
        await foundUser.save();
        
        return res.status(200).json({ message: "Password changed successfully" });

    }
    catch (error) {
        console.log("An error occured while changing password : ");
        console.log(error);
        return res.status(500).json({ message: "An internal server error occured while updating password. Please try again" });
    }
}

module.exports = { updateProfile, getProfile, changePassword };