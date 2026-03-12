import { useAuthStore } from '@/store/useAuthStore';
import { Redirect } from 'expo-router';

export default function Index() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Wait for auth to initialize
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  // Both renters and owners go to the same (tabs) layout.
  // The tab layout handles showing/hiding tabs based on role.
  return <Redirect href="/(tabs)" />;
}
