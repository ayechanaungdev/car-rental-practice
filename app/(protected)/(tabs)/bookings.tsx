import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function BookingsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-typography-900 font-bold text-xl">My Bookings</Text>
      <Pressable
        className="mt-4 px-4 py-2 bg-brand-700 rounded-lg"
        onPress={() => router.push('/booking/test-booking-id')}
      >
        <Text className="text-white font-bold">View Test Booking →</Text>
      </Pressable>
    </View>
  );
}