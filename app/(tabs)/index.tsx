import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import DurationPicker from '../../components/DurationPicker';
import { colors } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';

export default function HomeScreen() {
    const { duration, setDuration } = useUIStore();
    const { emergencyKeys, lastKeyUsedTimestamp, checkAndRegenerateKey } = useSettingsStore();
    const [keyRegenTime, setKeyRegenTime] = useState('');

    const presets = [15, 30, 60, 120, 180];

    React.useEffect(() => {
        // Check if key can be regenerated
        checkAndRegenerateKey();

        // Update regeneration timer
        const interval = setInterval(() => {
            checkAndRegenerateKey();

            if (emergencyKeys === 0 && lastKeyUsedTimestamp) {
                const twentyFourHours = 24 * 60 * 60 * 1000;
                const timeUntilRegen = twentyFourHours - (Date.now() - lastKeyUsedTimestamp);

                if (timeUntilRegen > 0) {
                    const hoursLeft = Math.floor(timeUntilRegen / (1000 * 60 * 60));
                    const minsLeft = Math.floor((timeUntilRegen % (1000 * 60 * 60)) / (1000 * 60));
                    setKeyRegenTime(`${hoursLeft}h ${minsLeft}m`);
                } else {
                    setKeyRegenTime('');
                }
            } else {
                setKeyRegenTime('');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [emergencyKeys, lastKeyUsedTimestamp]);

    const formatDuration = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return { h, m };
    };

    const { h, m } = formatDuration(duration);

    return (
        <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.content}>
                {/* Key Status Badge */}
                <View style={styles.keyStatusContainer}>
                    <View style={[styles.keyBadge, emergencyKeys === 0 && styles.keyBadgeEmpty]}>
                        <Text style={styles.keyIcon}>🔑</Text>
                        <View>
                            <Text style={styles.keyText}>
                                {emergencyKeys} {emergencyKeys === 1 ? 'Key' : 'Keys'}
                            </Text>
                            {emergencyKeys === 0 && keyRegenTime && (
                                <Text style={styles.keyRegenText}>Next: {keyRegenTime}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Top Section: Duration Display */}
                <View style={styles.displayContainer}>
                    <View style={styles.timeStack}>
                        <Text style={styles.timeDigit}>{h.toString().padStart(2, '0')}</Text>
                        <Text style={styles.timeDigit}>{m.toString().padStart(2, '0')}</Text>
                    </View>

                    <View style={styles.modeTag}>
                        <Text style={styles.modeText}>Focus Mode</Text>
                        {/* Bars mimicking the intensity or battery? */}
                        <View style={styles.bars}>
                            <View style={[styles.bar, { opacity: 0.4 }]} />
                            <View style={[styles.bar, { opacity: 0.6 }]} />
                            <View style={[styles.bar, { opacity: 1.0 }]} />
                        </View>
                    </View>
                </View>

                {/* Middle Section */}
                <View style={styles.controlsContainer}>
                    {/* Presets Grid */}
                    <View style={styles.presetsGrid}>
                        {presets.map((min, index) => {
                            // Custom layout logic for the grid to look nice
                            // Just a wrapped flex box
                            const isActive = duration === min;
                            return (
                                <Pressable
                                    key={min}
                                    style={[styles.presetBtn, isActive && styles.presetBtnActive]}
                                    onPress={() => setDuration(min)}
                                >
                                    <Text style={[styles.presetVal, isActive && styles.presetValActive]}>
                                        {min >= 60 ? min / 60 : min}
                                    </Text>
                                    <Text style={[styles.presetUnit, isActive && styles.presetUnitActive]}>
                                        {min >= 60 ? (min / 60 === 1 ? 'Hour' : 'Hours') : 'Minutes'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Slider Section with Arrows on Left */}
                    <View style={styles.sliderSection}>
                        {/* Arrow Controls on Left */}
                        <View style={styles.arrowsContainer}>
                            <Pressable
                                onPress={() => {
                                    const next = Math.min(1440, duration + 1);
                                    setDuration(next);
                                    import('expo-haptics').then(h => h.selectionAsync());
                                }}
                                style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowPressed]}
                            >
                                <Text style={styles.arrowIcon}>▲</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    const next = Math.max(1, duration - 1);
                                    setDuration(next);
                                    import('expo-haptics').then(h => h.selectionAsync());
                                }}
                                style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowPressed]}
                            >
                                <Text style={styles.arrowIcon}>▼</Text>
                            </Pressable>
                        </View>

                        {/* Vertical Slider on Right */}
                        <DurationPicker
                            duration={duration}
                            onDurationChange={setDuration}
                            height={340}
                        />
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    keyStatusContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    keyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,107,107,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FF6B6B',
        gap: 8,
    },
    keyBadgeEmpty: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    keyIcon: {
        fontSize: 20,
    },
    keyText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    keyRegenText: {
        color: '#FF6B6B',
        fontSize: 11,
        fontWeight: '600',
    },
    displayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    timeStack: {
        flexDirection: 'column',
    },
    timeDigit: {
        fontSize: 90,
        fontWeight: 'bold',
        color: '#E6E1DC', // Warm off-white
        lineHeight: 85,
        letterSpacing: -4,
    },
    modeTag: {
        backgroundColor: '#5C4A42', // Brownish
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        marginTop: 20,
        alignItems: 'center',
        flexDirection: 'row', // or col
        gap: 8,
    },
    modeText: {
        color: '#E6E1DC',
        fontWeight: '600',
        fontSize: 14,
    },
    bars: {
        flexDirection: 'column',
        gap: 4,
    },
    bar: {
        width: 20,
        height: 3,
        backgroundColor: '#E6E1DC',
        borderRadius: 2,
    },
    controlsContainer: {
        flexDirection: 'row',
        height: 350,
        gap: 20,
    },
    presetsGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignContent: 'flex-start',
    },
    presetBtn: {
        width: '46%',
        aspectRatio: 1,
        backgroundColor: 'rgba(230, 225, 220, 0.1)', // Light tint
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    presetBtnActive: {
        backgroundColor: '#4A4A4A', // Dark active
    },
    presetVal: {
        fontSize: 36,
        fontWeight: '500',
        color: '#888',
    },
    presetValActive: {
        color: '#FFF',
    },
    presetUnit: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    presetUnitActive: {
        color: '#CCC',
    },
    sliderSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    arrowsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    arrowButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowPressed: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    arrowIcon: {
        fontSize: 20,
        color: colors.white,
        fontWeight: 'bold',
    }
});
