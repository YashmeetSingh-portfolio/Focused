import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
interface AnalogClockProps {
    size?: number;

}
export default function AnalogClock({ size = 200 }: AnalogClockProps) {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const secondAngle = (seconds * 6) - 90;
    const minuteAngle = (minutes * 6 + seconds * 0.1) - 90;
    const hourAngle = (hours * 30 + minutes * 0.5) - 90;
    const center = size / 2;
    const radius = size / 2 - 10;
    const getLineEnd = (angle: number, length: number) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: center + length * Math.cos(rad),
            y: center + length * Math.sin(rad),
        };
    };
    const hourEnd = getLineEnd(hourAngle, radius * 0.5);
    const minuteEnd = getLineEnd(minuteAngle, radius * 0.7);
    const secondEnd = getLineEnd(secondAngle, radius * 0.9);
    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                    {/* Clock face */}
                <Circle cx={center} cy={center} r={radius} stroke="#333" strokeWidth="4" fill="none" />
                {/* Hour markers */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) - 90;
                    const innerPoint = getLineEnd(angle, radius * 0.85);
                    const outerPoint = getLineEnd(angle, radius * 0.95);
                    return (
                        <Line
                            key={i}
                            x1={innerPoint.x}
                            y1={innerPoint.y}
                            x2={outerPoint.x}
                            y2={outerPoint.y}
                            stroke="#666"
                            strokeWidth="3"
                        />
                    );
                })}

                <Line
                    x1={center}
                    y1={center}
                    x2={hourEnd.x}
                    y2={hourEnd.y}
                    stroke="#000"
                    strokeWidth="6"
                    strokeLinecap="round"
                />

                <Line
                    x1={center}
                    y1={center}
                    x2={minuteEnd.x}
                    y2={minuteEnd.y}
                    stroke="#333"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                <Line
                    x1={center}
                    y1={center}
                    x2={secondEnd.x}
                    y2={secondEnd.y}
                    stroke="#FF6B35"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <Circle cx={center} cy={center} r="6" fill="#FF6B35" />
            </Svg>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});