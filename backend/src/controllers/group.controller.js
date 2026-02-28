import Group from '../models/group.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const adminId = req.user._id;

        const group = new Group({
            name,
            description,
            admin: adminId,
            members: [adminId, ...members]
        });

        await group.save();
        await group.populate('members admin', '-password');

        res.status(201).json(group);
    } catch (error) {
        console.log("Error in createGroup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate('members admin', '-password');
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const messages = await Message.find({ groupId }).populate('senderId replyTo', '-password');
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, replyTo } = req.body;
        const { id: groupId } = req.params;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group.members.includes(senderId)) {
            return res.status(403).json({ error: "Not a member of this group" });
        }

        const messageData = {
            senderId,
            groupId,
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
        await newMessage.populate('senderId replyTo', '-password');

        group.members.forEach(memberId => {
            if (memberId.toString() !== senderId.toString()) {
                const socketId = getReceiverSocketId(memberId);
                if (socketId) {
                    io.to(socketId).emit("newGroupMessage", newMessage);
                }
            }
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addGroupMember = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId } = req.body;
        const adminId = req.user._id;

        const group = await Group.findById(groupId);
        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ error: "Only admin can add members" });
        }

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }

        await group.populate('members admin', '-password');
        res.status(200).json(group);
    } catch (error) {
        console.log("Error in addGroupMember controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
