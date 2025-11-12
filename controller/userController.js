const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const jwt = require("jsonwebtoken");

// Register logic
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, isAdmin } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            verificationCode: code,
            codeExpiresIn: expiresIn,
            isAdmin: isAdmin || false,
        });
        await newUser.save();
        
        // Send verification code
        await sendVerificationEmail(newUser.email, code);

        // Generate jwt
        const token = generateToken(newUser._id); // Changed from newUser to newUser._id
        
        res.status(201).json({ 
            message: "Registration successful. Please check your email to verify your account", 
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal server error" }); // Fixed: return object, not string
    }
};

// Email verification
exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Already verified" });
        
        if (user.verificationCode !== code || user.codeExpiresIn < new Date()) {
            return res.status(400).json({ message: "Invalid or expired code" });
        }
        
        user.isVerified = true;
        user.verificationCode = null;
        user.codeExpiresIn = null;
        await user.save();
        
        res.json({ message: "Email verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message }); // Changed 'error' to 'message'
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found" }); // Fixed: return object
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" }); // Fixed: return object
        }
        
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email" }); // Fixed: return object
        }
        
        const token = generateToken(user._id);
        
        res.status(200).json({ 
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
