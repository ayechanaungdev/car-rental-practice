import { useAuthStore } from '@/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function ProtectedLayout() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
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
