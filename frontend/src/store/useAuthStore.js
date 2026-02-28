import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'include' });
            if (!res.ok) {
                set({ authUser: null, isCheckingAuth: false });
                return;
            }
            const data = await res.json();
            set({ authUser: data, isCheckingAuth: false });
        } catch (error) {
            set({ authUser: null, isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            set({ authUser: json });
        } catch (error) {
            throw error;
        }
    },

    login: async (data) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            set({ authUser: json });
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            set({ authUser: null });
        } catch (error) {
            console.log('Error in logout:', error);
        }
    },

    setOnlineUsers: (users) => set({ onlineUsers: users })
}));
