import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionState {
    isActive: boolean;
    endTime: number | null;
    allowedApps: string[];
    startSession: (duration: number, allowedApps: string[]) => void;
    stopSession: () => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            isActive: false,
            endTime: null,
            allowedApps: [],
            startSession: (duration, allowedApps) => set({
                isActive: true,
                endTime: Date.now() + duration,
                allowedApps
            }),
            stopSession: () => set({ isActive: false, endTime: null, allowedApps: [] }),
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
