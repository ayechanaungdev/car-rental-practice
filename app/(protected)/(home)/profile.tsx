import { useAuthStore } from '@/store/useAuthStore'; // Adjust path if needed
import { Button, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut } = useAuthStore();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-typography-900 font-bold text-xl">User Profile</Text>
      <Button title="Log Out" onPress={signOut} color="#EF4444" />
    </View>
  );
}
