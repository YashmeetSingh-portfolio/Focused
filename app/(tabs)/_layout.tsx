import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { useUIStore } from '../../store/uiStore';

function CustomTabBar({ state, descriptors, navigation, startSession }: any) {
  return (
    <View style={styles.tabbarContainer}>
      <View style={styles.pillContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            >
              {route.name === 'index' ? (
                <Text style={[styles.icon, isFocused && styles.iconFocused]}>⏱️</Text>
              ) : (
                <Text style={[styles.icon, isFocused && styles.iconFocused]}>⚙️</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={startSession} style={styles.playButton}>
        <Text style={styles.playIcon}>▶</Text>
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { duration } = useUIStore();

  const handleStart = () => {
    router.push({ pathname: '/select-apps', params: { duration: duration.toString() } });
  };

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} startSession={handleStart} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timer' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabbarContainer: {
    position: 'absolute',
    bottom: 30, // Lifted up
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 32,
    padding: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemFocused: {
    backgroundColor: colors.darker,
  },
  icon: {
    fontSize: 20,
    opacity: 0.4,
    color: colors.darker,
  },
  iconFocused: {
    opacity: 1,
    color: colors.white,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.darker,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  playIcon: {
    color: colors.white,
    fontSize: 20,
    marginLeft: 4,
  }
});
