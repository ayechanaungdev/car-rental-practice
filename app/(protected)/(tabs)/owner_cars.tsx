import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function OwnerCarsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-typography-900 font-bold text-xl">My Listed Cars</Text>
      <Pressable
        className="mt-4 px-4 py-2 bg-brand-700 rounded-lg"
        onPress={() => router.push('/car/test-car-id')}
      >
        <Text className="text-white font-bold">View Test Car →</Text>
      </Pressable>
    </View>
  );
}
