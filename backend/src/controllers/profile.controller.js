import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
    try {
        const { fullName, email, currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: "Email already in use" });
            user.email = email;
        }

        if (fullName) user.fullName = fullName;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ message: "Current password required" });
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
            if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.status(200).json({ _id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic });
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const userId = req.user._id;
        const profilePic = `/uploads/profiles/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(userId, { profilePic }, { new: true });
        res.status(200).json({ _id: user._id, fullName: user.fullName, email: user.email, profilePic: user.profilePic });
    } catch (error) {
        console.log("Error in uploadProfilePic controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
