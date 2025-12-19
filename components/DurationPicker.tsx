import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { colors } from '../constants/theme';

interface DurationPickerProps {
    duration: number;
    onDurationChange: (duration: number) => void;
    height: number;
}

const MAX_DURATION = 180; // 3 hours on the slider

export default function DurationPicker({ duration, onDurationChange, height }: DurationPickerProps) {
    // Map duration to height
    // visualHeight = (duration / MAX_DURATION) * height

    // We want to handle gestures to change duration
    // One pixel = roughly 0.5 minute? or simply map 0-100% of height to 0-MAX_DURATION

    const prevDuration = useSharedValue(duration);

    const pan = Gesture.Pan()
        .onStart(() => {
            prevDuration.value = duration;
        })
        .onUpdate((event) => {
            // Dragging UP should increase duration (negative translationY)
            // Dragging DOWN should decrease duration (positive translationY)

            // value change = -event.translationY / pixelsPerMinute
            // Let's say full height = MAX_DURATION minutes
            const pixelsPerMinute = height / MAX_DURATION;
            const minutesChange = -event.translationY / pixelsPerMinute;

            let newDuration = Math.round(prevDuration.value + minutesChange);
            newDuration = Math.max(1, Math.min(MAX_DURATION, newDuration));

            if (newDuration !== duration) {
                runOnJS(onDurationChange)(newDuration);
            }
        })
        .onEnd(() => {
            runOnJS(Haptics.selectionAsync)();
        });

    const fillHeight = Math.min(height, Math.max(0, (duration / MAX_DURATION) * height));

    return (
        <GestureDetector gesture={pan}>
            <View style={[styles.container, { height }]}>
                {/* Background Track */}
                <View style={styles.track} />

                {/* Fill Bar */}
                <View style={[styles.fill, { height: fillHeight }]} />

                {/* Thumb/Indicator */}
                <View style={[styles.thumb, { bottom: fillHeight - 10 }]} />

                {/* Labels/Ticks can be added here */}
                <View style={styles.labels}>
                    <Text style={styles.label}>{Math.floor(duration)}m</Text>
                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    track: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    fill: {
        width: '100%',
        backgroundColor: colors.primary,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    thumb: {
        position: 'absolute',
        width: '100%',
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
    labels: {
        position: 'absolute',
        top: 10,
        width: '100%',
        alignItems: 'center',
    },
    label: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    }
});
