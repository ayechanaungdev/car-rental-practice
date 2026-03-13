import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function TestComponent() {
  const { initialize, session } = useAuthStore();
  
  useEffect(() => {
    initialize(); // Wake up the Brain manually
  }, []);

  if (session) {
    console.log("✅ Checkpoint 1: Brain is awake! Session found for:", session.user.email);
  } else {
    console.log("❌ Checkpoint 1: Brain is awake, but no session found (User is logged out).");
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Brain Test Active: Check Console Logs</Text>
      {session && <Text>Logged in as: {session.user.email}</Text>}
    </View>
  );
}
