import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, BackHandler, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import * as AppBlocker from '../modules/app-blocker';
import { AppInfo } from '../modules/app-blocker';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';


function AnalogClock({ timeLeft }: { timeLeft: string }) {
    const [hours, minutes, seconds] = timeLeft.split(':').map(Number);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const secondAngle = (seconds / 60) * 360;
    const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
    const hourAngle = ((hours % 12 + minutes / 60) / 12) * 360;

    return (
        <View style={clockStyles.container}>

            <View style={clockStyles.face}>

                {[...Array(12)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            clockStyles.marker,
                            {
                                transform: [
                                    { rotate: `${i * 30}deg` },
                                    { translateY: -90 },
                                ],
                            },
                        ]}
                    />
                ))}


                <View
                    style={[
                        clockStyles.hand,
                        clockStyles.hourHand,
                        { transform: [{ rotate: `${hourAngle}deg` }] },
                    ]}
                />
                <View
                    style={[
                        clockStyles.hand,
                        clockStyles.minuteHand,
                        { transform: [{ rotate: `${minuteAngle}deg` }] },
                    ]}
                />

                {/* Second hand */}
                <View
                    style={[
                        clockStyles.hand,
                        clockStyles.secondHand,
                        { transform: [{ rotate: `${secondAngle}deg` }] },
                    ]}
                />

                {/* Center dot */}
                <View style={clockStyles.centerDot} />
            </View>

            <Text style={clockStyles.digitalTime}>{timeLeft}</Text>
        </View>
    );
}

const clockStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    face: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 4,
        borderColor: '#FF6B6B',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    marker: {
        position: 'absolute',
        width: 2,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 1,
    },
    hand: {
        position: 'absolute',
        backgroundColor: '#FFF',
        borderRadius: 10,
        transformOrigin: 'bottom',
    },
    hourHand: {
        width: 6,
        height: 50,
        bottom: 110,
    },
    minuteHand: {
        width: 4,
        height: 70,
        bottom: 110,
        backgroundColor: '#FFD93D',
    },
    secondHand: {
        width: 2,
        height: 85,
        bottom: 110,
        backgroundColor: '#FF6B6B',
    },
    centerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF6B6B',
        position: 'absolute',
    },
    digitalTime: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 12,
        fontWeight: '600',
    },
});

export default function SessionScreen() {
    const { isActive, endTime, allowedApps, stopSession } = useSessionStore();
    const { isAnalogClock, emergencyKeys, lastKeyUsedTimestamp, useEmergencyKey, checkAndRegenerateKey } = useSettingsStore();
    const [timeLeft, setTimeLeft] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [progress, setProgress] = useState(100); // Progress percentage
    const [keyRegenTime, setKeyRegenTime] = useState(''); // Time until next key
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [showNoKeyModal, setShowNoKeyModal] = useState(false);
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        // Check if key can be regenerated on mount
        checkAndRegenerateKey();
    }, []);

    useEffect(() => {
        if (!isActive || !endTime) {
            router.replace('/');
            return;
        }

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        const sessionDuration = endTime - (Date.now() - (endTime - Date.now())); // Total session duration

        const interval = setInterval(() => {
            // Check for key regeneration
            checkAndRegenerateKey();

            // Update current time
            const now = new Date();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMins = now.getMinutes().toString().padStart(2, '0');
            setCurrentTime(`${currentHours}:${currentMins}`);

            // Calculate time until next key
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

            // Update time remaining
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                handleEndSession();
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

                // Update progress (remaining / total * 100)
                const progressPercent = Math.max(5, Math.min(100, (remaining / sessionDuration) * 100));
                setProgress(progressPercent);
            }
        }, 1000);

        loadAllowedApps();

        return () => clearInterval(interval);
    }, [isActive, endTime]);

    useEffect(() => {
        const backAction = () => {
            return true; // Prevent going back
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const loadAllowedApps = async () => {
        const allApps = await AppBlocker.getApps();
        const allowed = allApps.filter(app => allowedApps.includes(app.packageName));
        setApps(allowed);
    };

    const handleEndSession = () => {
        AppBlocker.stopBlocking();
        stopSession();
        router.replace('/');
    };

    const handleEmergencyExit = () => {
        if (emergencyKeys === 0) {
            setShowNoKeyModal(true);
            return;
        }

        const keyUsed = useEmergencyKey();
        if (keyUsed) {
            handleEndSession();
        }
    };

    const launchApp = (packageName: string) => {
        try {
            const success = AppBlocker.launchApp(packageName);
            if (!success) {
                console.warn(`Could not launch app: ${packageName}`);
            }
        } catch (e) {
            console.error('Failed to launch app', e);
        }
    };

    return (
        <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.statusBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE SESSION</Text>
                    </View>

                    <View style={styles.currentTimeContainer}>
                        <Text style={styles.currentTimeLabel}>Current Time</Text>
                        <Text style={styles.currentTime}>{currentTime}</Text>
                    </View>
                </View>

                {/* Timer Display */}
                <View style={styles.timerSection}>
                    <Text style={styles.timerLabel}>Time Remaining ⏳</Text>

                    {isAnalogClock ? (
                        <AnalogClock timeLeft={timeLeft} />
                    ) : (
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Text style={styles.digitalTimer}>{timeLeft}</Text>
                        </Animated.View>
                    )}

                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${progress}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Allowed Apps Section */}
                <View style={styles.appsSection}>
                    <Text style={styles.appsSectionTitle}>
                        Allowed Apps ({apps.length})
                    </Text>

                    <FlatList
                        data={apps}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.appsList}
                        keyExtractor={(item) => item.packageName}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => launchApp(item.packageName)}
                                style={styles.appItem}
                            >
                                {item.icon ? (
                                    <Image
                                        source={{ uri: `data:image/png;base64,${item.icon}` }}
                                        style={styles.appIcon}
                                    />
                                ) : (
                                    <View style={[styles.appIcon, { backgroundColor: colors.primary }]} />
                                )}
                                <Text style={styles.appLabel} numberOfLines={1}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>

                {/* Emergency Key Section */}
                {/* Custom Modal for No Keys */}
                {showNoKeyModal && (
                    <View style={StyleSheet.absoluteFillObject}>
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowNoKeyModal(false)}
                        />
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalIcon}>🔒</Text>
                                <Text style={styles.modalTitle}>No Keys Available</Text>
                                <Text style={styles.modalMessage}>
                                    You have used up your emergency key. You cannot exit this session until the timer runs out.
                                </Text>
                                {keyRegenTime ? (
                                    <View style={styles.regenBadge}>
                                        <Text style={styles.regenText}>Next Key: {keyRegenTime}</Text>
                                    </View>
                                ) : null}
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => setShowNoKeyModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}

                {/* Emergency Key Section */}
                {/* Emergency Exit Button Container */}
                <View style={styles.bottomControls}>
                    <Pressable
                        onPress={handleEmergencyExit}
                        style={[styles.smallExitButton, emergencyKeys === 0 && styles.smallExitButtonDisabled]}
                    >
                        <Text style={styles.exitIconSmall}>{emergencyKeys > 0 ? '🚨' : '🔒'}</Text>
                        <Text style={[styles.exitTextSmall, emergencyKeys === 0 && { color: 'rgba(255,255,255,0.5)' }]}>
                            {emergencyKeys > 0 ? 'Emergency Exit' : 'Emergency Exit'}
                        </Text>
                        <View style={[styles.miniBadge, emergencyKeys === 0 && styles.miniBadgeDisabled]}>
                            <Text style={styles.miniBadgeText}>{emergencyKeys}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,59,48,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
        marginRight: 8,
    },
    liveText: {
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    currentTimeContainer: {
        alignItems: 'flex-end',
    },
    currentTimeLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        marginBottom: 2,
    },
    currentTime: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '800',
    },
    timerSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    timerLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 24,
        fontWeight: '600',
    },
    digitalTimer: {
        fontSize: 72,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -2,
        textShadowColor: '#FF6B6B',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    progressBarContainer: {
        width: '80%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        marginTop: 32,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF6B6B',
        borderRadius: 4,
    },
    appsSection: {
        flex: 1,
        paddingTop: 20,
    },
    appsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    appsList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    appItem: {
        alignItems: 'center',
        width: 80,
    },
    appIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    appLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontWeight: '600',
    },
    keySection: {
        marginHorizontal: 24,
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    keyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    keySectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    keyBadge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    keyBadgeEmpty: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    keyBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    keyBadgeTextEmpty: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '800',
    },
    keyDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 20,
        marginBottom: 16,
    },
    exitButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    exitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12,
    },
    exitIcon: {
        fontSize: 20,
    },
    exitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    },
    noKeyButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    noKeyIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    noKeyText: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
    },
    regenTimer: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 6,
        fontWeight: '600',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 100,
    },
    modalContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 101,
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#1E1E2E',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.3)',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    modalIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    regenBadge: {
        backgroundColor: 'rgba(255,107,107,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.3)',
    },
    regenText: {
        color: '#FF6B6B',
        fontSize: 13,
        fontWeight: '700',
    },
    closeButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 16,
    },
    closeButtonText: {
        color: '#1A1A2E',
        fontWeight: '800',
        fontSize: 16,
    },
    bottomControls: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40,
        paddingTop: 20,
    },
    smallExitButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF3B30',
        gap: 8,
    },
    smallExitButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    exitIconSmall: {
        fontSize: 16,
    },
    exitTextSmall: {
        color: '#FF6B6B',
        fontWeight: '700',
        fontSize: 14,
    },
    miniBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 4,
    },
    miniBadgeDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    miniBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
