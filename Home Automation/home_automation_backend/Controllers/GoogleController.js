const { OAuth2Client } = require("google-auth-library");
const jsonwebtoken = require("jsonwebtoken");

const User = require("./../Models/User.js");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const continueWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "No token found! Try again" });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const { email, name, sub, email_verified } = payload;

        if(!email_verified){
            return res.status(400).json({message:"Email not verified!"});
        }

        const verifiedEmail=email.toLowerCase();

        let user = await User.findOne({ email : verifiedEmail });

        if (!user) {
            user = await User.create({
                email:verifiedEmail,
                name,
                phone: null,
                passwordHash: null,
                googleToken: sub,
                refreshTokens: [],
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
            message: "Google authentication successful",
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
        console.log("An error occured : " + error);
        return res.status(401).json({ message: "Google authentication failed! Try again" });
    }
}


module.exports = { continueWithGoogle };