import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as AppBlocker from '../modules/app-blocker';
import { useOnboardingStore } from '../store/onboardingStore';
import { useSessionStore } from '../store/sessionStore';

export default function Layout() {
  const router = useRouter();
  const { isActive, allowedApps, endTime, stopSession } = useSessionStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  useEffect(() => {
    const initApp = async () => {
      // 1. Check Onboarding first
      if (!hasCompletedOnboarding) {
        setTimeout(() => router.replace('/intro'), 100);
        return;
      }

      // 2. If onboarding complete, check for active session
      if (isActive && endTime) {
        if (Date.now() < endTime) {
          const hasPermissions = AppBlocker.checkOverlayPermission() && AppBlocker.checkUsageStatsPermission();

          if (hasPermissions) {
            const remainingDuration = Math.max(0, endTime - Date.now());
            AppBlocker.startBlocking(allowedApps, remainingDuration);
            setTimeout(() => router.replace('/session'), 100);
          } else {
            router.replace('/permissions');
          }
        } else {
          stopSession();
          AppBlocker.stopBlocking();
        }
      }
    };

    initApp();
  }, [isActive, hasCompletedOnboarding]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
