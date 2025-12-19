import { create } from 'zustand';

interface UIState {
    duration: number;
    setDuration: (d: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    duration: 30, // Default 30 min
    setDuration: (duration) => set({ duration }),
}));
