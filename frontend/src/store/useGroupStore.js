import { create } from 'zustand';

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],

    getGroups: async () => {
        try {
            const res = await fetch('/api/groups', { credentials: 'include' });
            const data = await res.json();
            set({ groups: data });
        } catch (error) {
            console.log('Error in getGroups:', error);
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await fetch('/api/groups/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData),
                credentials: 'include'
            });
            const data = await res.json();
            set({ groups: [...get().groups, data] });
            return data;
        } catch (error) {
            console.log('Error in createGroup:', error);
            throw error;
        }
    },

    getGroupMessages: async (groupId) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/messages`, { credentials: 'include' });
            const data = await res.json();
            set({ groupMessages: data });
        } catch (error) {
            console.log('Error in getGroupMessages:', error);
        }
    },

    sendGroupMessage: async (groupId, messageData) => {
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

            const res = await fetch(`/api/groups/${groupId}/send`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            set({ groupMessages: [...get().groupMessages, data] });
        } catch (error) {
            console.log('Error in sendGroupMessage:', error);
        }
    },

    setSelectedGroup: (group) => set({ selectedGroup: group, groupMessages: [] })
}));
