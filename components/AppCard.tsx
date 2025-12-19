import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface AppCardProps {
    label: string;
    packageName: string;
    icon?: string;
    isSelected: boolean;
    onToggle: () => void;
}

export default function AppCard({ label, packageName, icon, isSelected, onToggle }: AppCardProps) {
    return (
        <Pressable onPress={onToggle} style={styles.container}>
            <View style={[styles.card, isSelected && styles.cardSelected]}>
                {/* App Icon */}
                <View style={styles.iconContainer}>
                    {icon ? (
                        <Image
                            source={{ uri: `data:image/png;base64,${icon}` }}
                            style={styles.icon}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.iconFallback}>
                            <Text style={styles.iconText}>{label.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                        <View style={styles.selectedBadge}>
                            <Text style={styles.selectedIcon}>✓</Text>
                        </View>
                    )}
                </View>

                {/* App Label */}
                <Text style={styles.label} numberOfLines={1}>{label}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: 10,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardSelected: {
        backgroundColor: 'rgba(255,107,107,0.15)',
        borderColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    icon: {
        width: 56,
        height: 56,
        borderRadius: 14,
    },
    iconFallback: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    selectedBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0F0C29',
    },
    selectedIcon: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    label: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
});
