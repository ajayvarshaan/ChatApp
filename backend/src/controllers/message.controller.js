import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        const usersWithUnread = await Promise.all(filteredUsers.map(async (user) => {
            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: loggedInUserId,
                read: false
            });
            return { ...user.toObject(), unreadCount };
        }));

        res.status(200).json(usersWithUnread);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).populate('replyTo');

        await Message.updateMany(
            { senderId: userToChatId, receiverId: myId, read: false },
            { read: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const messageData = {
            senderId,
            receiverId,
            replyTo: replyTo || null
        };

        if (req.file) {
            messageData.fileUrl = `/uploads/messages/${req.file.filename}`;
            messageData.fileName = req.file.originalname;
            messageData.fileType = req.file.mimetype;
        }

        if (text) {
            messageData.text = text;
        }

        const newMessage = new Message(messageData);

        await newMessage.save();
        await newMessage.populate('replyTo');

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this message" });
        }

        await Message.findByIdAndDelete(messageId);

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", messageId);
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to edit this message" });
        }

        message.text = text;
        message.edited = true;
        await message.save();
        await message.populate('replyTo');

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addReaction = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        const existingReaction = message.reactions.find(r => r.userId.toString() === userId.toString());
        if (existingReaction) {
            existingReaction.emoji = emoji;
        } else {
            message.reactions.push({ userId, emoji });
        }

        await message.save();
        await message.populate('replyTo');

        const receiverSocketId = getReceiverSocketId(message.receiverId || message.groupId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageReaction", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in addReaction controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
