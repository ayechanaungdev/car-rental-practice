import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-typography-900 font-bold text-xl">Car Details</Text>
      <Text className="text-typography-500 mt-2">Car ID: {id}</Text>
    </View>
  );
}
