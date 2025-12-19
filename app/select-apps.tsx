import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppCard from '../components/AppCard';
import * as AppBlocker from '../modules/app-blocker';
import { AppInfo } from '../modules/app-blocker';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

export default function SelectAppsScreen() {
    const { duration } = useLocalSearchParams<{ duration: string }>();
    const { defaultAllowedApps } = useSettingsStore();
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const [lockedApps, setLockedApps] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialerPackage, setDialerPackage] = useState('');
    const [settingsPackage, setSettingsPackage] = useState('');
    const startSession = useSessionStore((state) => state.startSession);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        loadApps();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadApps = async () => {
        try {
            const installedApps = await AppBlocker.getApps();

            let dialer = '';
            // @ts-ignore
            if (AppBlocker.getDefaultDialerPackage) {
                // @ts-ignore
                dialer = AppBlocker.getDefaultDialerPackage();
            }
            setDialerPackage(dialer);

            const settingsApp = installedApps.find(app =>
                app.packageName.includes('settings') &&
                !app.packageName.includes('com.opyas.blockitclone')
            );
            const settingsPkg = settingsApp?.packageName || '';
            setSettingsPackage(settingsPkg);

            const userApps = installedApps.filter(app =>
                !app.isSystem && app.packageName !== settingsPkg
            );
            setApps(userApps.sort((a, b) => a.label.localeCompare(b.label)));

            const initialSelected = new Set<string>([
                ...defaultAllowedApps,
                'com.opyas.blockitclone'
            ]);

            if (dialer) {
                initialSelected.add(dialer);
            }

            setSelectedApps(initialSelected);

            const locked = new Set<string>(['com.opyas.blockitclone']);
            if (dialer) {
                locked.add(dialer);
            }
            setLockedApps(locked);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleApp = (packageName: string) => {
        if (lockedApps.has(packageName)) {
            return;
        }

        const newSet = new Set(selectedApps);
        if (newSet.has(packageName)) {
            newSet.delete(packageName);
            setSelectedApps(newSet);
        } else {
            let count = 0;
            newSet.forEach(p => {
                if (p !== dialerPackage && p !== 'com.opyas.blockitclone') {
                    count++;
                }
            });

            const isExempt = packageName === dialerPackage || packageName === 'com.opyas.blockitclone';

            if (!isExempt && count >= 6) {
                Alert.alert("Limit Reached", "You can only select up to 6 apps (excluding Phone and Focused).");
                return;
            }

            newSet.add(packageName);
            setSelectedApps(newSet);
        }
    };

    const handleStartSession = () => {
        const hasOverlayPermission = AppBlocker.checkOverlayPermission();
        const hasUsageStatsPermission = AppBlocker.checkUsageStatsPermission();

        if (!hasOverlayPermission || !hasUsageStatsPermission) {
            Alert.alert(
                "Permissions Required",
                "To block apps effectively, Focused needs special permissions.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Grant Permissions",
                        onPress: () => router.push('/permissions')
                    }
                ]
            );
            return;
        }

        const durationMs = parseInt(duration || '30', 10) * 60 * 1000;
        // const endTime = Date.now() + durationMs; // Not needed for passing to module anymore

        const finalAllowedApps = new Set<string>([
            ...selectedApps,
            ...defaultAllowedApps,
            'com.opyas.blockitclone'
        ]);

        if (dialerPackage) {
            finalAllowedApps.add(dialerPackage);
        }

        const allowedArray = Array.from(finalAllowedApps);

        startSession(durationMs, allowedArray);
        AppBlocker.startBlocking(allowedArray, durationMs);
        router.replace('/session');
    };

    const filteredApps = apps.filter(app =>
        app.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const durationMins = parseInt(duration || '30', 10);
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    if (loading) {
        return (
            <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Loading apps...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.title}>Choose Your Apps</Text>
                            <Text style={styles.subtitle}>for {timeText} of focused time ⚡</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>⏱ {timeText}</Text>
                        </View>
                    </View>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search apps..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{selectedApps.size}</Text>
                            <Text style={styles.statLabel}>Allowed</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{apps.length - selectedApps.size}</Text>
                            <Text style={styles.statLabel}>Blocked</Text>
                        </View>
                        <View style={[styles.statBox, { borderColor: '#FF6B6B' }]}>
                            <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                                {apps.length > 0 ? Math.round((selectedApps.size / apps.length) * 100) : 0}%
                            </Text>
                            <Text style={styles.statLabel}>Focus</Text>
                        </View>
                    </View>
                </View>

                {/* Apps Grid */}
                <FlatList
                    data={filteredApps}
                    keyExtractor={(item) => item.packageName}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isLocked = lockedApps.has(item.packageName);
                        const isSelected = selectedApps.has(item.packageName);

                        return (
                            <AppCard
                                label={item.label + (isLocked ? ' 🔒' : '')}
                                packageName={item.packageName}
                                icon={item.icon}
                                isSelected={isSelected}
                                onToggle={() => toggleApp(item.packageName)}
                            />
                        );
                    }}
                />

                {/* Bottom Action Button */}
                <View style={styles.bottomContainer}>
                    <Pressable onPress={handleStartSession} style={styles.startButton}>
                        <LinearGradient
                            colors={['#FF6B6B', '#FF8E53']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.startGradient}
                        >
                            <Text style={styles.startIcon}>🚀</Text>
                            <View>
                                <Text style={styles.startText}>Start Focus Mode</Text>
                                <Text style={styles.startSubtext}>{selectedApps.size} apps allowed</Text>
                            </View>
                        </LinearGradient>
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFF',
        marginTop: 16,
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        fontWeight: '500',
    },
    timeBadge: {
        backgroundColor: 'rgba(255,107,107,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    timeBadgeText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '700',
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 14,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 120,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 12,
        backgroundColor: 'rgba(15,12,41,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    startButton: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startGradient: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
        gap: 16,
    },
    startIcon: {
        fontSize: 28,
    },
    startText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    startSubtext: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
        fontWeight: '600',
    },
});
