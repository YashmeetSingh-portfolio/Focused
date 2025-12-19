import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

export default function SettingsScreen() {
    const {
        isDarkTheme,
        isHapticEnabled,
        isAnalogClock,
        emergencyKeys,
        lastKeyUsedTimestamp,
        toggleDarkTheme,
        toggleHaptic,
        toggleClockType
    } = useSettingsStore();

    return (
        <LinearGradient colors={[colors.darker, colors.dark]} style={styles.container}>
            <View style={styles.content}>
                <Text style={[typography.h1, styles.title]}>Settings</Text>

                <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Dark Mode */}
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={typography.h2}>Dark Theme</Text>
                            <Text style={styles.settingDesc}>Use dark colors for the UI</Text>
                        </View>
                        <Switch
                            value={isDarkTheme}
                            onValueChange={toggleDarkTheme}
                            trackColor={{ false: colors.gray, true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>

                    {/* Haptics */}
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={typography.h2}>Haptic Feedback</Text>
                            <Text style={styles.settingDesc}>Vibration on interaction</Text>
                        </View>
                        <Switch
                            value={isHapticEnabled}
                            onValueChange={toggleHaptic}
                            trackColor={{ false: colors.gray, true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>

                    {/* Clock Type */}
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={typography.h2}>Analog Clock</Text>
                            <Text style={styles.settingDesc}>Use analog clock in session screen</Text>
                        </View>
                        <Switch
                            value={isAnalogClock}
                            onValueChange={toggleClockType}
                            trackColor={{ false: colors.gray, true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>

                    {/* Emergency Keys Info */}
                    <View style={styles.infoSection}>
                        <Text style={[typography.h2, { marginBottom: 8 }]}>Emergency Keys 🔑</Text>
                        <View style={styles.keyInfoBox}>
                            <View style={styles.keyInfoRow}>
                                <Text style={styles.keyInfoLabel}>Available Keys:</Text>
                                <Text style={styles.keyInfoValue}>{emergencyKeys}</Text>
                            </View>
                            {emergencyKeys === 0 && lastKeyUsedTimestamp && (
                                <View style={styles.keyInfoRow}>
                                    <Text style={styles.keyInfoLabel}>Next Key In:</Text>
                                    <Text style={[styles.keyInfoValue, { color: colors.primary }]}>
                                        {(() => {
                                            const twentyFourHours = 24 * 60 * 60 * 1000;
                                            const timeUntilRegen = twentyFourHours - (Date.now() - lastKeyUsedTimestamp);
                                            if (timeUntilRegen > 0) {
                                                const hoursLeft = Math.floor(timeUntilRegen / (1000 * 60 * 60));
                                                const minsLeft = Math.floor((timeUntilRegen % (1000 * 60 * 60)) / (1000 * 60));
                                                return `${hoursLeft}h ${minsLeft}m`;
                                            }
                                            return 'Soon';
                                        })()}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.keyInfoDescription}>
                            Emergency keys allow you to exit a session early. You get 1 key, and  after using it, the next key regenerates in 24 hours.
                        </Text>
                    </View>

                    {/* Default Allowed Apps */}
                    <Pressable
                        style={styles.linkRow}
                        onPress={() => router.push('/default-apps')}
                    >
                        <View>
                            <Text style={typography.h2}>Default Allowed Apps</Text>
                            <Text style={styles.settingDesc}>Select apps always allowed by default</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>

                </ScrollView>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl + 20,
    },
    title: {
        marginBottom: spacing.xl,
    },
    scroll: {
        flex: 1,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    settingDesc: {
        fontSize: 12,
        color: colors.lightGray,
        marginTop: 2,
    },
    infoSection: {
        marginTop: 24,
        marginBottom: 12,
    },
    keyInfoBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    keyInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    keyInfoLabel: {
        ...typography.body,
        fontSize: 14,
    },
    keyInfoValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.white,
    },
    keyInfoDescription: {
        fontSize: 13,
        color: colors.lightGray,
        lineHeight: 20,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    arrow: {
        fontSize: 24,
        color: colors.lightGray,
    }
});
