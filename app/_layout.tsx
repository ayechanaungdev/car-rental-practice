import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router'; // Added router & segments
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initialize, isLoading, session } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState(); // 👈 NEW: detect if Root Stack is loaded

  // 1. Wake up the Brain when the app starts!
  useEffect(() => {
    initialize();
  }, []);

  // 2. 🛡️ The Global Guard logic
  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return; // Wait until router is ready


    // Check where the user is trying to go
    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // 🛑 Not logged in? Force to Login!
      router.replace('/auth/login');
    } else if (session) {
      // ✅ Logged in?
      const inCompleteProfile = segments.join('/') === 'auth/complete-profile';

      if (!inCompleteProfile && (inAuthGroup || segments[0] === undefined)) {
        // If they are logged in and trying to go to login/signup or the root index, teleport them to home!
        router.replace('/(protected)/(tabs)');
      }
    }
  }, [session, isLoading, segments, rootNavigationState?.key]);

  // 3. Show a loading screen if the Brain is thinking
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
