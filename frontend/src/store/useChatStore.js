import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { io } from 'socket.io-client';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    socket: null,
    typingUsers: {},

    connectSocket: () => {
        const { authUser } = useAuthStore.getState();
        if (!authUser?._id || get().socket?.connected) return;

        const socket = io('http://localhost:3000', {
            query: { userId: authUser._id }
        });

        socket.on('getOnlineUsers', (userIds) => {
            useAuthStore.getState().setOnlineUsers(userIds);
        });

        socket.on('newMessage', (newMessage) => {
            const { selectedUser } = get();
            set({ messages: [...get().messages, newMessage] });
            
            if (selectedUser?._id === newMessage.senderId) {
                get().markMessagesAsRead([newMessage._id], newMessage.senderId);
            } else {
                get().getUsers();
            }
        });

        socket.on('messageDeleted', (messageId) => {
            set({ messages: get().messages.filter(msg => msg._id !== messageId) });
        });

        socket.on('userTyping', ({ userId }) => {
            set({ typingUsers: { ...get().typingUsers, [userId]: true } });
        });

        socket.on('userStoppedTyping', ({ userId }) => {
            const typingUsers = { ...get().typingUsers };
            delete typingUsers[userId];
            set({ typingUsers });
        });

        socket.on('messagesRead', ({ messageIds }) => {
            set({
                messages: get().messages.map(msg =>
                    messageIds.includes(msg._id) ? { ...msg, read: true } : msg
                )
            });
        });

        socket.on('messageEdited', (editedMessage) => {
            set({
                messages: get().messages.map(msg =>
                    msg._id === editedMessage._id ? editedMessage : msg
                )
            });
        });

        socket.on('messageReaction', (updatedMessage) => {
            set({
                messages: get().messages.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            });
        });

        socket.on('newGroupMessage', (newMessage) => {
            const { useGroupStore } = require('./useGroupStore');
            const { selectedGroup, groupMessages } = useGroupStore.getState();
            if (selectedGroup?._id === newMessage.groupId) {
                useGroupStore.setState({ groupMessages: [...groupMessages, newMessage] });
            }
        });

        set({ socket });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

    emitTyping: (receiverId) => {
        get().socket?.emit('typing', { receiverId });
    },

    emitStopTyping: (receiverId) => {
        get().socket?.emit('stopTyping', { receiverId });
    },

    markMessagesAsRead: (messageIds, senderId) => {
        get().socket?.emit('markAsRead', { messageIds, senderId });
    },

    getUsers: async () => {
        try {
            const res = await fetch('/api/messages/users', { credentials: 'include' });
            const data = await res.json();
            set({ users: data });
        } catch (error) {
            console.log('Error in getUsers:', error);
        }
    },

    getMessages: async (userId) => {
        try {
            const res = await fetch(`/api/messages/${userId}`, { credentials: 'include' });
            const data = await res.json();
            set({ messages: data });
            
            const unreadMessages = data.filter(msg => !msg.read && msg.receiverId === useAuthStore.getState().authUser._id);
            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map(msg => msg._id);
                get().markMessagesAsRead(messageIds, userId);
            }
            
            get().getUsers();
        } catch (error) {
            console.log('Error in getMessages:', error);
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const formData = new FormData();
            
            if (messageData.text) {
                formData.append('text', messageData.text);
            }
            if (messageData.replyTo) {
                formData.append('replyTo', messageData.replyTo);
            }
            if (messageData.file) {
                formData.append('file', messageData.file);
            }

            const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            set({ messages: [...messages, data] });
        } catch (error) {
            console.log('Error in sendMessage:', error);
        }
    },

    deleteMessage: async (messageId) => {
        try {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                set({ messages: get().messages.filter(msg => msg._id !== messageId) });
            }
        } catch (error) {
            console.log('Error in deleteMessage:', error);
        }
    },

    editMessage: async (messageId, text) => {
        try {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                set({ messages: get().messages.map(msg => msg._id === messageId ? data : msg) });
            }
        } catch (error) {
            console.log('Error in editMessage:', error);
        }
    },

    addReaction: async (messageId, emoji) => {
        try {
            const res = await fetch(`/api/messages/${messageId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                set({ messages: get().messages.map(msg => msg._id === messageId ? data : msg) });
            }
        } catch (error) {
            console.log('Error in addReaction:', error);
        }
    },

    setSelectedUser: (user) => set({ selectedUser: user })
}));
