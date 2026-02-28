import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { io } from 'socket.io-client';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    socket: null,

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
            set({ messages: [...get().messages, newMessage] });
        });

        socket.on('messageDeleted', (messageId) => {
            set({ messages: get().messages.filter(msg => msg._id !== messageId) });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
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
        } catch (error) {
            console.log('Error in getMessages:', error);
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
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

    setSelectedUser: (user) => set({ selectedUser: user })
}));
