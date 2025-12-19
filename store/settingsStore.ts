import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    isDarkTheme: boolean;
    isHapticEnabled: boolean;
    isAnalogClock: boolean; // true = analog, false = digital
    defaultAllowedApps: string[]; // Package names
    emergencyKeys: number; // Number of keys available
    lastKeyUsedTimestamp: number | null; // When the last key was used
    toggleDarkTheme: () => void;
    toggleHaptic: () => void;
    toggleClockType: () => void;
    setDefaultAllowedApps: (apps: string[]) => void;
    addDefaultAllowedApp: (packageName: string) => void;
    removeDefaultAllowedApp: (packageName: string) => void;
    useEmergencyKey: () => boolean; // Returns true if key was used successfully
    checkAndRegenerateKey: () => void; // Check if 24h passed and regenerate
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            isDarkTheme: true,
            isHapticEnabled: true,
            isAnalogClock: false, // Default to digital clock
            defaultAllowedApps: [],
            emergencyKeys: 1, // Start with 1 key
            lastKeyUsedTimestamp: null,

            toggleDarkTheme: () => set((state) => ({ isDarkTheme: !state.isDarkTheme })),
            toggleHaptic: () => set((state) => ({ isHapticEnabled: !state.isHapticEnabled })),
            toggleClockType: () => set((state) => ({ isAnalogClock: !state.isAnalogClock })),

            setDefaultAllowedApps: (apps) => set({ defaultAllowedApps: apps }),

            addDefaultAllowedApp: (pkg) => set((state) => ({
                defaultAllowedApps: state.defaultAllowedApps.includes(pkg)
                    ? state.defaultAllowedApps
                    : [...state.defaultAllowedApps, pkg]
            })),

            removeDefaultAllowedApp: (pkg) => set((state) => ({
                defaultAllowedApps: state.defaultAllowedApps.filter(p => p !== pkg)
            })),

            useEmergencyKey: () => {
                const state = get();
                if (state.emergencyKeys > 0) {
                    set({
                        emergencyKeys: state.emergencyKeys - 1,
                        lastKeyUsedTimestamp: Date.now()
                    });
                    return true;
                }
                return false;
            },

            checkAndRegenerateKey: () => {
                const state = get();
                const now = Date.now();
                const twentyFourHours = 24 * 60 * 60 * 1000;

                // If no key and last used timestamp exists
                if (state.emergencyKeys === 0 && state.lastKeyUsedTimestamp) {
                    const timeSinceLastUse = now - state.lastKeyUsedTimestamp;

                    // If 24 hours have passed, regenerate key
                    if (timeSinceLastUse >= twentyFourHours) {
                        set({
                            emergencyKeys: 1,
                            lastKeyUsedTimestamp: null
                        });
                    }
                }
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
