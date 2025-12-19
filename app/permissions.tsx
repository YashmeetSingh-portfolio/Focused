import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import * as AppBlocker from '../modules/app-blocker';

export default function PermissionsScreen() {
    const [permissions, setPermissions] = useState({ overlay: false, usage: false });

    useEffect(() => {
        const interval = setInterval(checkPermissions, 1000);
        checkPermissions();
        return () => clearInterval(interval);
    }, []);

    const checkPermissions = () => {
        const overlay = AppBlocker.checkOverlayPermission();
        const usage = AppBlocker.checkUsageStatsPermission();
        setPermissions({ overlay, usage });
    };

    const allGranted = permissions.overlay && permissions.usage;

    return (
        <LinearGradient colors={[colors.darker, colors.dark]} style={styles.container}>
            <View style={styles.content}>
                <Text style={typography.h1}>Permissions Required</Text>
                <Text style={[typography.body, { marginTop: spacing.md, marginBottom: spacing.xl }]}>
                    Focused needs these permissions to function properly:
                </Text>

                {/* Overlay Permission */}
                <View style={styles.permissionCard}>
                    <LinearGradient
                        colors={permissions.overlay ? [colors.success, '#229954'] : [colors.gray, colors.dark]}
                        style={styles.cardGradient}
                    >
                        <Text style={styles.cardTitle}>
                            {permissions.overlay ? '✓' : '○'} Display Over Other Apps
                        </Text>
                        <Text style={styles.cardDescription}>
                            Allows the app to show a blocking screen when you try to open restricted apps.
                        </Text>
                        {!permissions.overlay && (
                            <Pressable onPress={AppBlocker.requestOverlayPermission} style={styles.grantButton}>
                                <Text style={styles.grantButtonText}>Grant Permission</Text>
                            </Pressable>
                        )}
                    </LinearGradient>
                </View>

                {/* Usage Stats Permission */}
                <View style={styles.permissionCard}>
                    <LinearGradient
                        colors={permissions.usage ? [colors.success, '#229954'] : [colors.gray, colors.dark]}
                        style={styles.cardGradient}
                    >
                        <Text style={styles.cardTitle}>
                            {permissions.usage ? '✓' : '○'} Usage Access
                        </Text>
                        <Text style={styles.cardDescription}>
                            Allows the app to detect which app you're trying to open.
                        </Text>
                        {!permissions.usage && (
                            <Pressable onPress={AppBlocker.requestUsageStatsPermission} style={styles.grantButton}>
                                <Text style={styles.grantButtonText}>Grant Permission</Text>
                            </Pressable>
                        )}
                    </LinearGradient>
                </View>

                {allGranted && (
                    <Pressable onPress={() => router.back()} style={styles.continueButton}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.continueGradient}
                        >
                            <Text style={styles.continueText}>Continue</Text>
                        </LinearGradient>
                    </Pressable>
                )}
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
    permissionCard: {
        marginBottom: spacing.lg,
    },
    cardGradient: {
        padding: spacing.lg,
        borderRadius: 16,
    },
    cardTitle: {
        ...typography.h2,
        fontSize: 18,
        marginBottom: spacing.sm,
    },
    cardDescription: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.md,
    },
    grantButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    grantButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    continueButton: {
        marginTop: spacing.xl,
    },
    continueGradient: {
        paddingVertical: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
    },
    continueText: {
        ...typography.h2,
        fontSize: 18,
    },
});
