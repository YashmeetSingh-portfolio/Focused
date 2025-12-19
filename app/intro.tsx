import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import * as AppBlocker from '../modules/app-blocker';
import { useOnboardingStore } from '../store/onboardingStore';

const { width } = Dimensions.get('window');

export default function IntroScreen() {
    const [step, setStep] = useState(0);
    const { completeOnboarding } = useOnboardingStore();
    const fadeAnim = useState(new Animated.Value(1))[0];
    const [permissions, setPermissions] = useState({ overlay: false, usage: false, admin: false });

    useEffect(() => {
        const interval = setInterval(checkPermissions, 1000);
        return () => clearInterval(interval);
    }, []);

    const checkPermissions = () => {
        const overlay = AppBlocker.checkOverlayPermission();
        const usage = AppBlocker.checkUsageStatsPermission();
        const admin = AppBlocker.checkAdminPermission();
        setPermissions({ overlay, usage, admin });
    };

    const nextStep = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setStep(step + 1);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleFinish = () => {
        completeOnboarding();
        router.replace('/');
    };

    const renderWelcome = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🛡️</Text>
            <Text style={styles.title}>Welcome to Focused</Text>
            <Text style={styles.description}>
                Reclaim your focus. Minimize distractions and win back your time with deep focus sessions.
            </Text>
            <Pressable onPress={nextStep} style={styles.primaryButton}>
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </LinearGradient>
            </Pressable>
        </View>
    );

    const renderPermissions = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🔑</Text>
            <Text style={styles.title}>Essential Permissions</Text>
            <Text style={styles.description}>
                Focused needs these permissions to effectively lock distracting apps and prevent unauthorized uninstallation.
            </Text>

            <View style={styles.permissionList}>
                <View style={[styles.permissionItem, permissions.overlay && styles.permissionGranted]}>
                    <View style={styles.permissionInfo}>
                        <Text style={styles.permissionLabel}>Overlay Permission</Text>
                        <Text style={styles.permissionSublabel}>To show the focus screen over other apps</Text>
                    </View>
                    <Pressable
                        onPress={permissions.overlay ? undefined : AppBlocker.requestOverlayPermission}
                        style={[styles.smallButton, permissions.overlay && styles.smallButtonDisabled]}
                    >
                        <Text style={styles.smallButtonText}>{permissions.overlay ? '✓' : 'Grant'}</Text>
                    </Pressable>
                </View>

                <View style={[styles.permissionItem, permissions.usage && styles.permissionGranted]}>
                    <View style={styles.permissionInfo}>
                        <Text style={styles.permissionLabel}>Usage Access</Text>
                        <Text style={styles.permissionSublabel}>To detect when a blocked app is opened</Text>
                    </View>
                    <Pressable
                        onPress={permissions.usage ? undefined : AppBlocker.requestUsageStatsPermission}
                        style={[styles.smallButton, permissions.usage && styles.smallButtonDisabled]}
                    >
                        <Text style={styles.smallButtonText}>{permissions.usage ? '✓' : 'Grant'}</Text>
                    </Pressable>
                </View>

                <View style={[styles.permissionItem, permissions.admin && styles.permissionGranted]}>
                    <View style={styles.permissionInfo}>
                        <Text style={styles.permissionLabel}>Uninstall Protection</Text>
                        <Text style={styles.permissionSublabel}>Requires Device Admin permission</Text>
                    </View>
                    <Pressable
                        onPress={permissions.admin ? undefined : AppBlocker.requestAdminPermission}
                        style={[styles.smallButton, permissions.admin && styles.smallButtonDisabled]}
                    >
                        <Text style={styles.smallButtonText}>{permissions.admin ? '✓' : 'Grant'}</Text>
                    </Pressable>
                </View>
            </View>

            <Pressable
                onPress={handleFinish}
                disabled={!permissions.overlay || !permissions.usage || !permissions.admin}
                style={[styles.primaryButton, (!permissions.overlay || !permissions.usage || !permissions.admin) && styles.buttonDisabled]}
            >
                <LinearGradient
                    colors={(!permissions.overlay || !permissions.usage || !permissions.admin) ? [colors.gray, colors.dark] : [colors.success, '#229954']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                    <Text style={styles.buttonText}>Start Focusing</Text>
                </LinearGradient>
            </Pressable>
        </View>
    );

    return (
        <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {step === 0 ? renderWelcome() : renderPermissions()}
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        paddingHorizontal: spacing.xl,
    },
    stepContainer: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        fontSize: 32,
        marginBottom: spacing.md,
        color: colors.white,
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: spacing.xxl,
    },
    permissionList: {
        width: '100%',
        marginBottom: spacing.xxl,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    permissionGranted: {
        borderColor: colors.success,
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
    },
    permissionInfo: {
        flex: 1,
    },
    permissionLabel: {
        ...typography.h3,
        color: colors.white,
        fontSize: 16,
    },
    permissionSublabel: {
        ...typography.body,
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
    smallButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
    },
    smallButtonDisabled: {
        backgroundColor: colors.success,
    },
    smallButtonText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 12,
    },
    primaryButton: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        ...typography.h2,
        fontSize: 18,
        color: colors.white,
    },
});
