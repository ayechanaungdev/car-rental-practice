import { useAuthStore } from '@/store/useAuthStore';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { session, isLoading, profile, getIsProfileIncomplete } = useAuthStore();
  const router = useRouter();

  // Robustly handle redirection when the profile completes its background fetch
  useEffect(() => {
    if (isLoading || (session && profile === null)) return; // Still loading

    if (!session) {
      router.replace('/auth/login');
    } else if (getIsProfileIncomplete()) {
      router.replace('/auth/complete-profile');
    }
  }, [session, isLoading, profile]);

  // Return loader while locked
  if (isLoading || (session && profile === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a8e3" />
      </View>
    );
  }

  // Prevent flicker during redirect
  if (!session || getIsProfileIncomplete()) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(home)" />
      <Stack.Screen
        name="booking/[id]"
        options={{
          headerShown: true,
          title: 'Booking Details',
          headerTintColor: '#16a8e3'
        }}
      />
      <Stack.Screen
        name="car/[id]"
        options={{
          headerShown: true,
          title: 'Car Details',
          headerTintColor: '#16a8e3'
        }}
      />
    </Stack>
  );
}
