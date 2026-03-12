import { Tabs } from 'expo-router';
import { Calendar, Car, Heart, Home, MessageSquare, Users } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  // TODO: Later, use useAuthStore() to detect role and dynamically:
  //   - Switch title/icon: 'Dashboard' + LayoutDashboard (owner) vs 'Cars' + Home (renter)
  //   - Show/hide owner-only tabs (My Cars, Drivers) using href: null
  //   - Show/hide Wishlist tab for renters only
  //   - Add custom header with avatar (→ Profile), search, and notification icons

  return (
    <Tabs screenOptions={{ 
      headerShown: true, 
      tabBarActiveTintColor: '#16a8e3', // brand-700
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ title: 'Bookings', tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{ title: 'Chat history', tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="owner_cars" 
        options={{ title: 'My Cars', tabBarIcon: ({ color }) => <Car color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="drivers" 
        options={{ title: 'Drivers', tabBarIcon: ({ color }) => <Users color={color} size={24} /> }} 
      />
      <Tabs.Screen 
        name="wishlist" 
        options={{ title: 'Wishlist', tabBarIcon: ({ color }) => <Heart color={color} size={24} /> }} 
      />
    </Tabs>
  );
}
