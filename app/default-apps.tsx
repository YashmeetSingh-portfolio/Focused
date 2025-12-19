import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import * as AppBlocker from '../modules/app-blocker';
import { AppInfo } from '../modules/app-blocker';
import { useSettingsStore } from '../store/settingsStore';

export default function DefaultAppsScreen() {
    const { defaultAllowedApps, addDefaultAllowedApp, removeDefaultAllowedApp } = useSettingsStore();
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialerPackage, setDialerPackage] = useState<string>('');

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            const installedApps = await AppBlocker.getApps();
            installedApps.sort((a, b) => a.label.localeCompare(b.label));

            // Get default dialer (Check if function exists for safety on older builds)
            let dialer = '';
            // @ts-ignore
            if (AppBlocker.getDefaultDialerPackage) {
                // @ts-ignore
                dialer = AppBlocker.getDefaultDialerPackage();
            } else {
                console.warn("getDefaultDialerPackage not found. Please rebuild android app.");
            }
            setDialerPackage(dialer);

            if (dialer && !defaultAllowedApps.includes(dialer)) {
                addDefaultAllowedApp(dialer);
            }

            setApps(installedApps);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleApp = (packageName: string) => {
        if (packageName === dialerPackage) return;

        if (defaultAllowedApps.includes(packageName)) {
            removeDefaultAllowedApp(packageName);
        } else {
            const nonExemptApps = defaultAllowedApps.filter(p =>
                p !== dialerPackage && p !== 'com.opyas.blockitclone'
            );

            if (nonExemptApps.length >= 6) {
                Alert.alert("Limit Reached", "You can only select up to 6 apps (excluding Phone and Blockit Clone).");
                return;
            }
            addDefaultAllowedApp(packageName);
        }
    };

    return (
        <LinearGradient colors={[colors.darker, colors.dark]} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <Text style={typography.h2}>Default Allowed Apps</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={apps}
                    keyExtractor={(item) => item.packageName}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const isSelected = defaultAllowedApps.includes(item.packageName);
                        const isLocked = item.packageName === dialerPackage;

                        return (
                            <Pressable
                                onPress={() => toggleApp(item.packageName)}
                                style={[
                                    styles.item,
                                    isSelected && styles.itemSelected,
                                    isLocked && styles.itemLocked
                                ]}
                            >
                                <View style={styles.itemLeft}>
                                    {item.icon ? (
                                        <Image
                                            source={{ uri: `data:image/png;base64,${item.icon}` }}
                                            style={styles.icon}
                                        />
                                    ) : (
                                        <View style={[styles.icon, { backgroundColor: colors.gray }]} />
                                    )}
                                    <Text style={[styles.label, isLocked && { color: colors.secondary }]}>
                                        {item.label} {isLocked && "(Phone)"}
                                    </Text>
                                </View>
                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </Pressable>
                        );
                    }}
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    backButton: {
        marginRight: spacing.md,
        padding: spacing.xs,
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
    },
    listContent: {
        padding: spacing.md,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: spacing.xs,
        borderRadius: 12,
    },
    itemSelected: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    itemLocked: {
        opacity: 0.8,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
    },
    label: {
        ...typography.body,
        fontSize: 14,
        color: colors.white,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.gray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    checkmark: {
        color: colors.darker,
        fontSize: 12,
        fontWeight: 'bold',
    },
});
