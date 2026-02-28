import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDarkMode: false,
            theme: 'default',
            fontSize: 'medium',
            isCompactMode: false,
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setTheme: (theme) => set({ theme }),
            setFontSize: (size) => set({ fontSize: size }),
            toggleCompactMode: () => set((state) => ({ isCompactMode: !state.isCompactMode }))
        }),
        {
            name: 'theme-storage'
        }
    )
);
