import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    text: { type: String },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    read: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    fileUrl: { type: String },
    fileType: { type: String },
    fileName: { type: String },
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
