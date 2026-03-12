import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerTintColor: '#16a8e3',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="search" options={{ title: 'Search' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
