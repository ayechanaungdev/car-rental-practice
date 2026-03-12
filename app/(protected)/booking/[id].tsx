import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-typography-900 font-bold text-xl">Booking Details</Text>
      <Text className="text-typography-500 mt-2">Booking ID: {id}</Text>
    </View>
  );
}
