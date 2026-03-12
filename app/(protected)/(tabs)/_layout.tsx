import { useAuthStore } from '@/store/useAuthStore';
import { router, Tabs } from 'expo-router';
import {
  Bell,
  Calendar,
  Car,
  Heart,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search,
  Users
} from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

export default function TabLayout() {
  // IMPLEMENTED: use useAuthStore() to detect role and dynamically:
  //   - Switch title/icon: 'Dashboard' + LayoutDashboard (owner) vs 'Cars' + Home (renter)
  //   - Show/hide owner-only tabs (My Cars, Drivers) using href: null
  //   - Show/hide Wishlist tab for renters only
  //   - Add custom header with avatar (→ Profile), search, and notification icons
  const { user, role } = useAuthStore();
  const isOwner = role === 'owner';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#16a8e3', // brand-700
      headerTitle: '', // Clean look — no title text
      headerLeft: () => (
        <Pressable className="ml-4" onPress={() => router.push('/(home)/profile')}>
          <Image 
            source={{ uri: user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32' }} 
            className="w-8 h-8 rounded-full bg-gray-200" 
          />
        </Pressable>
      ),
      headerRight: () => (
        <View className="flex-row mr-4 gap-4">
          <Pressable onPress={() => router.push('/(home)/search')}>
            <Search size={22} color="#16a8e3" />
          </Pressable>
          <Pressable onPress={() => router.push('/(home)/notifications')}>
            <Bell size={22} color="#16a8e3" />
          </Pressable>
        </View>
      ),
    }}>
      {/* === Shared Tabs (both roles) === */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: isOwner ? 'Dashboard' : 'Dashboard',
          tabBarIcon: ({ color }) => isOwner 
            ? <LayoutDashboard color={color} size={24} /> 
            : <Home color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ title: 'Bookings', tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> }} 
      />

      {/* === Renter-only Tab === */}
      <Tabs.Screen 
        name="wishlist" 
        options={{ 
          title: 'Wishlist', 
          href: isOwner ? null : '/wishlist',
          tabBarIcon: ({ color }) => <Heart color={color} size={24} /> 
        }} 
      />

      {/* === Shared Tab === */}
      <Tabs.Screen 
        name="messages" 
        options={{ title: 'Chat history', tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }} 
      />

      {/* === Owner-only Tabs === */}
      <Tabs.Screen 
        name="owner_cars" 
        options={{ 
          title: 'My Cars', 
          href: isOwner ? '/owner_cars' : null,
          tabBarIcon: ({ color }) => <Car color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="drivers" 
        options={{ 
          title: 'Drivers', 
          href: isOwner ? '/drivers' : null,
          tabBarIcon: ({ color }) => <Users color={color} size={24} /> 
        }} 
      />
    </Tabs>
  );
}
